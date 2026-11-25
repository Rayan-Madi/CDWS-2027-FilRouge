/* Les phrases que l'interface montre, reprises de FM03 (catalogue.ts et formulaire.ts). */
import type { ErreurChargement } from "../services/api";

/** Ce qui s'est passé, en une phrase et sans code HTTP : le numéro va dans la console. */
export function messageErreur(erreur: ErreurChargement): string {
  switch (erreur.raison) {
    case "reseau":
      return "La connexion semble coupée. Vérifiez votre réseau, puis réessayez.";
    case "delai":
      return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
    case "format":
      return "Les données reçues sont illisibles. Réessayez dans un instant ; si cela continue, revenez plus tard.";
    case "http":
      if (erreur.statut === 404) return "Le catalogue est introuvable pour le moment. Réessayez dans un instant.";
      if (erreur.statut !== undefined && erreur.statut >= 500) return "Le serveur rencontre un problème. Réessayez dans un instant.";
      return "Le serveur a refusé la demande. Réessayez dans un instant.";
  }
}

/** Le prénom, pour « Bonjour Sarah » : le premier mot du nom saisi. */
export function prenomDe(nom: string): string {
  return nom.trim().split(/\s+/)[0] ?? nom;
}
