/* Filtre des ateliers (FM02), réécrit en composant : un état, une fonction de rendu, des événements.
   Demandé par les deux personas : Jonny travaille en journée, Mélanie consulte le soir. */
import { trouver, trouverTous } from "./dom.js";
const RACCOURCIS = {
    tous: { soir: false, debutant: false },
    debutant: { soir: false, debutant: true },
    soir: { soir: true, debutant: false },
};
// Object.hasOwn et non `raccourci in RACCOURCIS` : « toString » est dans tout objet, par héritage
const estRaccourci = (valeur) => Object.hasOwn(RACCOURCIS, valeur);
// section : la section des ateliers
export function brancherFiltre(section) {
    const filtres = trouver(section, ".filtres", HTMLElement);
    const caseSoir = trouver(filtres, "[name=soir]", HTMLInputElement);
    const caseDebutant = trouver(filtres, "[name=debutant]", HTMLInputElement);
    const resultat = trouver(section, ".filtres__resultat", HTMLElement);
    const vide = trouver(section, ".ateliers__vide", HTMLElement);
    // Les données des cartes sont lues UNE fois : ce sont des données, pas l'état de l'interface
    const ateliers = trouverTous(section, ".ateliers > li", HTMLLIElement).map((li) => {
        const carte = trouver(li, ".atelier", HTMLElement);
        return { li, soir: carte.dataset.moment === "soir", debutant: carte.dataset.niveau !== "intermediaire" };
    });
    // L'état : ce que la personne a coché. On ne relit jamais .checked pour le savoir.
    let etat = { soir: false, debutant: false };
    function rendre() {
        caseSoir.checked = etat.soir; // l'écran suit l'état, jamais l'inverse
        caseDebutant.checked = etat.debutant;
        let visibles = 0;
        for (const atelier of ateliers) {
            const garde = (!etat.soir || atelier.soir) && (!etat.debutant || atelier.debutant);
            atelier.li.hidden = !garde;
            if (garde)
                visibles += 1;
        }
        // role="status" : le nombre de résultats est annoncé sans déplacer le focus
        resultat.textContent = visibles > 1 ? `${visibles} ateliers affichés` : `${visibles} atelier affiché`;
        vide.hidden = visibles > 0;
    }
    function majEtat(changement) {
        etat = { ...etat, ...changement };
        rendre();
    }
    // L'événement apporte la nouvelle valeur ; c'est majEtat qui la range
    filtres.addEventListener("change", (evenement) => {
        if (evenement.target === caseSoir)
            majEtat({ soir: caseSoir.checked });
        if (evenement.target === caseDebutant)
            majEtat({ debutant: caseDebutant.checked });
    });
    filtres.hidden = false;
    rendre();
    return {
        appliquerRaccourci(raccourci) {
            if (estRaccourci(raccourci))
                majEtat(RACCOURCIS[raccourci]);
        },
    };
}
//# sourceMappingURL=filtre.js.map