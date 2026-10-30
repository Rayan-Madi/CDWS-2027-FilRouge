/* Les types métier de SkillHub, à part (TP 2, point 3) : c'est la première chose qu'on lit d'un projet.
   Un type n'existe qu'à la compilation : rien ici ne vérifie ce qui arrive du dehors (voir api.ts). */

/** Trois valeurs possibles, et pas une de plus : une faute de frappe devient une erreur de compilation. */
export type Niveau = "debutant" | "intermediaire" | "avance";

export interface Atelier {
  readonly id: string;
  readonly titre: string;
  readonly niveau: Niveau;
  /** En euros ; 0 veut dire gratuit. Un nombre, jamais une chaîne « 25 € » : le format est l'affaire de l'écran. */
  readonly prix: number;
  /** Places restantes ; 0 veut dire complet. */
  readonly places: number;
  readonly formateur: string;
  readonly categorie: string;
  readonly description: string;
  /** Ce qu'il faut savoir avant de venir (le défaut relevé par l'audit Nielsen du TP 2 de FM02). */
  readonly prerequis: string;
  /** Durée en minutes. */
  readonly duree: number;
  readonly lieu: string;
  /** Date et heure de début, ISO 8601 avec le décalage horaire : « 2026-11-04T18:30:00+01:00 ». */
  readonly date: string;
}

export type Profil = "apprenant" | "formateur";

/** Ce que le formulaire « Créer mon compte » envoie. */
export interface Inscription {
  readonly nom: string;
  readonly courriel: string;
  readonly profil: Profil;
}

/** Ce que la modale envoie pour réserver un atelier. */
export interface Reservation {
  readonly atelierId: string;
  readonly nom: string;
  readonly courriel: string;
}
