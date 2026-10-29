import { formaterDate, formaterPlaces, formaterPrix, infosAtelier, placesRares } from "./format.js";
/** Un élément avec sa classe et son texte : les trois lignes qu'on écrirait sinon pour chaque paragraphe. */
function element(balise, classe, texte = "") {
    const e = document.createElement(balise);
    if (classe !== "")
        e.className = classe;
    if (texte !== "")
        e.textContent = texte;
    return e;
}
export const idTitre = (atelier) => `titre-${atelier.id}`;
export function carteAtelier(atelier) {
    const li = element("li", "");
    li.dataset.id = atelier.id; // l'identité voyage dans le DOM : c'est ce que lit la délégation
    const carte = element("article", "atelier");
    const titre = element("h3", "", atelier.titre);
    titre.id = idTitre(atelier);
    titre.tabIndex = -1; // focalisable par le code seulement : le focus y revient si l'atelier devient complet
    const infos = element("p", "atelier__infos", `${infosAtelier(atelier)} · `);
    const date = element("time", "", formaterDate(atelier.date));
    date.dateTime = atelier.date;
    infos.append(date);
    const prerequis = element("p", "atelier__prerequis");
    prerequis.append(element("span", "atelier__libelle", "Prérequis : "), atelier.prerequis);
    const places = element("p", "atelier__places", formaterPlaces(atelier.places));
    if (placesRares(atelier.places))
        places.classList.add("atelier__places--rares");
    const bouton = element("button", "action");
    bouton.type = "button"; // sinon, dans un formulaire, il le soumettrait
    if (atelier.places > 0) {
        bouton.dataset.reserver = atelier.id;
        // Le texte masqué distingue les boutons entre eux pour le lecteur d'écran (« Réserver l'atelier… »)
        bouton.append("Réserver ", element("span", "visuellement-masque", `l'atelier ${atelier.titre}`));
    }
    else {
        bouton.disabled = true;
        bouton.dataset.complet = "";
        bouton.append("Complet", element("span", "visuellement-masque", ` : l'atelier ${atelier.titre}`));
    }
    carte.append(titre, element("p", "atelier__etiquette", atelier.categorie), element("p", "", atelier.description), infos, element("p", "atelier__formateur", `Avec ${atelier.formateur}`), prerequis, places, element("p", "atelier__prix", formaterPrix(atelier.prix)), bouton);
    li.append(carte);
    return li;
}
/** Une carte fantôme : la place de la carte à venir, réservée pendant le chargement (pas de décalage, cours 5.5). */
export function carteFantome() {
    const li = element("li", "atelier-fantome");
    li.setAttribute("aria-hidden", "true"); // décorative : c'est le message « Chargement… » qui parle
    for (let i = 0; i < 6; i += 1)
        li.append(element("span", ""));
    return li;
}
//# sourceMappingURL=carte.js.map