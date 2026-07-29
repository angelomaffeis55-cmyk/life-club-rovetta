import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Loader2, Check, AlertCircle, Download, Ticket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const STEPS = ["Dati", "Biglietti", "Conferma"];

export default function BookingModal({ event, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validStep0 = form.full_name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email);

  const unitPrice = Number(event?.price) || 0;
  const isFree = unitPrice === 0;
  const commissionPerTicket = isFree ? 0 : 1;
  const ticketsTotal = unitPrice * form.quantity;
  const commission = commissionPerTicket * form.quantity;
  const total = ticketsTotal + commission;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("book-event", {
        event_id: event.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        quantity: form.quantity,
      });
      const data = res.data;
      const byteChars = atob(data.pdf_base64);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LifeClub-${event.title.replace(/\s+/g, "-")}-${data.confirmation_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setResult({ code: data.confirmation_code, total: data.total });
      setStep(2);
    } catch (e) {
      setError("Generazione biglietto fallita. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 24 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-md bg-card border border-border overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            {/* Banner immagine evento */}
            <div className="relative h-28 md:h-32 overflow-hidden">
              {event.image_url && (
                <Image src={event.image_url} alt={event.title} fittingType="fill" className="h-full w-full object-cover opacity-50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />
              <div className="absolute inset-0 flex items-end justify-between p-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-accent uppercase">Access Vault</p>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-foreground leading-tight mt-1 max-w-[14rem]">
                    {event.title}
                  </h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 md:p-7">
              <p className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                {event.end_time ? ` · ${event.end_time}` : ""}
              </p>

              {/* Step indicator */}
              <div className="flex gap-2 mt-5 mb-6">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={`h-[2px] transition-colors duration-300 ${i <= step ? "bg-accent" : "bg-border"}`} />
                    <span className={`text-[10px] tracking-widest uppercase mt-2 block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 0: dati */}
              {step === 0 && (
                <div className="space-y-5">
                  <Field label="Nome e cognome">
                    <input
                      value={form.full_name}
                      onChange={(e) => set("full_name", e.target.value)}
                      className="w-full bg-transparent border-b border-border py-2 text-foreground focus:border-accent focus:outline-none transition-colors"
                      placeholder="Mario Rossi"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="w-full bg-transparent border-b border-border py-2 text-foreground focus:border-accent focus:outline-none transition-colors"
                      placeholder="mario@email.com"
                    />
                  </Field>
                  <Field label="Telefono (opzionale)">
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="w-full bg-transparent border-b border-border py-2 text-foreground focus:border-accent focus:outline-none transition-colors"
                      placeholder="333 1234567"
                    />
                  </Field>
                  <button
                    onClick={() => setStep(1)}
                    disabled={!validStep0}
                    className="w-full bg-accent text-background py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continua
                  </button>
                </div>
              )}

              {/* Step 1: biglietti */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-7 py-4">
                    <button
                      onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                      className="h-12 w-12 border border-border flex items-center justify-center text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-6xl font-black text-foreground w-20 text-center tabular-nums">{form.quantity}</span>
                    <button
                      onClick={() => set("quantity", Math.min(10, form.quantity + 1))}
                      className="h-12 w-12 border border-border flex items-center justify-center text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Riepilogo prezzi con commissione */}
                  <div className="space-y-2.5 text-sm border border-border p-4">
                    {isFree ? (
                      <div className="text-center text-accent font-bold uppercase tracking-wider text-xs py-2">
                        Ingresso libero — nessuna commissione
                      </div>
                    ) : (
                      <>
                        <Row label={`${form.quantity} × biglietto`} value={`€${ticketsTotal.toFixed(2)}`} />
                        <Row label={`${form.quantity} × commissione prevendita`} value={`€${commission.toFixed(2)}`} muted />
                        <div className="h-px bg-border my-1" />
                        <Row label="Totale" value={`€${total.toFixed(2)}`} bold accent />
                        <p className="text-[10px] text-muted-foreground pt-1">
                          Il pagamento avverrà all'ingresso. La prevendita garantisce l'accesso prioritario.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-[0.15em] text-foreground hover:border-foreground transition-colors"
                    >
                      Indietro
                    </button>
                    <button
                      onClick={submit}
                      disabled={loading}
                      className="flex-[1.6] bg-accent text-background py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Genero pass…</> : <>Conferma prevendita <Ticket className="h-4 w-4" /></>}
                    </button>
                  </div>
                  {error && (
                    <p className="text-destructive text-xs flex items-center gap-2 justify-center">
                      <AlertCircle className="h-4 w-4" /> {error}
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: conferma */}
              {step === 2 && result && (
                <div className="text-center py-4 relative overflow-hidden">
                  <motion.div
                    initial={{ top: "-30%", opacity: 0.9 }}
                    animate={{ top: "130%", opacity: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="absolute left-0 right-0 h-16 bg-gradient-to-b from-accent/0 via-accent/25 to-accent/0"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="mx-auto h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-5"
                  >
                    <Check className="h-8 w-8 text-background" strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-xl font-black uppercase text-foreground">Access Pass generato</h3>
                  <p className="text-sm text-muted-foreground mt-2">PDF scaricato. Presenta il QR all'ingresso.</p>
                  <div className="mt-5 py-3 border-y border-border">
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Codice conferma</p>
                    <p className="text-lg font-bold text-accent tracking-wider">{result.code}</p>
                    <p className="text-sm text-foreground mt-2 font-semibold">
                      {result.total === 0 ? "Ingresso libero" : `Da pagare all'ingresso: €${result.total.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                    Email di conferma inviata a {form.email} (potrebbe non arrivare se l'indirizzo non è registrato — il PDF scaricato è il tuo biglietto ufficiale).
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Chiudi
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, muted, bold, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${muted ? "text-muted-foreground" : "text-foreground"} ${bold ? "font-bold uppercase tracking-wide text-xs" : ""}`}>
        {label}
      </span>
      <span className={`${accent ? "text-accent font-bold text-base" : "text-foreground"} ${bold ? "font-bold" : ""}`}>
        {value}
      </span>
    </div>
  );
}