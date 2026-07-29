import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";

const TICKER_WORDS = ["SUNSET", "TAKE OVER", "LIFE BALERA", "DEEP NIGHT", "PREVENDITA", "ROVETTA", "LIFE CLUB"];

export default function Footer() {
  return (
    <footer id="contatti" className="relative border-t border-border">
      {/* Ticker social */}
      <div className="overflow-hidden border-b border-border py-4">
        <div className="marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0">
              {TICKER_WORDS.map((w, i) => (
                <span key={i} className="mx-6 text-2xl md:text-4xl font-black uppercase tracking-tight text-foreground/15">
                  {w} <span className="text-accent">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black tracking-[0.2em] text-foreground">
              LIFE<span className="text-accent">·</span>CLUB
            </h3>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
              Discoteca e spazio eventi a Rovetta, in Valle Seriana. Due piste coperte, giardino esterno e quattro zone bar.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="https://www.instagram.com/life.club.rovetta/" target="_blank" rel="noreferrer" className="h-10 w-10 border border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/Life.Club.Rovetta/" target="_blank" rel="noreferrer" className="h-10 w-10 border border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contatti */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Contatti</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <a href="https://maps.google.com/?q=Via+Vogno+7+Rovetta" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
                  Via Vogno, 7 — 24020 Rovetta (BG)
                </a>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+393355847474" className="hover:text-accent transition-colors">335 5847474</a>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:info@lifeclub.it" className="hover:text-accent transition-colors">info@lifeclub.it</a>
              </li>
            </ul>
          </div>

          {/* Orari / Info */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Info</p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>Apertura serale nei weekend e per eventi</li>
              <li>Prevendita online disponibile sul sito</li>
              <li>Accesso con Digital Pass (QR)</li>
              <li>Pagamento al momento dell'ingresso</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-3 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Life Club Rovetta. Tutti i diritti riservati.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/cookie" className="hover:text-foreground transition-colors">Cookie</a>
            <a href="/termini" className="hover:text-foreground transition-colors">Termini biglietti</a>
          </div>
          <p>Pulse-Driven Brutalism — Designed for the dancefloor.</p>
        </div>
      </div>
    </footer>
  );
}