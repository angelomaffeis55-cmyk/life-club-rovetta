import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Car, Ticket, CreditCard } from "lucide-react";

const MAPS_QUERY = "Via+Vogno+7+Rovetta+BG";
const MAPS_LINK = `https://maps.google.com/?q=${MAPS_QUERY}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

const INFO = [
  { icon: <MapPin className="h-5 w-5" />, label: "Indirizzo", value: "Via Vogno, 7 — 24020 Rovetta (BG)", href: MAPS_LINK },
  { icon: <Clock className="h-5 w-5" />, label: "Orari", value: "Apertura nei weekend e per eventi, dalle 23:00" },
  { icon: <ShieldCheck className="h-5 w-5" />, label: "Età & Ingresso", value: "Maggiorenni con documento valido, verificato all'ingresso" },
  { icon: <Ticket className="h-5 w-5" />, label: "Prevendita", value: "Online tramite Digital Pass QR, da mostrare al gate" },
  { icon: <CreditCard className="h-5 w-5" />, label: "Pagamento", value: "Al momento dell'ingresso; la prenotazione online è gratuita" },
  { icon: <Car className="h-5 w-5" />, label: "Parcheggio", value: "Ampio parcheggio disponibile nelle adiacenze del locale" },
];

export default function InfoLocale() {
  return (
    <section id="info" className="relative py-20 md:py-32 px-5 md:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4">Info sul locale</p>
        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight text-foreground max-w-2xl leading-[0.95]">
          Arrivare prepared.
        </h2>
        <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
          Tutto l'essenziale per la tua serata: dove siamo, come e quando entrare, cosa portare.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {INFO.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="border border-border p-6 hover:border-accent transition-colors group"
            >
              <div className="h-11 w-11 border border-border flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-background transition-colors">
                {it.icon}
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{it.label}</p>
              <p className="text-sm text-foreground leading-relaxed">
                {it.href ? (
                  <a href={it.href} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors underline-offset-2 hover:underline">
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-6 mt-6">
          <div className="border border-border p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Contatti diretti</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+393355847474" className="hover:text-accent transition-colors">335 5847474</a>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:info@lifeclub.it" className="hover:text-accent transition-colors">info@lifeclub.it</a>
              </li>
              <li className="flex items-start gap-3 text-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Via Vogno, 7 — 24020 Rovetta (BG)</a>
              </li>
            </ul>
          </div>

          <div className="border border-border overflow-hidden min-h-[280px]">
            <iframe
              title="Mappa Life Club Rovetta"
              src={MAPS_EMBED}
              className="w-full h-full min-h-[280px] grayscale contrast-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}