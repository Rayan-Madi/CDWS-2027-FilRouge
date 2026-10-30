/* Les règles du formulaire d'inscription : celles de FM03, en fonctions pures (aucun DOM).
   Chaque règle rend le message d'erreur, ou "" quand la valeur est bonne. */
import type { Profil } from "../types";

export type ValeursInscription = {
  nom: string;
  courriel: string;
  profil: Profil | "";
  cgu: boolean;
};

export type ChampInscription = keyof ValeursInscription;

export const VALEURS_VIDES: ValeursInscription = { nom: "", courriel: "", profil: "", cgu: false };

export const REGLES: { readonly [C in ChampInscription]: (valeurs: ValeursInscription) => string } = {
  // « required » du navigateur accepte un nom fait d'espaces : pas nous
  nom: ({ nom }) => (nom.trim().length < 2 ? "Indiquez votre prénom et votre nom." : ""),
  courriel: ({ courriel }) => {
    if (courriel.trim() === "") return "Indiquez votre adresse électronique.";
    // type="email" accepte « a@b » : on exige un domaine avec un point
    return /^[^@\s]+@[^@\s]+\.[^@\s.]{2,}$/.test(courriel.trim()) ? "" : "L'adresse doit ressembler à nom@exemple.fr.";
  },
  profil: ({ profil }) => (profil === "" ? "Choisissez votre profil." : ""),
  cgu: ({ cgu }) => (cgu ? "" : "Vous devez accepter les conditions pour continuer."),
};

export const ORDRE_DES_CHAMPS: readonly ChampInscription[] = ["nom", "courriel", "profil", "cgu"];

/** Toutes les erreurs d'un coup, dans l'ordre du formulaire (seules les erreurs non vides). */
export function erreursDe(valeurs: ValeursInscription): Partial<Record<ChampInscription, string>> {
  const erreurs: Partial<Record<ChampInscription, string>> = {};
  for (const champ of ORDRE_DES_CHAMPS) {
    const message = REGLES[champ](valeurs);
    if (message !== "") erreurs[champ] = message;
  }
  return erreurs;
}
