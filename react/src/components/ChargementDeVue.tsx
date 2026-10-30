/**
 * Ce qu'affiche Suspense pendant le téléchargement d'une vue découpée (lazy), au premier chargement
 * d'une adresse de l'espace. Ensuite, React Router navigue dans un startTransition : l'ancienne page reste
 * affichée le temps du téléchargement, et la nouvelle arrive d'un bloc, h1 compris (le focus de Layout le trouve).
 */
export function ChargementDeVue() {
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8" aria-busy="true">
      <p role="status" className="text-texte-doux">
        Chargement de la page…
      </p>
    </div>
  );
}
