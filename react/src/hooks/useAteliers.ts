import { useCallback, useEffect, useMemo, useState } from "react";
import type { Atelier } from "../types";
import { useAteliersCrees } from "../contexts/AteliersCrees";
import { chargerAteliers, ErreurChargement } from "../services/api";
import { URL_CATALOGUE } from "../services/config";

/** Les états d'une requête, en union : pas de données pendant le chargement, pas d'erreur en succès. */
export type Requete<T> =
  | { statut: "chargement" }
  | { statut: "erreur"; erreur: ErreurChargement }
  | { statut: "succes"; donnees: T };

/** Le catalogue, chargé par le module de FM03 (inchangé), annulé si le composant disparaît, et complété des ateliers publiés pendant la visite. */
export function useAteliers(): { requete: Requete<readonly Atelier[]>; recharger: () => void } {
  const [requete, setRequete] = useState<Requete<readonly Atelier[]>>({ statut: "chargement" });
  const [essai, setEssai] = useState(0); // « Réessayer » relance l'effet en changeant ce compteur

  useEffect(() => {
    const arret = new AbortController();
    chargerAteliers(arret.signal, { url: URL_CATALOGUE })
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

  // Valeur DÉRIVÉE : le catalogue du serveur plus les ateliers publiés ici, recalculée quand l'un des deux change
  const { crees } = useAteliersCrees();
  const complete = useMemo<Requete<readonly Atelier[]>>(
    () => (requete.statut === "succes" && crees.length > 0 ? { statut: "succes", donnees: [...crees, ...requete.donnees] } : requete),
    [requete, crees]
  );
  return { requete: complete, recharger };
}
