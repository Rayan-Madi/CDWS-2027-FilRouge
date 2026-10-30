"use client";

import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../utils/chemins";
import { LienAction } from "./Action";

/** Le seul morceau de l'accroche qui dépend du compte : client. Le reste de la page est rendu au build. */
export function BoutonsAccroche() {
  const { utilisateur } = useCompte();
  return (
    <p className="mt-6 flex flex-wrap gap-3">
      {utilisateur ? <LienAction href={CHEMINS.monEspace}>Mon espace</LienAction> : <LienAction href={CHEMINS.inscription}>Créer mon compte</LienAction>}
      <LienAction href={CHEMINS.ateliers} variante="secondaire">
        Voir les ateliers
      </LienAction>
    </p>
  );
}
