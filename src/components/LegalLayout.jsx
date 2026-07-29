import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function LegalLayout({ title, updated, children }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <article className="max-w-3xl mx-auto px-5 md:px-8 py-24 md:py-32 space-y-10">
        <header className="space-y-3 border-b border-border pb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-accent">Documento legale</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground">Ultimo aggiornamento: {updated}</p>
        </header>
        <div className="space-y-8">{children}</div>
      </article>
    </div>
  );
}