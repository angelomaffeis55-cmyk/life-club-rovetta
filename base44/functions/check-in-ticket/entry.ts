import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'Codice mancante' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Solo lo staff autorizzato puo validare i biglietti' }, { status: 403 });
    }

    const tickets = await base44.asServiceRole.entities.Ticket.filter({ code: code.trim().toUpperCase() });
    if (!tickets || tickets.length === 0) {
      return Response.json({ valid: false, reason: 'invalid' });
    }
    const ticket = tickets[0];

    if (ticket.status === 'checked_in') {
      return Response.json({
        valid: false,
        reason: 'already_used',
        ticket: {
          code: ticket.code,
          holder_name: ticket.holder_name,
          event_title: ticket.event_title,
          seat: ticket.seat,
          scanned_at: ticket.scanned_at
        }
      });
    }
    if (ticket.status === 'cancelled') {
      return Response.json({
        valid: false,
        reason: 'cancelled',
        ticket: { code: ticket.code, holder_name: ticket.holder_name, event_title: ticket.event_title, seat: ticket.seat }
      });
    }

    const updated = await base44.asServiceRole.entities.Ticket.update(ticket.id, {
      status: 'checked_in',
      scanned_at: new Date().toISOString(),
      scanned_by: user.email || user.full_name || user.id
    });

    return Response.json({
      valid: true,
      ticket: {
        id: updated.id,
        code: updated.code,
        holder_name: updated.holder_name,
        event_title: updated.event_title,
        event_date: updated.event_date,
        seat: updated.seat,
        status: updated.status,
        scanned_at: updated.scanned_at
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}