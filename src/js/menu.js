/* Navigation principale : le menu mobile et ses sous-menus, en DÉLÉGATION.
   Un seul écouteur de clic, sur la <nav>, au lieu d'un par bouton : il vaut pour tous les boutons
   de la navigation, y compris un sous-menu ajouté demain. */

// nav : la <nav> ; surRaccourci : prévenu quand un raccourci du sous-menu est choisi (le menu ne sait
// rien du filtre, il transmet seulement)
export function brancherMenu(nav, { surRaccourci } = {}) {
  const boutonMenu = nav.querySelector(".menu-bouton");
  const liste = nav.querySelector(".navigation__liste");
  if (!boutonMenu || !liste) return;
  const grandEcran = window.matchMedia("(min-width: 48em)");

  // L'état de l'interface vit ICI, dans une variable, et plus dans le DOM :
  // on ne relit jamais aria-expanded pour savoir ce qui est ouvert.
  let etat = { menuOuvert: false, sousMenuOuvert: null }; // sousMenuOuvert : l'id du sous-menu ouvert
  let ecouteursDuDocument = null; // AbortController, tant qu'un panneau est ouvert

  // LA fonction qui rend l'écran conforme à l'état. Aucun autre code n'écrit aria-expanded ni data-ferme.
  function rendre() {
    boutonMenu.setAttribute("aria-expanded", String(etat.menuOuvert)); // une chaîne, pas un booléen
    liste.toggleAttribute("data-ferme", !etat.menuOuvert);
    for (const bouton of nav.querySelectorAll(".navigation__deplier")) {
      const id = bouton.getAttribute("aria-controls");
      const ouvert = id === etat.sousMenuOuvert;
      bouton.setAttribute("aria-expanded", String(ouvert));
      document.getElementById(id)?.toggleAttribute("data-ferme", !ouvert);
    }
  }

  // Le seul point d'entrée pour changer l'état : un NOUVEL objet, puis le rendu
  function majEtat(changement) {
    etat = { ...etat, ...changement };
    rendre();
    suivreLeDocument(etat.menuOuvert || etat.sousMenuOuvert !== null);
  }

  // Échap et le clic dehors ne servent que si quelque chose est ouvert : les écouteurs du document
  // sont posés à l'ouverture et retirés ensemble, d'un seul abort(), à la fermeture.
  function suivreLeDocument(actif) {
    if (actif && !ecouteursDuDocument) {
      ecouteursDuDocument = new AbortController();
      const { signal } = ecouteursDuDocument;
      document.addEventListener("keydown", surTouche, { signal });
      document.addEventListener("click", surClicDehors, { signal });
    } else if (!actif && ecouteursDuDocument) {
      ecouteursDuDocument.abort();
      ecouteursDuDocument = null;
    }
  }

  function boutonDuSousMenu(id) {
    return nav.querySelector(`.navigation__deplier[aria-controls="${id}"]`);
  }

  // Échap ferme d'abord le sous-menu, puis le menu, et rend le focus au bouton qui les a ouverts :
  // sinon, au clavier, on se retrouve on ne sait où.
  function surTouche(evenement) {
    if (evenement.key !== "Escape") return;
    if (etat.sousMenuOuvert !== null) {
      const bouton = boutonDuSousMenu(etat.sousMenuOuvert);
      majEtat({ sousMenuOuvert: null });
      bouton?.focus();
    } else if (etat.menuOuvert) {
      majEtat({ menuOuvert: false });
      boutonMenu.focus();
    }
  }

  function surClicDehors(evenement) {
    if (!nav.contains(evenement.target)) {
      majEtat({ menuOuvert: false, sousMenuOuvert: null });
    }
  }

  // L'écouteur délégué. e.target est l'élément EXACT touché (l'icône dans le bouton, par exemple) :
  // closest() remonte jusqu'à ce qui nous intéresse.
  nav.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("button[aria-controls]");
    if (bouton === boutonMenu) {
      majEtat({ menuOuvert: !etat.menuOuvert, sousMenuOuvert: null });
      return;
    }
    if (bouton) {
      const id = bouton.getAttribute("aria-controls");
      majEtat({ sousMenuOuvert: etat.sousMenuOuvert === id ? null : id }); // un seul sous-menu ouvert à la fois
      return;
    }
    const lien = evenement.target.closest("a");
    if (lien) {
      if (lien.dataset.raccourci && surRaccourci) {
        surRaccourci(lien.dataset.raccourci);
      }
      majEtat({ menuOuvert: false, sousMenuOuvert: null }); // un lien choisi referme tout
    }
  });

  // Le focus qui quitte la navigation referme tout ; celui qui quitte un groupe referme son sous-menu.
  // relatedTarget est l'élément qui reçoit le focus (null si on quitte la fenêtre : on ne ferme rien).
  nav.addEventListener("focusout", (evenement) => {
    const vers = evenement.relatedTarget;
    if (!vers) return;
    if (!nav.contains(vers)) {
      majEtat({ menuOuvert: false, sousMenuOuvert: null });
    } else if (etat.sousMenuOuvert !== null && !boutonDuSousMenu(etat.sousMenuOuvert)?.parentElement?.contains(vers)) {
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
