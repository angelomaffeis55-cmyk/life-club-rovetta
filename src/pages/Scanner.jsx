import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Camera, Keyboard, RefreshCw, LogOut } from "lucide-react";

export default function Scanner() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { valid, reason, ticket }
  const [processing, setProcessing] = useState(false);

  const [mode, setMode] = useState("camera"); // 'camera' | 'manual'
  const [camStarted, setCamStarted] = useState(false);
  const [camError, setCamError] = useState(false);
  const videoRef = useRef(null);
  const lastScanRef = useRef("");

  const beep = (ok) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "square";
      o.frequency.value = ok ? 880 : 200;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (ok ? 0.18 : 0.4));
      o.start();
      o.stop(ctx.currentTime + (ok ? 0.18 : 0.4));
    } catch (e) {}
  };

  const loadEvents = useCallback(async () => {
    try {
      const list = await base44.entities.Event.list("date", 50);
      setEvents(list || []);
      const upcoming = (list || []).filter((e) => e.status !== "past");
      setEventId((upcoming[0] || list[0])?.id || "");
    } catch (e) {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    if (!eventId) return;
    setLoadingTickets(true);
    try {
      const list = await base44.entities.Ticket.filter({ event_id: eventId });
      setTickets(list || []);
    } catch (e) {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, [eventId]);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { if (eventId) loadTickets(); }, [eventId, loadTickets]);

  // Sincronizzazione real-time: ogni nuova prenotazione crea un Ticket,
  // e ogni timbrata aggiorna lo stato. Lo scanner reagisce all'istante,
  // filtrando solo i biglietti dell'evento selezionato.
  useEffect(() => {
    let mounted = true;
    const applyChange = (t) => {
      setTickets((prev) => {
        const idx = prev.findIndex((x) => x.id === t.id);
        if (idx === -1) return t.event_id === eventId ? [...prev, t] : prev;
        const next = [...prev]; next[idx] = t; return next;
      });
    };
    const unsubscribe = base44.entities.Ticket.subscribe((e) => {
      if (!mounted) return;
      if (e.type === "delete") {
        setTickets((prev) => prev.filter((x) => x.id !== e.id));
      } else if (e.data) {
        applyChange(e.data);
      }
    });
    return () => { mounted = false; unsubscribe(); };
  }, [eventId]);

  const processCode = useCallback(async (raw) => {
    const c = (raw || "").trim().toUpperCase();
    if (!c || c === lastScanRef.current || processing || !eventId) return;
    lastScanRef.current = c;
    setProcessing(true);
    setCode(c);
    try {
      const res = await base44.functions.invoke("check-in-ticket", { code: c, event_id: eventId });
      const data = res?.data || res;
      setResult(data);
      beep(!!data?.valid);
      if (data?.valid) loadTickets();
    } catch (e) {
      setResult({ valid: false, reason: "error", error: e?.message || "Errore di rete" });
      beep(false);
    } finally {
      setProcessing(false);
      setTimeout(() => setResult(null), 4000);
    }
  }, [processing, loadTickets]);

  // Camera via native BarcodeDetector (Android Chrome) with jsQR fallback (iOS Safari)
  useEffect(() => {
    let active = true;
    let stream;
    let raf;
    if (mode !== "camera" || !camStarted) return;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
        if (!active) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        let detector = null;
        if ("BarcodeDetector" in window) {
          try { detector = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {}
        }
        let jsQR = null;
        if (!detector) {
          try { jsQR = (await import("jsqr")).default; } catch (e) {}
        }
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const tick = async () => {
          if (!active || !videoRef.current) return;
          const v = videoRef.current;
          if (v.readyState >= 2 && v.videoWidth) {
            if (detector) {
              try {
                const codes = await detector.detect(v);
                if (codes && codes.length) {
                  const val = codes[0].rawValue?.trim();
                  if (val && val.toUpperCase() !== lastScanRef.current) processCode(val);
                }
              } catch (e) {}
            } else if (jsQR) {
              canvas.width = v.videoWidth;
              canvas.height = v.videoHeight;
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const q = jsQR(img.data, canvas.width, canvas.height);
              if (q && q.data) {
                const val = q.data.trim();
                if (val.toUpperCase() !== lastScanRef.current) processCode(val);
              }
            }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        setCamError(true);
      }
    })();
    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [mode, camStarted, processCode]);

  const stats = {
    total: tickets.length,
    in: tickets.filter((t) => t.status === "checked_in").length,
    valid: tickets.filter((t) => t.status === "valid").length,
  };
  const pct = stats.total ? Math.round((stats.in / stats.total) * 100) : 0;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Area riservata allo staff</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Serve un account amministratore per validare i biglietti all'ingresso.
          </p>
          <a href="/login" className="inline-block mt-6 bg-accent text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]">
            Accedi
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScanLine className="h-5 w-5 text-accent" />
          <div>
            <h1 className="text-base font-black uppercase tracking-[0.2em]">Staff Scanner</h1>
            <p className="text-xs text-muted-foreground tracking-wider">Validazione biglietti - Life Club Rovetta</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Sito</a>
          <button onClick={() => base44.auth.logout(window.location.origin)} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-accent transition-colors">
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 grid md:grid-cols-[1fr_320px] gap-6">
        {/* Colonna scanner */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setMode("camera"); setCamStarted(false); }} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] border ${mode === "camera" ? "bg-accent text-background border-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <Camera className="h-4 w-4" /> Fotocamera
            </button>
            <button onClick={() => { setMode("manual"); setCamStarted(false); }} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] border ${mode === "manual" ? "bg-accent text-background border-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <Keyboard className="h-4 w-4" /> Manuale
            </button>
          </div>

          {mode === "camera" ? (
            <div className="relative aspect-square md:aspect-video border-2 border-border bg-black overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-6 pointer-events-none">
                <div className="relative w-full h-full">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-accent" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-accent" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-accent" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-accent" />
                </div>
              </div>

              {!camStarted && !camError && (
                <div className="absolute inset-0 bg-background/85 flex flex-col items-center justify-center text-center px-6 gap-4">
                  <Camera className="h-10 w-10 text-accent" />
                  <p className="text-sm text-foreground">Inquadra il QR sul biglietto PDF per validarlo all'ingresso.</p>
                  <button onClick={() => setCamStarted(true)} className="inline-flex items-center gap-2 bg-accent text-background px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors">
                    <Camera className="h-4 w-4" /> Avvia fotocamera
                  </button>
                </div>
              )}

              {camStarted && !camError && (
                <button onClick={() => setCamStarted(false)} className="absolute top-3 right-3 inline-flex items-center gap-1 bg-background/80 text-foreground px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] border border-border hover:border-accent">
                  <RefreshCw className="h-3.5 w-3.5" /> Stop
                </button>
              )}

              {camError && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center text-center px-6">
                  <Camera className="h-9 w-9 text-muted-foreground mb-3" />
                  <p className="text-sm text-foreground mb-1">Impossibile accedere alla fotocamera.</p>
                  <p className="text-xs text-muted-foreground">Controlla i permessi della fotocamera dal browser, oppure usa l'inserimento manuale.</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); processCode(code); lastScanRef.current = ""; }} className="space-y-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Es. LC-XXXXX-XX-01"
                autoFocus
                className="w-full bg-card border border-border px-4 py-4 text-lg font-mono uppercase tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <button type="submit" disabled={processing || !code} className="w-full bg-accent text-background py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-40">
                {processing ? "Verifica..." : "Valida biglietto"}
              </button>
            </form>
          )}

          {/* Risultato */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`mt-4 border-2 p-5 ${result.valid ? "border-accent bg-accent/10" : "border-destructive bg-destructive/10"}`}
              >
                {result.valid ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-8 w-8 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lg font-black uppercase text-accent">Ingresso consentito</p>
                      <p className="text-sm text-foreground mt-1">{result.ticket?.holder_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.ticket?.event_title} · Biglietto {result.ticket?.seat} · {result.ticket?.code}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-8 w-8 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lg font-black uppercase text-destructive">
                        {result.reason === "already_used" ? "Già timbrato" : result.reason === "cancelled" ? "Annullato" : result.reason === "wrong_event" ? "Evento sbagliato" : result.reason === "invalid" ? "Non valido" : "Errore"}
                      </p>
                      {result.ticket && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.ticket.holder_name} · Biglietto {result.ticket.seat} · {result.ticket.code}
                          {result.reason === "already_used" && result.ticket.scanned_at ? ` (scansionato ${new Date(result.ticket.scanned_at).toLocaleString("it-IT")})` : ""}
                        </p>
                      )}
                      {result.reason === "invalid" && (
                        <p className="text-xs text-muted-foreground mt-1">Il codice non corrisponde a nessun biglietto registrato.</p>
                      )}
                      {result.reason === "wrong_event" && (
                        <p className="text-xs text-muted-foreground mt-1">Biglietto valido ma di un'altra serata ({result.ticket?.event_title}). Non ammesso a questo evento.</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Colonna stats */}
        <aside className="space-y-5">
          <div className="border border-border p-5">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Evento</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full mt-2 bg-card border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {loadingEvents ? <option>Carico...</option> :
                events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title} — {ev.date ? new Date(ev.date).toLocaleDateString("it-IT") : ""}</option>)}
            </select>
          </div>

          <div className="border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Conteggio ingressi</span>
              <button onClick={loadTickets} className="text-muted-foreground hover:text-accent transition-colors">
                <RefreshCw className={`h-4 w-4 ${loadingTickets ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-accent leading-none">{stats.in}</span>
              <span className="text-base text-muted-foreground pb-1">/ {stats.total}</span>
            </div>
            <div className="mt-3 h-2 bg-secondary">
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="border border-border p-2">
                <p className="text-xl font-bold text-foreground">{stats.valid}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Da entrare</p>
              </div>
              <div className="border border-border p-2">
                <p className="text-xl font-bold text-foreground">{stats.in}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Entrati</p>
              </div>
            </div>
          </div>

          <div className="border border-border p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Ultimi ingressi</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tickets.filter((t) => t.status === "checked_in").sort((a, b) => (b.scanned_at || "").localeCompare(a.scanned_at || "")).slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="text-foreground truncate">{t.holder_name}</p>
                    <p className="text-muted-foreground text-xs">N.{t.seat} · {t.code}</p>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2 text-xs">{t.scanned_at ? new Date(t.scanned_at).toLocaleTimeString("it-IT") : ""}</span>
                </div>
              ))}
              {stats.in === 0 && <p className="text-xs text-muted-foreground">Nessun ingresso ancora registrato.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}