import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function EventStrip({ event, index, onBook }) {
  const date = new Date(event.date);
  const day = date.toLocaleDateString("it-IT", { day: "2-digit" });
  const month = date.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();
  const weekday = date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

  const soldout = event.status === "soldout";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative border-t border-border overflow-hidden"
    >
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[88px_1fr_auto] items-stretch">
        {/* Data verticale */}
        <div className="flex flex-col items-center justify-center px-3 py-6 md:py-10 border-r border-border">
          <span className="text-3xl md:text-5xl font-black text-foreground leading-none">{day}</span>
          <span className="text-xs tracking-[0.2em] text-primary mt-1">{month}</span>
          <span className="text-[10px] text-muted-foreground mt-1 tracking-wider">{weekday}</span>
        </div>

        {/* Corpo */}
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-5 py-6 md:py-10 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {event.image_url && (
              <Image src={event.image_url} alt={event.title} fittingType="fill" className="h-full w-full object-cover opacity-30" />
            )}
            <div className="absolute inset-0 bg-background/75" />
          </div>

          <div className="relative z-10 flex-1 min-w-0">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
              {event.title}
            </h3>
            {event.djs && <p className="text-sm text-primary mt-1 tracking-wide">{event.djs}</p>}
            {event.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-xl line-clamp-2 leading-relaxed">{event.description}</p>
            )}
          </div>

          <div className="relative z-10 flex items-center gap-4 md:gap-6 shrink-0">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {event.price === 0 || !event.price ? "INGRESSO LIBERO" : `€${event.price}`}
            </span>
            <button
              onClick={() => !soldout && onBook(event)}
              disabled={soldout}
              className="flex items-center gap-2 bg-accent text-background px-4 py-2 md:px-5 md:py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {soldout ? "Sold out" : "Prevendita"} <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}