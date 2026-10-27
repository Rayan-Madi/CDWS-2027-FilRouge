import { estNiveau } from "./filtre.js";
/** Le fichier, situé par rapport à CE module (src/js/api.js → src/donnees/) : juste, quelle que soit la page. */
export const URL_ATELIERS = new URL("../donnees/ateliers.json", import.meta.url);
/** Au-delà, on arrête d'attendre : un indicateur qui tourne pour toujours est un écran cassé. */
export const DELAI_MAX = 8000;
/** Une panne de chargement : sa raison et son code HTTP pour le code et la console, jamais pour l'écran. */
export class ErreurChargement extends Error {
    raison;
    statut;
    constructor(raison, message, { statut, cause } = {}) {
        super(message, { cause });
        this.name = "ErreurChargement";
        this.raison = raison;
        this.statut = statut;
    }
}
const estObjet = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const estTexte = (v) => typeof v === "string" && v.trim() !== "";
const estEntierPositif = (v) => typeof v === "number" && Number.isInteger(v) && v >= 0;
/** Le contrôle que le type ne fait pas : « as Promise<Atelier[]> » est une promesse, pas une vérification. */
export function estAtelier(valeur) {
    return (estObjet(valeur) &&
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
        !Number.isNaN(Date.parse(valeur.date)));
}
const estListeDAteliers = (v) => Array.isArray(v) && v.every(estAtelier);
/**
 * Le catalogue, vérifié. Lève une ErreurChargement (réseau, HTTP, délai, format) ;
 * si l'APPELANT annule par son signal, l'AbortError passe telle quelle : une annulation n'est pas une panne.
 */
export async function chargerAteliers(signal, { url = URL_ATELIERS, delaiMax = DELAI_MAX } = {}) {
    const delai = AbortSignal.timeout(delaiMax);
    const signaux = signal ? AbortSignal.any([signal, delai]) : delai; // le premier des deux qui tombe arrête tout
    try {
        const reponse = await fetch(url, { headers: { Accept: "application/json" }, signal: signaux });
        // fetch NE REJETTE PAS sur un 404 ou un 500 : une réponse est arrivée, la promesse est tenue
        if (!reponse.ok) {
            throw new ErreurChargement("http", `Chargement impossible (${reponse.status})`, { statut: reponse.status });
        }
        const donnees = await reponse.json(); // une seconde opération asynchrone : elle peut échouer aussi
        if (!estListeDAteliers(donnees)) {
            throw new ErreurChargement("format", "La réponse n'a pas la forme d'une liste d'ateliers");
        }
        return donnees;
    }
    catch (erreur) {
        if (erreur instanceof ErreurChargement)
            throw erreur;
        if (signal?.aborted)
            throw erreur; // annulation voulue : AbortError, rendue telle quelle
        if (delai.aborted) {
            throw new ErreurChargement("delai", `Pas de réponse en ${delaiMax / 1000} s`, { cause: erreur });
        }
        if (erreur instanceof SyntaxError) {
            throw new ErreurChargement("format", "La réponse n'est pas du JSON", { cause: erreur });
        }
        throw new ErreurChargement("reseau", "Le réseau ne répond pas", { cause: erreur }); // la seule chose que fetch rejette
    }
}
//# sourceMappingURL=api.js.map