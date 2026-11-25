"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Atelier } from "../types";
import { annulerReservation, ErreurServeur, reserver } from "../services/serveur-simule";
import { useCompte } from "./Compte";

export type Envoi = "inscription" | "desinscription";

type ValeurInscriptions = {
  inscrits: ReadonlySet<string>;
  /** L'envoi en cours pour un atelier, s'il y en a un. */
  envois: ReadonlyMap<string, Envoi>;
  /** Le dernier refus du serveur pour un atelier. */
  erreurs: ReadonlyMap<string, string>;
  /** Rendent vrai si le serveur a accepté. */
  inscrire: (atelier: Atelier) => Promise<boolean>;
  desinscrire: (atelier: Atelier) => Promise<boolean>;
  /** Valeur DÉRIVÉE : les places du JSON, moins la mienne si je suis inscrit. Jamais un état. */
  placesRestantes: (atelier: Atelier) => number;
};

const InscriptionsContext = createContext<ValeurInscriptions | null>(null);

// Les Map et Set sont copiés, jamais modifiés : un nouvel objet, sinon React ne voit rien
const avec = <V,>(carte: ReadonlyMap<string, V>, cle: string, valeur: V) => new Map(carte).set(cle, valeur);
const sans = <V,>(carte: ReadonlyMap<string, V>, cle: string) => {
  const copie = new Map(carte);
  copie.delete(cle);
  return copie;
};

export function FournisseurInscriptions({ children }: { children: ReactNode }) {
  const { utilisateur } = useCompte();
  const [inscrits, setInscrits] = useState<ReadonlySet<string>>(new Set());
  const [envois, setEnvois] = useState<ReadonlyMap<string, Envoi>>(new Map());
  const [erreurs, setErreurs] = useState<ReadonlyMap<string, string>>(new Map());
  const courriel = utilisateur?.courriel;
  const nom = utilisateur?.nom;

  // Le même déroulé pour les deux sens : envoi en cours, appel, puis succès ou refus
  const envoyer = useCallback(async (atelier: Atelier, sens: Envoi, appel: () => Promise<void>, succes: () => void) => {
    setEnvois((p) => avec(p, atelier.id, sens));
    setErreurs((p) => sans(p, atelier.id));
    try {
      await appel();
      succes();
      return true;
    } catch (erreur) {
      const message = erreur instanceof ErreurServeur ? erreur.message : "L'opération n'a pas pu aboutir. Réessayez dans un instant.";
      if (!(erreur instanceof ErreurServeur)) console.error(erreur);
      setErreurs((p) => avec(p, atelier.id, message));
      return false;
    } finally {
      setEnvois((p) => sans(p, atelier.id));
    }
  }, []);

  const inscrire = useCallback(
    async (atelier: Atelier) => {
      if (!courriel || !nom) return false; // sans compte, l'appelant envoie vers /inscription
      return envoyer(
        atelier,
        "inscription",
        () => reserver({ atelierId: atelier.id, nom, courriel }, atelier.places),
        () => setInscrits((p) => new Set(p).add(atelier.id))
      );
    },
    [courriel, nom, envoyer]
  );

  const desinscrire = useCallback(
    async (atelier: Atelier) => {
      if (!courriel) return false;
      return envoyer(
        atelier,
        "desinscription",
        () => annulerReservation({ atelierId: atelier.id, courriel }),
        () =>
          setInscrits((p) => {
            const copie = new Set(p);
            copie.delete(atelier.id);
            return copie;
          })
      );
    },
    [courriel, envoyer]
  );

  const placesRestantes = useCallback(
    (atelier: Atelier) => Math.max(0, atelier.places - (inscrits.has(atelier.id) ? 1 : 0)),
    [inscrits]
  );

  const valeur = useMemo(
    () => ({ inscrits, envois, erreurs, inscrire, desinscrire, placesRestantes }),
    [inscrits, envois, erreurs, inscrire, desinscrire, placesRestantes]
  );
  return <InscriptionsContext.Provider value={valeur}>{children}</InscriptionsContext.Provider>;
}

export function useInscriptions(): ValeurInscriptions {
  const valeur = useContext(InscriptionsContext);
  if (!valeur) throw new Error("useInscriptions doit être appelé sous <FournisseurInscriptions>.");
  return valeur;
}
