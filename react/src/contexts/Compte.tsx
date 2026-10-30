import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Inscription } from "../types";
import { inscrire } from "../services/serveur-simule";

type ValeurCompte = {
  /** La personne inscrite sur le site, ou null. En mémoire : un rechargement repart de zéro (pas de back-end avant BC02). */
  utilisateur: Inscription | null;
  /** Crée le compte auprès du serveur simulé, puis connecte la personne pour la visite. */
  creerCompte: (inscription: Inscription) => Promise<void>;
};

const CompteContext = createContext<ValeurCompte | null>(null);

export function FournisseurCompte({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Inscription | null>(null);

  const creerCompte = useCallback(async (inscription: Inscription) => {
    await inscrire(inscription); // lève ErreurServeur si l'adresse est déjà prise
    setUtilisateur(inscription);
  }, []);

  // useMemo : sans lui, un nouvel objet à chaque rendu re-rendrait tous les consommateurs
  const valeur = useMemo(() => ({ utilisateur, creerCompte }), [utilisateur, creerCompte]);
  return <CompteContext.Provider value={valeur}>{children}</CompteContext.Provider>;
}

/** Le hook maison : les composants n'importent jamais le contexte lui-même. */
export function useCompte(): ValeurCompte {
  const valeur = useContext(CompteContext);
  if (!valeur) throw new Error("useCompte doit être appelé sous <FournisseurCompte>.");
  return valeur;
}
