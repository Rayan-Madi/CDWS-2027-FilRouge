/* Les formateurs : un contenu figé, importé au build (rien à charger, rien à attendre). */
import donnees from "../donnees/formateurs.json";

export type Formateur = {
  readonly id: string;
  readonly nom: string;
  readonly role: string;
  readonly citation: string;
  /** Préfixe des fichiers WebP de public/images : -96, -192 et -288 pixels de large. */
  readonly photo: string;
};

export const FORMATEURS: readonly Formateur[] = donnees;

/** L'adresse d'une image de public/ : Vite ne réécrit pas les chaînes du JSX, on préfixe par la base. */
export const image = (fichier: string): string => `${import.meta.env.BASE_URL}images/${fichier}`;
