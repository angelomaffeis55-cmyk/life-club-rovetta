import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Loader2, Download, Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STEPS = ["Dati", "Biglietti", "Conferma"];

export default function BookingModal({ event, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validStep0 = form.full_name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email);

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
      // scarica PDF
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
      setResult({ code: data.confirmation_code });
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
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-lg bg-card border border-border overflow-hidden"
          >
            <div className="h-1 bg-accent" />
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-primary uppercase">Access Vault · Prevendita</p>
                  <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground mt-1">{event.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(event.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2 mt-6 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div
                      className={`h-[2px] transition-colors duration-300 ${i <= step ? "bg-accent" : "bg-border"}`}
                    />
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
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-8 py-6">
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
                  <div className="text-center text-sm text-muted-foreground">
                    {event.price === 0 || !event.price ? "Ingresso libero" : `Totale: €${(event.price * form.quantity).toFixed(2)}`}
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
                      className="flex-1 bg-accent text-background py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Genero pass…</> : "Conferma prevendita"}
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
                <div className="text-center py-4 relative">
                  {/* scanline animation */}
                  <motion.div
                    initial={{ top: 0, opacity: 0.8 }}
                    animate={{ top: "100%", opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute left-0 right-0 h-12 bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0"
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
                  <p className="text-sm text-muted-foreground mt-2">
                    Il PDF è stato scaricato. Presenta il QR all'ingresso.
                  </p>
                  <div className="mt-5 py-3 border-y border-border">
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Codice conferma</p>
                    <p className="text-lg font-bold text-accent tracking-wider">{result.code}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                    Una email di conferma è stata inviata a {form.email} (potrebbe non arrivare se l'indirizzo non è registrato alla piattaforma — il PDF scaricato è il tuo biglietto ufficiale).
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors"
                  >
                    Chiudi
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