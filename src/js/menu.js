/* Navigation principale : le menu mobile et ses sous-menus, en DÉLÉGATION.
   Un seul écouteur de clic, sur la <nav>, au lieu d'un par bouton : il vaut pour tous les boutons
   de la navigation, y compris un sous-menu ajouté demain. */
import { trouver, trouverTous, elementCible } from "./dom.js";
function sousMenuDe(bouton) {
    const id = bouton.getAttribute("aria-controls") ?? "";
    const panneau = document.getElementById(id);
    const groupe = bouton.parentElement;
    if (!panneau || !groupe) {
        throw new Error(`SkillHub : le sous-menu « ${id} » est introuvable.`);
    }
    return { id, bouton, panneau, groupe };
}
export function brancherMenu(nav, { surRaccourci } = {}) {
    const boutonMenu = trouver(nav, ".menu-bouton", HTMLButtonElement);
    const liste = trouver(nav, ".navigation__liste", HTMLUListElement);
    const sousMenus = trouverTous(nav, ".navigation__deplier", HTMLButtonElement).map(sousMenuDe);
    const grandEcran = window.matchMedia("(min-width: 48em)");
    // L'état de l'interface vit ICI, dans une variable, et plus dans le DOM :
    // on ne relit jamais aria-expanded pour savoir ce qui est ouvert.
    let etat = { menuOuvert: false, sousMenuOuvert: null };
    let ecouteursDuDocument = null; // tant qu'un panneau est ouvert
    // LA fonction qui rend l'écran conforme à l'état. Aucun autre code n'écrit aria-expanded ni data-ferme.
    function rendre() {
        boutonMenu.setAttribute("aria-expanded", String(etat.menuOuvert)); // une chaîne, pas un booléen
        liste.toggleAttribute("data-ferme", !etat.menuOuvert);
        for (const { id, bouton, panneau } of sousMenus) {
            const ouvert = id === etat.sousMenuOuvert;
            bouton.setAttribute("aria-expanded", String(ouvert));
            panneau.toggleAttribute("data-ferme", !ouvert);
        }
    }
    // Le seul point d'entrée pour changer l'état : un NOUVEL objet, puis le rendu
    function majEtat(changement) {
        etat = { ...etat, ...changement };
        rendre();
        suivreLeDocument(etat.menuOuvert || etat.sousMenuOuvert !== null);
    }
    const toutFermer = () => majEtat({ menuOuvert: false, sousMenuOuvert: null });
    // Échap et le clic dehors ne servent que si quelque chose est ouvert : les écouteurs du document
    // sont posés à l'ouverture et retirés ensemble, d'un seul abort(), à la fermeture.
    function suivreLeDocument(actif) {
        if (actif && !ecouteursDuDocument) {
            ecouteursDuDocument = new AbortController();
            const { signal } = ecouteursDuDocument;
            document.addEventListener("keydown", surTouche, { signal });
            document.addEventListener("click", surClicDehors, { signal });
        }
        else if (!actif && ecouteursDuDocument) {
            ecouteursDuDocument.abort();
            ecouteursDuDocument = null;
        }
    }
    // Échap ferme d'abord le sous-menu, puis le menu, et rend le focus au bouton qui les a ouverts :
    // sinon, au clavier, on se retrouve on ne sait où.
    function surTouche(evenement) {
        if (evenement.key !== "Escape")
            return;
        const ouvert = sousMenus.find((s) => s.id === etat.sousMenuOuvert);
        if (ouvert) {
            majEtat({ sousMenuOuvert: null });
            ouvert.bouton.focus();
        }
        else if (etat.menuOuvert) {
            majEtat({ menuOuvert: false });
            boutonMenu.focus();
        }
    }
    function surClicDehors(evenement) {
        if (!(evenement.target instanceof Node) || !nav.contains(evenement.target)) {
            toutFermer();
        }
    }
    // L'écouteur délégué. e.target est l'élément EXACT touché (l'icône dans le bouton, par exemple) :
    // closest() remonte jusqu'à ce qui nous intéresse.
    nav.addEventListener("click", (evenement) => {
        const cible = elementCible(evenement);
        const bouton = cible?.closest("button[aria-controls]");
        if (bouton === boutonMenu) {
            majEtat({ menuOuvert: !etat.menuOuvert, sousMenuOuvert: null });
            return;
        }
        const sousMenu = sousMenus.find((s) => s.bouton === bouton);
        if (sousMenu) {
            // un seul sous-menu ouvert à la fois ; le même bouton referme
            majEtat({ sousMenuOuvert: etat.sousMenuOuvert === sousMenu.id ? null : sousMenu.id });
            return;
        }
        const lien = cible?.closest("a");
        if (lien) {
            const raccourci = lien.dataset.raccourci;
            if (raccourci !== undefined)
                surRaccourci?.(raccourci);
            toutFermer(); // un lien choisi referme tout
        }
    });
    // Le focus qui quitte la navigation referme tout ; celui qui quitte un groupe referme son sous-menu.
    // relatedTarget est l'élément qui reçoit le focus (null si on quitte la fenêtre : on ne ferme rien).
    nav.addEventListener("focusout", (evenement) => {
        const vers = evenement.relatedTarget;
        if (!(vers instanceof Node))
            return;
        if (!nav.contains(vers)) {
            toutFermer();
            return;
        }
        const ouvert = sousMenus.find((s) => s.id === etat.sousMenuOuvert);
        if (ouvert && !ouvert.groupe.contains(vers)) {
            majEtat({ sousMenuOuvert: null });
        }
    });
    // Passé au grand écran, le menu mobile n'existe plus : son état « ouvert » non plus
    grandEcran.addEventListener("change", () => {
        if (grandEcran.matches && etat.menuOuvert) {
            majEtat({ menuOuvert: false });
        }
    });
    rendre();
}
//# sourceMappingURL=menu.js.map