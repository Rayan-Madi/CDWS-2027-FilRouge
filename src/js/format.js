// Les ateliers ont lieu à Paris (ou en ligne depuis Paris) : l'heure affichée est celle de Paris,
// quel que soit le fuseau de l'ordinateur qui consulte la page
const FUSEAU = "Europe/Paris";
const JOUR = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: FUSEAU });
const HEURE = new Intl.DateTimeFormat("fr-FR", { hour: "numeric", minute: "numeric", hourCycle: "h23", timeZone: FUSEAU });
const LIBELLES_NIVEAU = {
    debutant: "débutant",
    intermediaire: "intermédiaire",
    avance: "avancé",
};
/** L'heure et la minute à Paris. */
function heureDeParis(iso) {
    const parties = HEURE.formatToParts(new Date(iso));
    const valeur = (type) => Number(parties.find((p) => p.type === type)?.value ?? 0);
    return { heure: valeur("hour"), minute: valeur("minute") };
}
/** « mercredi 4 novembre, 18 h 30 » ; « samedi 14 novembre, 10 h » (heure de Paris). */
export function formaterDate(iso) {
    const { heure, minute } = heureDeParis(iso);
    // Espaces insécables : « 18 h 30 » ne se coupe jamais en fin de ligne
    const minutes = minute === 0 ? "" : `\u00a0${String(minute).padStart(2, "0")}`;
    return `${JOUR.format(new Date(iso))}, ${heure}\u00a0h${minutes}`;
}
/** Vrai si l'atelier commence à 18 h ou plus tard, heure de Paris (le filtre « le soir » de Mélanie). */
export function estLeSoir(iso) {
    return heureDeParis(iso).heure >= 18;
}
/** « Gratuit », « 25 € » (espace insécable : le symbole ne part pas seul à la ligne). */
export function formaterPrix(prix) {
    return prix === 0 ? "Gratuit" : `${prix}\u00a0€`;
}
/** 180 → « 3 h » ; 150 → « 2 h 30 ». */
export function formaterDuree(minutes) {
    const heures = Math.floor(minutes / 60);
    const reste = minutes % 60;
    return reste === 0 ? `${heures}\u00a0h` : `${heures}\u00a0h\u00a0${String(reste).padStart(2, "0")}`;
}
/** « Complet », « Plus qu'une place », « Plus que 3 places », « 8 places ». */
export function formaterPlaces(places) {
    if (places === 0)
        return "Complet";
    if (places === 1)
        return "Plus qu'une place";
    if (places <= 3)
        return `Plus que ${places} places`;
    return `${places} places`;
}
/** Vrai quand il reste si peu de places qu'on le signale (en gras et en toutes lettres, jamais par la couleur seule). */
export const placesRares = (places) => places > 0 && places <= 3;
export function libelleNiveau(niveau) {
    return LIBELLES_NIVEAU[niveau];
}
/** La ligne d'informations de la carte, sans la date : « Niveau débutant · 3 h · en ligne ». */
export function infosAtelier(atelier) {
    const lieu = atelier.lieu === "En ligne" ? "en ligne" : atelier.lieu;
    return `Niveau ${libelleNiveau(atelier.niveau)} · ${formaterDuree(atelier.duree)} · ${lieu}`;
}
/** Le récapitulatif de la modale : « Niveau débutant · 3 h · en ligne · mercredi 4 novembre, 18 h 30 · 25 € ». */
export function recapAtelier(atelier) {
    return `${infosAtelier(atelier)} · ${formaterDate(atelier.date)} · ${formaterPrix(atelier.prix)}`;
}
//# sourceMappingURL=format.js.map