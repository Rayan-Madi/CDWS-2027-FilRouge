/* Charger le catalogue : le motif complet du cours (5.2), erreurs comprises.
   Trois choses que fetch ne fait pas seul : rejeter sur un 404 ou un 500, abandonner au bout d'un temps,
   et vérifier que la réponse a la forme annoncée. */
import type { Atelier } from "../types.js";
import { estNiveau } from "../utils/filtre.js";

/** Le fichier, situé par rapport à CE module (src/js/api.js → src/donnees/) : juste, quelle que soit la page. */
export const URL_ATELIERS = new URL("../donnees/ateliers.json", import.meta.url);

/** Au-delà, on arrête d'attendre : un indicateur qui tourne pour toujours est un écran cassé. */
export const DELAI_MAX = 8000;

export type RaisonPanne = "reseau" | "http" | "delai" | "format";

/** Une panne de chargement : sa raison et son code HTTP pour le code et la console, jamais pour l'écran. */
export class ErreurChargement extends Error {
  readonly raison: RaisonPanne;
  readonly statut: number | undefined;

  constructor(raison: RaisonPanne, message: string, { statut, cause }: { statut?: number; cause?: unknown } = {}) {
    super(message, { cause });
    this.name = "ErreurChargement";
    this.raison = raison;
    this.statut = statut;
  }
}

const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const estTexte = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const estEntierPositif = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

/** Le contrôle que le type ne fait pas : « as Promise<Atelier[]> » est une promesse, pas une vérification. */
export function estAtelier(valeur: unknown): valeur is Atelier {
  return (
    estObjet(valeur) &&
    estTexte(valeur.id) &&
    estTexte(valeur.titre) &&
    estNiveau(valeur.niveau) &&
    typeof valeur.prix === "number" &&
    Number.isFinite(valeur.prix) &&
    valeur.prix >= 0 &&
    estEntierPositif(valeur.places) &&
    estTexte(valeur.formateur) &&
    estTexte(valeur.categorie) &&
    estTexte(valeur.description) &&
    estTexte(valeur.prerequis) &&
    estEntierPositif(valeur.duree) &&
    valeur.duree > 0 &&
    estTexte(valeur.lieu) &&
    estTexte(valeur.date) &&
    !Number.isNaN(Date.parse(valeur.date))
  );
}

const estListeDAteliers = (v: unknown): v is Atelier[] => Array.isArray(v) && v.every(estAtelier);

export interface OptionsChargement {
  readonly url?: string | URL;
  readonly delaiMax?: number;
}

/**
 * Le catalogue, vérifié. Lève une ErreurChargement (réseau, HTTP, délai, format) ;
 * si l'APPELANT annule par son signal, l'AbortError passe telle quelle : une annulation n'est pas une panne.
 */
export async function chargerAteliers(
  signal?: AbortSignal,
  { url = URL_ATELIERS, delaiMax = DELAI_MAX }: OptionsChargement = {}
): Promise<Atelier[]> {
  // UN signal pour fetch, qui tombe au premier des deux : l'appelant annule, ou le délai expire.
  // Écrit à la main avec un AbortController (cours, 2.4) plutôt qu'avec AbortSignal.any, trop récent
  // pour tous les navigateurs : sans lui, le catalogue resterait en panne pour toujours.
  const arret = new AbortController();
  let delaiDepasse = false;
  const minuterie = setTimeout(() => {
    delaiDepasse = true;
    arret.abort();
  }, delaiMax);
  const relayer = (): void => arret.abort(signal?.reason);
  if (signal?.aborted) relayer();
  signal?.addEventListener("abort", relayer, { once: true });

  try {
    const reponse = await fetch(url, { headers: { Accept: "application/json" }, signal: arret.signal });
    // fetch NE REJETTE PAS sur un 404 ou un 500 : une réponse est arrivée, la promesse est tenue
    if (!reponse.ok) {
      throw new ErreurChargement("http", `Chargement impossible (${reponse.status})`, { statut: reponse.status });
    }
    const donnees: unknown = await reponse.json(); // une seconde opération asynchrone : elle peut échouer aussi
    if (!estListeDAteliers(donnees)) {
      throw new ErreurChargement("format", "La réponse n'a pas la forme d'une liste d'ateliers");
    }
    return donnees;
  } catch (erreur) {
    if (erreur instanceof ErreurChargement) throw erreur;
    if (signal?.aborted) throw erreur; // annulation voulue : AbortError, rendue telle quelle
    if (delaiDepasse) {
      throw new ErreurChargement("delai", `Pas de réponse en ${delaiMax / 1000} s`, { cause: erreur });
    }
    if (erreur instanceof SyntaxError) {
      throw new ErreurChargement("format", "La réponse n'est pas du JSON", { cause: erreur });
    }
    throw new ErreurChargement("reseau", "Le réseau ne répond pas", { cause: erreur }); // la seule chose que fetch rejette
  } finally {
    // Quoi qu'il arrive : la minuterie et l'écouteur partent. Même fonction (relayer) des deux côtés,
    // sinon removeEventListener ne retirerait rien.
    clearTimeout(minuterie);
    signal?.removeEventListener("abort", relayer);
  }
}
