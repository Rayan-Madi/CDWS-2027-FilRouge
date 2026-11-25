"use client";

import { BoutonAction } from "@/components/Action";

/**
 * L'état « erreur » du catalogue de FM03, en Next.js : une page serveur qui échoue rend ce composant.
 * La phrase reste sans code ; le détail est dans les journaux du serveur (error.digest).
 */
export default function ErreurAteliers({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <h1 tabIndex={-1} data-titre-de-vue className="mb-4 text-[clamp(1.953rem,5vw+0.5rem,3.052rem)] leading-titre font-semibold focus:outline-none">
        Les ateliers du moment
      </h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-m border border-l-4 border-erreur bg-fond px-6 py-4">
        <p role="alert">
          <strong className="text-erreur">Impossible de charger les ateliers.</strong> Le serveur ne répond pas pour le moment. Réessayez dans un instant.
        </p>
        <BoutonAction variante="secondaire" onClick={retry}>
          Réessayer
        </BoutonAction>
      </div>
    </div>
  );
}
