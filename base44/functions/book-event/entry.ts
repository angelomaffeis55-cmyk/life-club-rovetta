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

    const code = 'LC-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();

    const reservation = await base44.asServiceRole.entities.Reservation.create({
      event_id,
      event_title: event.title,
      event_date: event.date,
      full_name,
      email,
      phone: phone || '',
      quantity: Number(quantity),
      confirmation_code: code,
      status: 'confirmed'
    });

    // QR contenente il codice di conferma
    const qrDataUrl = await QRCode.toDataURL(code, {
      margin: 1,
      width: 300,
      color: { dark: '#050505', light: '#D4FF00' }
    });

    // --- Costruzione PDF: Digital Access Pass ---
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Sfondo ossidiana
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Barra superiore fosforo acido
    doc.setFillColor(212, 255, 0);
    doc.rect(0, 0, pageW, 6, 'F');

    // Branding
    doc.setTextColor(224, 224, 224);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.text('LIFE CLUB', 44, 66);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(46, 91, 255);
    doc.text('DIGITAL ACCESS PASS  /  ROVETTA (BG)', 44, 80);

    // Titolo evento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(38);
    doc.setTextColor(224, 224, 224);
    const titleLines = doc.splitTextToSize((event.title || 'EVENTO').toUpperCase(), pageW - 220);
    doc.text(titleLines, 44, 138);

    // Dettagli evento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    const eventDate = event.date ? new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
    doc.text('DATA:  ' + eventDate.toUpperCase(), 44, 188);
    if (event.end_time) doc.text('INIZIO:  ' + event.end_time, 44, 206);
    if (event.genre) doc.text('GENERE:  ' + event.genre.toUpperCase(), 44, 206 + (event.end_time ? 18 : 0));

    // Separatore cobalto
    doc.setDrawColor(46, 91, 255);
    doc.setLineWidth(1);
    doc.line(44, 248, pageW - 44, 248);

    // Titolare
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text('TITOLARE', 44, 272);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(224, 224, 224);
    doc.text(full_name, 44, 294);

    // Quantità
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text('BIGLIETTI', 44, 322);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(212, 255, 0);
    doc.text(String(quantity), 44, 348);

    // Codice conferma
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text('CODICE CONFERMA', 44, 384);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(212, 255, 0);
    doc.text(code, 44, 408);

    // QR a destra
    doc.setFillColor(212, 255, 0);
    doc.roundedRect(pageW - 184, 250, 140, 140, 4, 4, 'F');
    doc.addImage(qrDataUrl, 'PNG', pageW - 174, 260, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(5, 5, 5);
    doc.text('SCANNA ALL\'INGRESSO', pageW - 174, 398);

    // Footer
    doc.setDrawColor(46, 91, 255);
    doc.setLineWidth(0.5);
    doc.line(44, pageH - 70, pageW - 44, pageH - 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('Via Vogno, 7 — 24020 Rovetta (BG)   ·   info@lifeclub.it   ·   335 5847474', 44, pageH - 48);
    doc.text('Documento digitale generato il ' + new Date().toLocaleDateString('it-IT') + '. Presenta il QR all\'ingresso. Non rivendibile.', 44, pageH - 32);

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // Email (non bloccante) — solo utenti registrati all'app
    waitUntil((async () => {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Life Club Rovetta — Conferma prevendita: ' + event.title,
          body: 'Ciao ' + full_name + ',\n\nLa tua prevendita e\' confermata.\n\nEvento: ' + event.title + '\nData: ' + eventDate + '\nBiglietti: ' + quantity + '\nCodice conferma: ' + code + '\n\nScarica il Digital Access Pass dal sito (QR da presentare all\'ingresso).\n\nA presto,\nLife Club Rovetta'
        });
      } catch (e) {
        // email a indirizzi non registrati non disponibile — ignorato
      }
    })());

    return Response.json({
      confirmation_code: code,
      pdf_base64: pdfBase64,
      reservation_id: reservation.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}