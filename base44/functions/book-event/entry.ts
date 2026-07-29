import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { jsPDF } from 'npm:jspdf@4.0.0';
import QRCode from 'npm:qrcode@1.5.4';
import { waitUntil } from 'base44:runtime';

export default async function(req) {
  try {
    const body = await req.json();
    const { event_id, full_name, email, phone, quantity } = body;

    if (!event_id || !full_name || !email || !quantity) {
      return Response.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const event = await base44.asServiceRole.entities.Event.get(event_id);

    const resCode = 'LC-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
    const unitPrice = Number(event.price) || 0;
    const qty = Math.min(Number(quantity), 10);
    const commissionPerTicket = unitPrice > 0 ? 1 : 0;
    const commission = commissionPerTicket * qty;
    const total = (unitPrice + commissionPerTicket) * qty;

    const reservation = await base44.asServiceRole.entities.Reservation.create({
      event_id,
      event_title: event.title,
      event_date: event.date,
      full_name,
      email,
      phone: phone || '',
      quantity: qty,
      unit_price: unitPrice,
      commission,
      total,
      confirmation_code: resCode,
      status: 'confirmed'
    });

    // --- Biglietti singoli: 1 codice QR per biglietto ---
    const pad = (n) => String(n).padStart(2, '0');
    const ticketRecords = [];
    const ticketCodes = [];
    for (let i = 0; i < qty; i++) {
      const tCode = resCode + '-' + pad(i + 1);
      ticketCodes.push(tCode);
      ticketRecords.push({
        reservation_id: reservation.id,
        event_id,
        event_title: event.title,
        event_date: event.date,
        holder_name: full_name,
        code: tCode,
        seat: pad(i + 1) + '/' + pad(qty),
        status: 'valid'
      });
    }
    await base44.asServiceRole.entities.Ticket.bulkCreate(ticketRecords);

    // --- QR per ogni biglietto ---
    const qrDataUrls = await Promise.all(
      ticketCodes.map((c) =>
        QRCode.toDataURL(c, { margin: 1, width: 300, color: { dark: '#050505', light: '#D4FF00' } })
      )
    );

    // --- PDF multi-pagina: 1 pass per biglietto ---
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
      : '—';

    const drawPass = (qrData, code, seat, isFirst) => {
      if (!isFirst) doc.addPage();
      doc.setFillColor(5, 5, 5);
      doc.rect(0, 0, pageW, pageH, 'F');
      doc.setFillColor(212, 255, 0);
      doc.rect(0, 0, pageW, 6, 'F');

      doc.setTextColor(224, 224, 224);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(30);
      doc.text('LIFE CLUB', 44, 66);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(46, 91, 255);
      doc.text('DIGITAL ACCESS PASS  /  ROVETTA (BG)', 44, 80);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(34);
      doc.setTextColor(224, 224, 224);
      const titleLines = doc.splitTextToSize((event.title || 'EVENTO').toUpperCase(), pageW - 220);
      doc.text(titleLines, 44, 130);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(180, 180, 180);
      doc.text('DATA:  ' + eventDate.toUpperCase(), 44, 178);
      if (event.end_time) doc.text('INIZIO:  ' + event.end_time, 44, 196);
      if (event.genre) doc.text('GENERE:  ' + event.genre.toUpperCase(), 44, 196 + (event.end_time ? 18 : 0));

      doc.setDrawColor(46, 91, 255);
      doc.setLineWidth(1);
      doc.line(44, 236, pageW - 44, 236);

      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text('TITOLARE', 44, 258);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(224, 224, 224);
      doc.text(full_name, 44, 280);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text('BIGLIETTO', 44, 306);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(212, 255, 0);
      doc.text(seat, 44, 332);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text('CODICE BIGLIETTO', 44, 366);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(212, 255, 0);
      doc.text(code, 44, 388);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      const priceLine = unitPrice > 0
        ? 'Prevendita EUR ' + (unitPrice + commissionPerTicket).toFixed(2) + '  (biglietto + EUR ' + commissionPerTicket.toFixed(2) + ' commissione)'
        : 'INGRESSO LIBERO';
      doc.text(priceLine, 44, 416);

      doc.setFillColor(212, 255, 0);
      doc.roundedRect(pageW - 184, 240, 140, 140, 4, 4, 'F');
      doc.addImage(qrData, 'PNG', pageW - 174, 250, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(5, 5, 5);
      doc.text("SCANNA ALL'INGRESSO", pageW - 174, 386);

      doc.setDrawColor(46, 91, 255);
      doc.setLineWidth(0.5);
      doc.line(44, pageH - 70, pageW - 44, pageH - 70);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Via Vogno, 7 - 24020 Rovetta (BG)   .   info@lifeclub.it   .   335 5847474', 44, pageH - 48);
      doc.text("Biglietto " + seat + " . Codice conferma " + resCode + " . Presenta il QR all'ingresso. Non rivendibile.", 44, pageH - 32);
    };

    qrDataUrls.forEach((d, i) => drawPass(d, ticketCodes[i], pad(i + 1) + '/' + pad(qty), i === 0));

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    waitUntil((async () => {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Life Club Rovetta - Conferma prevendita: ' + event.title,
          body:
            'Ciao ' + full_name + ',\n\n' +
            'La tua prevendita e confermata. Hai ' + qty + ' biglietto/i, ciascuno con il proprio QR da presentare all\'ingresso.\n\n' +
            'Evento: ' + event.title + '\n' +
            'Data: ' + eventDate + '\n' +
            'Codice conferma: ' + resCode + '\n' +
            'Codici biglietti: ' + ticketCodes.join(', ') + '\n\n' +
            'Scarica il Digital Access Pass dal sito (un QR per biglietto).\n\nA presto,\nLife Club Rovetta'
        });
      } catch (e) {
        // email a indirizzi non registrati non disponibile
      }
    })());

    return Response.json({
      confirmation_code: resCode,
      ticket_codes: ticketCodes,
      pdf_base64: pdfBase64,
      reservation_id: reservation.id,
      total,
      unit_price: unitPrice,
      commission,
      free: unitPrice === 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}