import LegalLayout from "@/components/LegalLayout";

export const meta = {
  title: "Cookie Policy",
  updated: "luglio 2026",
};

export default function Cookie() {
  return (
    <LegalLayout title="Cookie Policy" updated={meta.updated}>
      <Section title="Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che i siti visitati salvano sul tuo dispositivo per memorizzare informazioni sulla tua navigazione.
        </p>
      </Section>

      <Section title="Cookie tecnici (sempre attivi)">
        <p>Sono necessari al funzionamento del sito: memorizzano ad esempio la tua scelta sui cookie e lo stato della sessione. Non richiedono consenso.</p>
      </Section>

      <Section title="Cookie di statistica / misurazione">
        <p>
          Eventuali strumenti di analisi (es. visitatori, pagine viste) raccolgono dati aggregati. Sono attivati solo dopo il tuo consenso tramite il banner.
          Questo sito non utilizza cookie di profilazione né cookie di terze parti per marketing.
        </p>
      </Section>

      <Section title="Gestione e disattivazione">
        <p>Puoi modificare in qualsiasi momento le tue preferenze tramite il link "Cookie" nel footer.</p>
        <p>Puoi inoltre disabilitare i cookie direttamente dalle impostazioni del tuo browser:</p>
        <ul>
          <li><a className="text-accent" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a></li>
          <li><a className="text-accent" href="https://support.mozilla.org/it/kb/Abilitare%20e%20disabilitare%20i%20cookie" target="_blank" rel="noreferrer">Firefox</a></li>
          <li><a className="text-accent" href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
        </ul>
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