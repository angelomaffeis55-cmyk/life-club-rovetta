import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "lc_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const choose = (value) => {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 inset-x-0 z-[60] border-t-2 border-accent bg-background/95 backdrop-blur px-5 md:px-8 py-5"
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1">
              Usiamo cookie tecnici per il funzionamento del sito e, previo consenso, cookie di statistica anonimi.
              Consulta la <a href="/cookie" className="text-accent underline">Cookie Policy</a>.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => choose("accepted")}
                className="bg-accent text-background px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors"
              >
                Accetta
              </button>
              <button
                onClick={() => choose("only-technical")}
                className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
              >
                Solo tecnici
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}