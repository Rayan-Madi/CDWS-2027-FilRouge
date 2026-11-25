import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Atelier } from "../types";
import { useCompte } from "../contexts/Compte";
import { useInscriptions } from "../contexts/Inscriptions";
import { CHEMINS } from "../utils/chemins";

/**
 * Ce que font les boutons d'inscription, partout où ils apparaissent :
 * sans compte, on part créer son compte (et on reviendra ici) ; pour se désinscrire, on confirme d'abord.
 * Next.js n'a pas de state de navigation : « d'où l'on vient » et « pourquoi » passent dans l'adresse.
 */
export function useActionsInscription() {
  const { utilisateur } = useCompte();
  const { inscrire: inscrireAuServeur, desinscrire } = useInscriptions();
  const routeur = useRouter();
  const [aConfirmer, setAConfirmer] = useState<Atelier | null>(null);

  const inscrire = useCallback(
    (atelier: Atelier) => {
      if (!utilisateur) {
        // Lue au clic, dans le gestionnaire : l'adresse exacte, filtre du catalogue compris
        const retour = new URLSearchParams({ depuis: `${window.location.pathname}${window.location.search}`, pourquoi: atelier.titre });
        routeur.push(`${CHEMINS.inscription}?${retour.toString()}`);
        return;
      }
      void inscrireAuServeur(atelier);
    },
    [utilisateur, inscrireAuServeur, routeur]
  );

  const confirmer = useCallback(async () => {
    if (!aConfirmer) return;
    // En cas de refus, la modale reste ouverte avec son message : on ne ferme que sur un succès
    if (await desinscrire(aConfirmer)) setAConfirmer(null);
  }, [aConfirmer, desinscrire]);

  const annuler = useCallback(() => setAConfirmer(null), []);

  return { inscrire, demanderDesinscription: setAConfirmer, aConfirmer, confirmer, annuler };
}
