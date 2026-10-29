import { estLeSoir, libelleNiveau } from "./format.js";
export const CRITERES_PAR_DEFAUT = { recherche: "", niveau: "tous", soir: false, tri: "date" };
export const estNiveau = (valeur) => valeur === "debutant" || valeur === "intermediaire" || valeur === "avance";
export const estTri = (valeur) => valeur === "date" || valeur === "prix-croissant" || valeur === "prix-decroissant";
/** Sans accents, sans majuscules, espaces resserrés : « Accessibilité » et « accessibilite » se rejoignent.
    Les apostrophes aussi : le clavier d'un téléphone tape « N’Diaye » (’), les données disent « N'Diaye » ('). */
export function normaliser(texte) {
    return texte
        .replace(/[\u2018\u2019\u02bc\u0060\u00b4]/g, "'") // AVANT les accents : U+02BC est lui-même un diacritique
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}
const chronologique = (a, b) => Date.parse(a.date) - Date.parse(b.date);
// À prix égal, le plus proche d'abord : un ordre stable et prévisible
const COMPARER = {
    date: chronologique,
    "prix-croissant": (a, b) => a.prix - b.prix || chronologique(a, b),
    "prix-decroissant": (a, b) => b.prix - a.prix || chronologique(a, b),
};
/** Les ateliers qui passent les critères, dans l'ordre demandé. Le tableau reçu n'est jamais modifié. */
export function filtrerAteliers(ateliers, criteres) {
    const mots = normaliser(criteres.recherche).split(" ").filter((mot) => mot !== "");
    return (ateliers
        .filter((a) => criteres.niveau === "tous" || a.niveau === criteres.niveau)
        .filter((a) => !criteres.soir || estLeSoir(a.date))
        .filter((a) => {
        const texte = normaliser(`${a.titre} ${a.formateur} ${a.categorie}`);
        return mots.every((mot) => texte.includes(mot)); // chaque mot tapé doit s'y trouver
    })
        // filter a rendu un NOUVEAU tableau : sort le réordonne sans toucher au catalogue d'origine
        .sort(COMPARER[criteres.tri]));
}
const ORDRES = {
    date: "par date",
    "prix-croissant": "par prix croissant",
    "prix-decroissant": "par prix décroissant",
};
export const MESSAGE_VIDE = "Aucun atelier ne correspond à ces filtres.";
/** Le compteur annoncé : « 4 ateliers · niveau débutant · le soir · par prix croissant ».
    Il nomme chaque critère : son texte change à chaque changement, donc il est annoncé à chaque fois. */
export function decrireResultat(nombre, criteres) {
    if (nombre === 0)
        return MESSAGE_VIDE;
    const parties = [`${nombre} atelier${nombre > 1 ? "s" : ""}`];
    if (criteres.recherche.trim() !== "")
        parties.push(`« ${criteres.recherche.trim()} »`);
    if (criteres.niveau !== "tous")
        parties.push(`niveau ${libelleNiveau(criteres.niveau)}`);
    if (criteres.soir)
        parties.push("le soir");
    parties.push(ORDRES[criteres.tri]);
    return parties.join(" · ");
}
//# sourceMappingURL=filtre.js.map