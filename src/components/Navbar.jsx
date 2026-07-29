import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, Facebook } from "lucide-react";

const LINKS = [
  { label: "Eventi", href: "#eventi" },
  { label: "Il Locale", href: "#locale" },
  { label: "Contatti", href: "#contatti" },
  { label: "Staff", href: "/scanner" },
  { label: "Instagram", href: "https://www.instagram.com/life.club.rovetta/" },
  { label: "Facebook", href: "https://www.facebook.com/Life.Club.Rovetta/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-5 md:px-8 py-4">
          <a href="#" className="text-sm md:text-base font-black tracking-[0.25em] text-foreground">
            LIFE<span className="text-accent">·</span>CLUB
          </a>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors"
          >
            <Menu className="h-4 w-4" /> Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="flex justify-end p-5 md:p-8">
              <button onClick={() => setOpen(false)} className="text-foreground hover:text-accent transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center h-[calc(100%-80px)] gap-2 md:gap-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="text-4xl md:text-7xl font-black uppercase tracking-tight text-foreground hover:text-accent transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
              <div className="flex gap-6 mt-8">
                <a href="https://www.instagram.com/life.club.rovetta/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://www.facebook.com/Life.Club.Rovetta/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}