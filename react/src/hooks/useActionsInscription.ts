import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Atelier } from "../types";
import { useCompte } from "../contexts/Compte";
import { useInscriptions } from "../contexts/Inscriptions";
import { CHEMINS } from "../router/chemins";

/**
 * Ce que font les boutons d'inscription, partout où ils apparaissent :
 * sans compte, on part créer son compte (et on reviendra ici) ; pour se désinscrire, on confirme d'abord.
 */
export function useActionsInscription() {
  const { utilisateur } = useCompte();
  const { inscrire: inscrireAuServeur, desinscrire } = useInscriptions();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [aConfirmer, setAConfirmer] = useState<Atelier | null>(null);

  const inscrire = useCallback(
    (atelier: Atelier) => {
      if (!utilisateur) {
        // depuis : l'adresse où revenir une fois le compte créé
        navigate(CHEMINS.inscription, { state: { depuis: `${pathname}${search}`, pourquoi: atelier.titre } });
        return;
      }
      void inscrireAuServeur(atelier);
    },
    [utilisateur, inscrireAuServeur, navigate, pathname, search]
  );

  const confirmer = useCallback(async () => {
    if (!aConfirmer) return;
    // En cas de refus, la modale reste ouverte avec son message : on ne ferme que sur un succès
    if (await desinscrire(aConfirmer)) setAConfirmer(null);
  }, [aConfirmer, desinscrire]);

  const annuler = useCallback(() => setAConfirmer(null), []);

  return { inscrire, demanderDesinscription: setAConfirmer, aConfirmer, confirmer, annuler };
}
