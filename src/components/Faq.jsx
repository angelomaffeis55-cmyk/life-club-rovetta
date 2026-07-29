import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Come funziona la prevendita online?",
    a: "Scegli l'evento dalla sezione 'Le prossime serate', compila i dati della prenotazione (nome, email, telefono) e seleziona il numero di biglietti. Al termine ricevi subito un Digital Pass in PDF con un QR code per ogni biglietto, da mostrare all'ingresso.",
  },
  {
    q: "Cosa ricevo dopo la prenotazione?",
    a: "Ricevi un PDF scaricabile contenente un pass individuale per ogni biglietto prenotato. Ogni pass ha il proprio QR code univoco, il nominativo e il numero di posto/serata. Lo scarichi subito dal browser al termine della prenotazione.",
  },
  {
    q: "Il Digital Pass con il QR è valido all'ingresso?",
    a: "Sì. Il codice QR viene validato dal nostro staff allo scanner dell'ingresso. Non c'è bisogno di stampare: puoi mostrare il PDF dal telefono. Ogni QR può essere timbrato una sola volta.",
  },
  {
    q: "Posso prenotare più di un biglietto?",
    a: "Sì, puoi prenotare più biglietti in una sola prenotazione: ogni biglietto avrà il proprio QR individuale. Consigliamo di prenotare unicamente per chi entrerà realmente, perché ogni ingresso viene registrato a nome del titolare.",
  },
  {
    q: "Devo pagare online al momento della prenotazione?",
    a: "No. La prenotazione online serve a garantirsi l'ingresso e saltare la coda. Il pagamento (quando previsto) avviene al momento dell'ingresso in discoteca. Per gli eventi gratuiti la prenotazione è completamente gratuita.",
  },
  {
    q: "Posso cambiare il nome sul biglietto?",
    a: "Il QR è associato al nominativo indicato in fase di prenotazione. Per passare un biglietto a un'altra persona contatta la direzione prima dell'evento: lo staff verifica comunque il codice QR all'ingresso.",
  },
  {
    q: "Posso annullare o modificare la prenotazione?",
    a: "Se non riesci a venire, scrivici a info@lifeclub.it o al 335 5847474. L'annullamento libera il posto per altri partecipanti. Le modifiche al numero di biglietti vanno comunicate prima dell'apertura serale.",
  },
  {
    q: "Quali sono gli orari di apertura e l'età minima?",
    a: "Apertura serale nei weekend e per eventi, di solito dalle 23:00 fino a notte fonda. L'ingresso è consentito solo a maggiorenni con un documento d'identità valido: verrà comunque verificato all'ingresso insieme al QR.",
  },
  {
    q: "Il QR non si legge o non trovo il PDF, cosa faccio?",
    a: "Controlla di aver scaricato il PDF al termine della prenotazione (controlla anche la cartella 'Download'). Se hai problemi, al gate basta comunicare il codice di conferma e il nominativo allo staff, che verifica la prenotazione manualmente.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="relative py-20 md:py-32 px-5 md:px-8 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-4">FAQ</p>
        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[0.95]">
          Domande<br />frequenti
        </h2>
        <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
          Tutto quello che devi sapere sulla prevendita, il Digital Pass e l'ingresso al Life Club Rovetta.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base md:text-lg font-bold text-foreground hover:text-accent transition-colors py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}