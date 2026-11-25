/** Trois cartes de chargement, à la taille des vraies : la place est réservée AVANT l'arrivée des données. */
export function CartesFantomes() {
  return (
    <ul role="list" aria-hidden="true" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <li key={n} className="flex min-h-96 flex-col gap-3 rounded-m border border-bordure bg-fond p-6">
          <span className="h-6 w-3/4 animate-pulse rounded-s bg-fond-teinte" />
          <span className="h-4 w-1/3 animate-pulse rounded-s bg-fond-teinte" />
          <span className="h-12 animate-pulse rounded-s bg-fond-teinte" />
          <span className="h-4 w-5/6 animate-pulse rounded-s bg-fond-teinte" />
          <span className="mt-auto h-11 w-36 animate-pulse rounded-full bg-fond-teinte" />
        </li>
      ))}
    </ul>
  );
}
