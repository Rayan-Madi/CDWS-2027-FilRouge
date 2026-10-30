/* Les SVG de FM03, décoratifs : aria-hidden, jamais focalisables. Le texte voisin dit ce qu'ils montrent. */

export function IconeLogo() {
  return (
    <svg className="text-accent" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M9 20c1.5 2 4 3 7 3 3.5 0 6-1.6 6-4.2 0-2.4-2-3.4-5.6-4.2-3-.7-4-1.2-4-2.4 0-1.2 1.2-2 3.2-2 1.9 0 3.3.7 4.2 1.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeChevron({ ouvert }: { ouvert: boolean }) {
  return (
    <svg className={`size-4 shrink-0 transition-transform ${ouvert ? "rotate-180" : ""}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const VALEURS = {
  proximite: "M16 11a4 4 0 1 0-8 0M4 20c0-3 3.6-5 8-5s8 2 8 5M12 3v2",
  transparence: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z",
  exigence: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
};

export function IconeValeur({ nom }: { nom: keyof typeof VALEURS }) {
  return (
    <svg className="mb-3 text-accent" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {nom === "transparence" && <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      <path d={VALEURS[nom]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
