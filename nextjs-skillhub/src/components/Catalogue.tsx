"use client";

import type { Atelier } from "../types";
import { useCriteres } from "../hooks/useCriteres";
import { CRITERES_PAR_DEFAUT, decrireResultat, filtrerAteliers, MESSAGE_VIDE } from "../utils/filtre";
import { BoutonAction } from "./Action";
import { FiltresAteliers } from "./FiltresAteliers";
import { ListeAteliers } from "./ListeAteliers";

/**
 * Le catalogue, côté client : il ne charge plus rien, la page serveur lui passe les ateliers.
 * Restent ici la recherche, le filtre dans l'URL et les deux états qui en dépendent (vide, succès).
 * Le chargement et l'erreur sont passés au serveur : prérendu, et error.tsx.
 */
export function Catalogue({ ateliers }: { ateliers: readonly Atelier[] }) {
  const [criteres, changerCriteres] = useCriteres();
  // Valeur DÉRIVÉE : recalculée à chaque rendu, jamais rangée dans un état
  const visibles = filtrerAteliers(ateliers, criteres);

  return (
    <>
      <FiltresAteliers criteres={criteres} onChange={changerCriteres} />
      <p role="status" className="mt-4 font-semibold text-texte-doux">
        {visibles.length === 0 ? MESSAGE_VIDE : decrireResultat(visibles.length, criteres)}
      </p>
      {visibles.length === 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-m border border-dashed border-texte-doux bg-fond px-6 py-4">
          <p>Changez de niveau ou de mot-clé, ou revenez au catalogue complet.</p>
          <BoutonAction
            variante="secondaire"
            onClick={() => {
              changerCriteres(CRITERES_PAR_DEFAUT);
              document.getElementById("recherche")?.focus(); // on repart de la première commande
            }}
          >
            Tout afficher
          </BoutonAction>
        </div>
      ) : (
        <ListeAteliers ateliers={visibles} />
      )}
    </>
  );
}
