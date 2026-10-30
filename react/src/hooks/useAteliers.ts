import { useCallback, useEffect, useState } from "react";
import type { Atelier } from "../types";
import { chargerAteliers, ErreurChargement } from "../services/api";

/** Les états d'une requête, en union : pas de données pendant le chargement, pas d'erreur en succès. */
export type Requete<T> =
  | { statut: "chargement" }
  | { statut: "erreur"; erreur: ErreurChargement }
  | { statut: "succes"; donnees: T };

/** Le catalogue, chargé par le module de FM03 (inchangé), annulé si le composant disparaît. */
export function useAteliers(): { requete: Requete<readonly Atelier[]>; recharger: () => void } {
  const [requete, setRequete] = useState<Requete<readonly Atelier[]>>({ statut: "chargement" });
  const [essai, setEssai] = useState(0); // « Réessayer » relance l'effet en changeant ce compteur

  useEffect(() => {
    const arret = new AbortController();
    chargerAteliers(arret.signal)
      .then((donnees) => setRequete({ statut: "succes", donnees }))
      .catch((erreur: unknown) => {
        if (arret.signal.aborted) return; // annulation : normal, rien à afficher
        const panne = erreur instanceof ErreurChargement ? erreur : new ErreurChargement("format", String(erreur), { cause: erreur });
        console.error(`SkillHub : catalogue non chargé (${panne.raison}${panne.statut ? ` ${panne.statut}` : ""}).`, panne);
        setRequete({ statut: "erreur", erreur: panne });
      });
    // NETTOYAGE : le composant part (ou on relance), la requête aussi
    return () => arret.abort();
  }, [essai]);

  // L'état repasse à « chargement » ici, dans le gestionnaire, et non dans l'effet : un effet ne sert
  // qu'à se synchroniser avec l'extérieur (diapo 49)
  const recharger = useCallback(() => {
    setRequete({ statut: "chargement" });
    setEssai((n) => n + 1);
  }, []);
  return { requete, recharger };
}
