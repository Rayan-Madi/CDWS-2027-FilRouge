"use client";

import type { Atelier } from "../types";
import { useInscriptions } from "../contexts/Inscriptions";
import { useActionsInscription } from "../hooks/useActionsInscription";
import { formaterPlaces } from "../utils/format";
import { ActionInscription } from "./ActionInscription";
import { ConfirmationDesinscription } from "./ListeAteliers";

/**
 * La seule partie de la fiche qui réagit : le bouton et sa confirmation. La page reste serveur et lui passe
 * l'atelier (des données, sérialisables), jamais une fonction : c'est ici que naissent les gestionnaires.
 */
export function ActionsFiche({ atelier }: { atelier: Atelier }) {
  const { inscrits, envois, erreurs, placesRestantes } = useInscriptions();
  const { inscrire, demanderDesinscription, aConfirmer, confirmer, annuler } = useActionsInscription();
  const places = placesRestantes(atelier);
  const inscrit = inscrits.has(atelier.id);

  return (
    <>
      <p className="mt-4">
        {/* Dépend de MES inscriptions : calculé ici, côté client, et non dans le HTML prérendu */}
        <span className="font-semibold">Places : </span>
        {formaterPlaces(places)}
      </p>
      <div className="mt-6 max-w-xl">
        <ActionInscription
          titre={atelier.titre}
          inscrit={inscrit}
          complet={places === 0}
          envoi={envois.get(atelier.id)}
          erreur={erreurs.get(atelier.id)}
          onInscrire={() => inscrire(atelier)}
          onDesinscrire={() => demanderDesinscription(atelier)}
        />
      </div>
      <ConfirmationDesinscription atelier={aConfirmer} envoi={aConfirmer ? envois.has(aConfirmer.id) : false} erreur={aConfirmer ? erreurs.get(aConfirmer.id) : undefined} onConfirmer={confirmer} onAnnuler={annuler} />
    </>
  );
}
