/* Le formulaire « Créer un atelier » (TP 2, point 5), côté formateur : ses valeurs, ses règles, et le
   passage des valeurs saisies (des chaînes) à un Atelier (des nombres, une date ISO). Aucun DOM ici. */
import type { Atelier, Niveau } from "../types";
import { normaliser } from "./filtre";
import { erreursSelon, type Regles } from "./validation";

/** Tout est chaîne : c'est ce que rendent les champs. La conversion se fait une fois, dans versAtelier. */
export type ValeursAtelier = {
  titre: string;
  description: string;
  categorie: string;
  niveau: Niveau | "";
  /** La valeur d'un <input type="datetime-local"> : « 2027-03-10T18:30 », heure locale, sans décalage. */
  date: string;
  /** En minutes, comme dans les données. */
  duree: string;
  lieu: string;
  places: string;
  prix: string;
  prerequis: string;
};

export type ChampAtelier = keyof ValeursAtelier;

// Les mêmes listes que les données de FM03 : un atelier créé se range avec les autres
export const CATEGORIES = ["Développement", "Design", "Carrière"] as const;
export const LIEUX = ["En ligne", "Paris"] as const;
export const DUREES = [60, 90, 120, 150, 180, 210, 240] as const;
/** La promesse de l'accueil : « des groupes de huit personnes au maximum ». */
export const PLACES_MAX = 8;

export const VALEURS_ATELIER_VIDES: ValeursAtelier = {
  titre: "",
  description: "",
  categorie: "",
  niveau: "",
  date: "",
  duree: "",
  lieu: "En ligne",
  places: "",
  prix: "",
  prerequis: "",
};

/** Un entier écrit en chiffres, et rien d'autre : Number("") vaut 0, Number("1e2") vaut 100. */
const entier = (texte: string): number | undefined => (/^\d+$/.test(texte.trim()) ? Number(texte.trim()) : undefined);

export const REGLES_ATELIER: Regles<ValeursAtelier> = {
  titre: ({ titre }) => (titre.trim().length < 5 ? "Donnez un titre d'au moins 5 caractères." : ""),
  description: ({ description }) =>
    description.trim().length < 20 ? "Décrivez l'atelier en 20 caractères au moins : ce qu'on y fait, ce qu'on en retire." : "",
  categorie: ({ categorie }) => (categorie === "" ? "Choisissez une catégorie." : ""),
  niveau: ({ niveau }) => (niveau === "" ? "Choisissez un niveau." : ""),
  date: ({ date }) => {
    const debut = new Date(date).getTime();
    if (date === "" || Number.isNaN(debut)) return "Choisissez la date et l'heure de début.";
    return debut <= Date.now() ? "Choisissez une date à venir." : "";
  },
  duree: ({ duree }) => (duree === "" ? "Choisissez une durée." : ""),
  lieu: () => "", // une liste avec une valeur par défaut : rien à refuser
  places: ({ places }) => {
    const n = entier(places);
    return n === undefined || n < 1 || n > PLACES_MAX ? `Entre 1 et ${PLACES_MAX} places : les groupes restent petits.` : "";
  },
  prix: ({ prix }) => (entier(prix) === undefined ? "Indiquez un prix en euros, sans centimes (0 pour un atelier gratuit)." : ""),
  prerequis: () => "", // facultatif : vide, il devient « Aucun. »
};

export const ORDRE_CHAMPS_ATELIER: readonly ChampAtelier[] = ["titre", "description", "categorie", "niveau", "date", "duree", "lieu", "places", "prix", "prerequis"];

export const erreursAtelier = (valeurs: ValeursAtelier) => erreursSelon(REGLES_ATELIER, ORDRE_CHAMPS_ATELIER, valeurs);

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/** « 2027-03-10T18:30 » (heure locale) → « 2027-03-10T18:30:00+01:00 » : le format des données, décalage compris. */
function versIso(local: string): string {
  const decalage = -new Date(local).getTimezoneOffset(); // en minutes, positif à l'est de Greenwich
  const signe = decalage >= 0 ? "+" : "-";
  const absolu = Math.abs(decalage);
  return `${local.slice(0, 16)}:00${signe}${deuxChiffres(Math.floor(absolu / 60))}:${deuxChiffres(absolu % 60)}`;
}

/** Les valeurs VALIDÉES deviennent un Atelier. L'identifiant se lit dans l'URL : /ateliers/docker-sans-douleur-2027-03-10. */
export function versAtelier(valeurs: ValeursAtelier, formateur: string): Atelier {
  if (valeurs.niveau === "") throw new Error("versAtelier : le niveau aurait dû être validé avant.");
  const titre = valeurs.titre.trim();
  const lisible = normaliser(titre).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    id: `${lisible}-${valeurs.date.slice(0, 10)}`,
    titre,
    niveau: valeurs.niveau,
    prix: Number(valeurs.prix),
    places: Number(valeurs.places),
    formateur,
    categorie: valeurs.categorie,
    description: valeurs.description.trim(),
    prerequis: valeurs.prerequis.trim() || "Aucun.",
    duree: Number(valeurs.duree),
    lieu: valeurs.lieu,
    date: versIso(valeurs.date),
  };
}
