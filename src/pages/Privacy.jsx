import LegalLayout from "@/components/LegalLayout";

export const meta = {
  title: "Privacy Policy",
  updated: "luglio 2026",
};

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated={meta.updated}>
      <Section title="Titolare del trattamento">
        <p>
          Il Titolare del trattamento dei dati è <strong>Life Club Rovetta</strong>, con sede in Via Vogno 7, 24020 Rovetta (BG).
          Contatti: <a className="text-accent" href="mailto:info@lifeclub.it">info@lifeclub.it</a> — tel. 335 5847474.
        </p>
      </Section>

      <Section title="Tipologie di dati raccolti">
        <p>Raccogliamo i dati che ci fornisci direttamente tramite il sito:</p>
        <ul>
          <li><strong>Prenotazione biglietti</strong>: nome, cognome, email, telefono, codice di conferma e codici dei biglietti.</li>
          <li><strong>Account staff</strong>: credenziali di accesso per l'area scanner.</li>
          <li><strong>Dati di navigazione</strong>: indirizzo IP, tipo di browser, sistema operativo, dati di sessione e cookie (vedi Cookie Policy).</li>
        </ul>
      </Section>

      <Section title="Finalità e base giuridica">
        <ul>
          <li><strong>Erogazione del servizio</strong> (prenotazione e invio del Digital Pass): base contrattuale.</li>
          <li><strong>Controllo accessi all'ingresso</strong> (validazione QR e registro presenze): base contrattuale e obbligo legale di sicurezza.</li>
          <li><strong>Comunicazioni relative alla prenotazione</strong> (email di conferma/ricevute): base contrattuale.</li>
          <li><strong>Marketing/newsletter</strong> (solo se acconsenti esplicitamente): consenso revocabile in qualsiasi momento.</li>
          <li><strong>Adempimenti fiscali/amministrativi</strong>: obbligo legale.</li>
        </ul>
      </Section>

      <Section title="Conservazione dei dati">
        <p>
          I dati di prenotazione e i codici biglietto sono conservati per <strong>24 mesi</strong> dalla data dell'evento per fini di sicurezza, controllo accessi e contenziosi.
          I dati di navigazione (log/cookie) sono conservati per il periodo minimo necessario, comunque non oltre 26 mesi.
        </p>
      </Section>

      <Section title="Condivisione dei dati">
        <p>
          I dati sono trattati esclusivamente da Life Club Rovetta e dai provider tecnici necessari all'erogazione del servizio (piattaforma di hosting, database e invio email).
          Non vendiamo né cediamo i dati a terzi. I biglietti validati all'ingresso sono accessibili solo allo staff autorizzato tramite account amministratore.
        </p>
      </Section>

      <Section title="Diritti dell'interessato">
        <p>Puoi esercitare in qualsiasi momento i diritti previsti dal Regolamento UE 679/2016 (GDPR):</p>
        <ul>
          <li>Accesso, rettifica, cancellazione ("diritto all'oblio")</li>
          <li>Limitazione e opposizione al trattamento</li>
          <li>Portabilità dei dati</li>
          <li>Revoca del consenso (per il marketing)</li>
          <li>Reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it)</li>
        </ul>
        <p>Per esercitare i diritti scrivi a <a className="text-accent" href="mailto:info@lifeclub.it">info@lifeclub.it</a>.</p>
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