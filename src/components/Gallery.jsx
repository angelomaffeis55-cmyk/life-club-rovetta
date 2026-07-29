import { Instagram } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function Gallery({ images }) {
  return (
    <section id="galleria" className="relative py-20 md:py-28 px-5 md:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3">Aftermath</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground">
              Dalla<br />pista
            </h2>
          </div>
          <a
            href="https://www.instagram.com/life.club.rovetta/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
          >
            <Instagram className="h-4 w-4" />
            <span className="border-b border-border group-hover:border-accent pb-1 transition-colors">
              @life.club.rovetta
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {images.map((src, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden border border-border ${i % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <Image
                src={src}
                alt={`Life Club Rovetta ${i + 1}`}
                fittingType="fill"
                className={`h-44 md:h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105 ${
                  i % 5 === 0 ? "md:h-full" : ""
                }`}
              />
              <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-md leading-relaxed">
          Le foto più autentiche si vivono sul campo. Seguici su Instagram per i contenuti della notte.
        </p>
      </div>
    </section>
  );
}