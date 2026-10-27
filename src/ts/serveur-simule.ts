/* Pas de back-end dans ce projet (GitHub Pages ne sert que des fichiers) : ce module tient le rôle du
   serveur, avec son délai de réponse et ses refus. Le jour où l'API existe, seules ces deux fonctions
   changent : un POST sur /api/inscriptions, qui répond 201, ou 409 « déjà inscrit » (cours, 5.3). */
import type { Inscription, Reservation } from "./types.js";

export const DELAI_SIMULE = 800;

export type RaisonRefus = "deja-inscrit" | "complet";

/** Un refus du serveur : il a une raison (pour le code) et une phrase (pour la personne). */
export class ErreurServeur extends Error {
  readonly raison: RaisonRefus;

  constructor(raison: RaisonRefus, message: string) {
    super(message);
    this.name = "ErreurServeur";
    this.raison = raison;
  }
}

// La mémoire du « serveur » : elle dure le temps de la page
const comptes = new Set<string>();
const reservations = new Set<string>();

const attendre = (ms: number): Promise<void> => new Promise((fin) => setTimeout(fin, ms));

export async function inscrire(inscription: Inscription): Promise<void> {
  await attendre(DELAI_SIMULE);
  const cle = inscription.courriel.trim().toLowerCase();
  if (comptes.has(cle)) {
    throw new ErreurServeur("deja-inscrit", "Un compte existe déjà avec cette adresse. Vérifiez-la, ou utilisez-en une autre.");
  }
  comptes.add(cle);
}

export async function reserver(reservation: Reservation, placesRestantes: number): Promise<void> {
  await attendre(DELAI_SIMULE);
  const cle = `${reservation.atelierId}|${reservation.courriel.trim().toLowerCase()}`;
  if (reservations.has(cle)) {
    throw new ErreurServeur("deja-inscrit", "Vous avez déjà réservé cet atelier avec cette adresse.");
  }
  if (placesRestantes <= 0) {
    throw new ErreurServeur("complet", "Cet atelier vient d'être complet. Choisissez-en un autre dans le catalogue.");
  }
  reservations.add(cle);
}
