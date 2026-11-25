"use client";

import type { Atelier } from "../types";
import { useInscriptions } from "../contexts/Inscriptions";
import { useActionsInscription } from "../hooks/useActionsInscription";
import { formaterDate } from "../utils/format";
import { BoutonAction } from "./Action";
import { CarteAtelier } from "./CarteAtelier";
import { Modale } from "./Modale";

/**
 * La grille des cartes, mobile d'abord : 1 colonne, puis 2, 3 et 4. Elle branche chaque carte
 * sur les inscriptions et rend la confirmation de désinscription.
 */
export function ListeAteliers({ ateliers, niveauTitre = 2 }: { ateliers: readonly Atelier[]; niveauTitre?: 2 | 3 }) {
  const { inscrits, envois, erreurs, placesRestantes } = useInscriptions();
  const { inscrire, demanderDesinscription, aConfirmer, confirmer, annuler } = useActionsInscription();
  const parId = (id: string) => ateliers.find((a) => a.id === id);
  const envoiConfirmation = aConfirmer ? envois.get(aConfirmer.id) : undefined;

  return (
    <>
      <ul role="list" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ateliers.map((atelier) => (
          // key = l'identifiant, jamais l'index : sinon l'état d'une carte suivrait sa position
          <li key={atelier.id}>
            <CarteAtelier
              atelier={atelier}
              placesRestantes={placesRestantes(atelier)}
              inscrit={inscrits.has(atelier.id)}
              envoi={envois.get(atelier.id)}
              erreur={erreurs.get(atelier.id)}
              niveauTitre={niveauTitre}
              onInscrire={(id) => {
                const a = parId(id);
                if (a) inscrire(a);
              }}
              onDesinscrire={(id) => {
                const a = parId(id);
                if (a) demanderDesinscription(a);
              }}
            />
          </li>
        ))}
      </ul>
      <ConfirmationDesinscription atelier={aConfirmer} envoi={envoiConfirmation !== undefined} erreur={aConfirmer ? erreurs.get(aConfirmer.id) : undefined} onConfirmer={confirmer} onAnnuler={annuler} />
    </>
  );
}

type PropsConfirmation = {
  atelier: Atelier | null;
  envoi: boolean;
  erreur: string | undefined;
  onConfirmer: () => void;
  onAnnuler: () => void;
};

/** « Se désinscrire de … ? » : une action qui libère une place se confirme. */
export function ConfirmationDesinscription({ atelier, envoi, erreur, onConfirmer, onAnnuler }: PropsConfirmation) {
  return (
    <Modale ouverte={atelier !== null} titre={atelier ? `Se désinscrire de « ${atelier.titre} » ?` : ""} bloquee={envoi} onFermer={onAnnuler}>
      {atelier && <p className="mb-4 text-texte-doux">{formaterDate(atelier.date)}. Votre place sera rendue à une autre personne.</p>}
      {erreur && (
        <p role="alert" className="mb-4 font-semibold text-erreur">
          {erreur}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <BoutonAction aria-disabled={envoi || undefined} onClick={() => !envoi && onConfirmer()}>
          {envoi ? "Désinscription en cours…" : "Confirmer la désinscription"}
        </BoutonAction>
        <BoutonAction variante="secondaire" onClick={() => !envoi && onAnnuler()} aria-disabled={envoi || undefined}>
          Garder ma place
        </BoutonAction>
      </div>
    </Modale>
  );
}
