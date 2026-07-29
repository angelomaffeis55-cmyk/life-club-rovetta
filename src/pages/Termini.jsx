import LegalLayout from "@/components/LegalLayout";

export const meta = {
  title: "Termini e condizioni — Prenotazione biglietti",
  updated: "luglio 2026",
};

export default function Termini() {
  return (
    <LegalLayout title="Termini — Prenotazione biglietti" updated={meta.updated}>
      <Section title="Oggetto">
        <p>
          Le presenti condizioni regolano la prenotazione e l'utilizzo dei Digital Pass (biglietti) per gli eventi organizzati da Life Club Rovetta presso la sede di Via Vogno 7, Rovetta (BG).
        </p>
      </Section>

      <Section title="Prenotazione e Digital Pass">
        <ul>
          <li>La prenotazione sul sito genera un <strong>Digital Pass</strong> contenente un codice QR univoco per ogni biglietto.</li>
          <li>Il biglietto è <strong>personale e non cedibile</strong>; all'ingresso lo staff può richiedere un documento d'identità a fronte del nome presente sul biglietto.</li>
          <li>Ogni biglietto presenta un codice QR <strong>monouso</strong>: una volta timbrato all'ingresso non può più essere riutilizzato.</li>
          <li>Il biglietto è valido <strong>solo per l'evento e la data indicati</strong>; non è valido per altre serate.</li>
        </ul>
      </Section>

      <Section title="Prezzi e commissioni">
        <ul>
          <li>Il prezzo indicato sul sito comprensivo di una <strong>commissione di €1,00 per biglietto</strong> applicata agli eventi a pagamento.</li>
          <li>Gli eventi con prezzo gratuito non hanno commissione.</li>
          <li>Il pagamento avviene all'ingresso nel modo indicato nella conferma.</li>
        </ul>
      </Section>

      <Section title="Rimborsi e cancellazioni">
        <ul>
          <li>I biglietti non sono rimborsabili tranne per annullamento o spostamento dell'evento da parte della Direzione; in tal caso viene corrisposto il rimborso integrale.</li>
          <li>La Direzione si riserva di limitare o annullare l'evento per motivi di forza maggiore, normativi o di sicurezza.</li>
        </ul>
      </Section>

      <Section title="Regolamento d'accesso">
        <ul>
          <li>L'ingresso è consentito solo a maggiori di 14 anni per eventi diurni e 16/18 anni per serate notturne, secondo il regolamento del singolo evento.</li>
          <li>La Direzione può rifiutare l'ingresso per motivi di sicurezza, comportamento o mancato rispetto del regolamento.</li>
          <li>L'accesso è soggetto alla capienza massima del locale (S.C.A.L.).</li>
        </ul>
      </Section>

      <Section title="Reclami e foro competente">
        <p>
          Per ogni contestazione è possibile scrivere a <a className="text-accent" href="mailto:info@lifeclub.it">info@lifeclub.it</a>.
          Per le controversie è competente in via esclusiva il Foro di Bergamo.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">{title}</h2>
      <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}