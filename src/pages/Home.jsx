import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import EventStrip from "@/components/EventStrip";
import BookingModal from "@/components/BookingModal";
import LiquidCursor from "@/components/LiquidCursor";
import FrequencyLine from "@/components/FrequencyLine";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowDown, Zap, Music, Users } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/6a69f1d0870cc40025a6fb1d/89498f885_generated_3a0d2045.png";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  const { scrollY } = useScroll();
  const titleScale = useTransform(scrollY, [0, 600], [1, 1.18]);
  const titleY = useTransform(scrollY, [0, 600], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    base44.entities.Event
      .list("date", 50)
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, []);

  const openBooking = (event) => setBooking(event);

  return (
    <div className="relative bg-background text-foreground">
      <LiquidCursor />
      <FrequencyLine />
      <Navbar />

      {/* ===== HERO — Event Horizon ===== */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
          <Image src={HERO_IMG} alt="Life Club Rovetta" fittingType="fill" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="absolute inset-0 bg-background/30" />
        </motion.div>

        {/* Tipografia verticale laterale */}
        <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 items-center gap-4 z-10">
          <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Est. Rovetta · Valle Seriana</span>
          <span className="h-16 w-px bg-border" />
        </div>
        <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] items-center gap-4 z-10">
          <span className="h-16 w-px bg-border" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-accent">Pulse-Driven</span>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] md:text-sm tracking-[0.4em] uppercase text-accent mb-4"
          >
            Discoteca · Eventi · Rovetta (BG)
          </motion.p>
          <motion.h1
            style={{ scale: titleScale, y: titleY }}
            className="text-[18vw] md:text-[14vw] lg:text-[12rem] font-black leading-[0.85] tracking-tighter text-foreground"
          >
            LIFE<br /><span className="text-accent">CLUB</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            L'epicentro della notte in Valle Seriana. Serate, DJ set ed eventi estivi. Prevendita online con Digital Pass.
          </motion.p>
          <motion.a
            href="#eventi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 group relative inline-flex items-center gap-3 bg-accent text-background px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground transition-colors"
          >
            <Zap className="h-4 w-4" /> Secure Pre-sale
          </motion.a>
        </div>

        <motion.a
          href="#eventi"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </motion.a>
      </section>

      {/* ===== FREQUENCY GRID — Eventi ===== */}
      <section id="eventi" className="relative py-16 md:py-24">
        <div className="px-5 md:px-8 mb-10 md:mb-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Frequency Grid</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground">Le prossime<br />serate</h2>
            </div>
            <p className="hidden md:block max-w-xs text-sm text-muted-foreground leading-relaxed text-right">
              Prevendita aperta per tutti gli eventi. Il Digital Pass con QR viene generato al termine della prenotazione.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="px-5 md:px-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 md:h-28 bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 md:px-8 py-20 text-center text-muted-foreground">
            <p>Nessun evento in programma al momento.</p>
            <p className="text-sm mt-2">Seguici sui social per restare aggiornato.</p>
          </div>
        ) : (
          <div>
            {events.map((ev, i) => (
              <EventStrip key={ev.id} event={ev} index={i} onBook={openBooking} />
            ))}
            <div className="border-t border-border" />
          </div>
        )}
      </section>

      {/* ===== IL LOCALE ===== */}
      <section id="locale" className="relative py-20 md:py-32 px-5 md:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4">Il Locale</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground max-w-3xl leading-tight">
            Uno spazio progettato per il ritmo.
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-12">
            <Feature
              icon={<Music className="h-5 w-5" />}
              title="Due piste coperte"
              text="Musica commerciale, dance e revival su due dancefloor indipendenti per non fermare mai l'energia."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Giardino esterno"
              text="Ampio spazio all'aperto per gli eventi estivi, apericena e momenti di respiro tra un set e l'altro."
            />
            <Feature
              icon={<Users className="h-5 w-5" />}
              title="Quattro zone bar"
              text="Servizio bar distribuito per servirti velocemente, sempre in ogni angolo del locale."
            />
          </div>
        </div>
      </section>

      {/* ===== CTA FINALE ===== */}
      <section className="relative py-24 md:py-40 border-t border-border overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[22vw] font-black uppercase text-foreground/[0.03] tracking-tighter select-none">
            ROVETTA
          </span>
        </div>
        <div className="relative z-10 text-center px-5">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight text-foreground">
            La notte non aspetta.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Prenota la tua prevendita online e salta la coda all'ingresso.
          </p>
          <a
            href="#eventi"
            className="mt-8 inline-flex items-center gap-3 bg-accent text-background px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground transition-colors"
          >
            <Zap className="h-4 w-4" /> Vai alle prevendite
          </a>
        </div>
      </section>

      <Footer />

      <BookingModal event={booking} onClose={() => setBooking(null)} />
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="border border-border p-6 md:p-8 hover:border-accent transition-colors group">
      <div className="h-11 w-11 border border-border flex items-center justify-center text-accent mb-5 group-hover:bg-accent group-hover:text-background transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}