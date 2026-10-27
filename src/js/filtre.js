/* Filtre des ateliers (FM02), réécrit en composant : un état, une fonction de rendu, des événements.
   Demandé par les deux personas : Jonny travaille en journée, Mélanie consulte le soir. */

const RACCOURCIS = {
  tous: { soir: false, debutant: false },
  debutant: { soir: false, debutant: true },
  soir: { soir: true, debutant: false },
};

// section : la section des ateliers. Rend de quoi régler le filtre depuis l'extérieur (le sous-menu).
export function brancherFiltre(section) {
  const filtres = section.querySelector(".filtres");
  const resultat = section.querySelector(".filtres__resultat");
  const vide = section.querySelector(".ateliers__vide");
  if (!filtres || !resultat || !vide) return null;

  // Les données des cartes sont lues UNE fois : ce sont des données, pas l'état de l'interface
  const ateliers = [...section.querySelectorAll(".ateliers > li")].map((li) => ({
    li,
    soir: li.querySelector(".atelier").dataset.moment === "soir",
    debutant: li.querySelector(".atelier").dataset.niveau !== "intermediaire",
  }));

  // L'état : ce que la personne a coché. On ne relit jamais .checked pour le savoir.
  let etat = { soir: false, debutant: false };

  function rendre() {
    filtres.querySelector("[name=soir]").checked = etat.soir; // l'écran suit l'état, jamais l'inverse
    filtres.querySelector("[name=debutant]").checked = etat.debutant;
    let visibles = 0;
    ateliers.forEach((atelier) => {
      const garde = (!etat.soir || atelier.soir) && (!etat.debutant || atelier.debutant);
      atelier.li.hidden = !garde;
      if (garde) visibles += 1;
    });
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
    const champ = evenement.target;
    if (champ.name in etat) {
      majEtat({ [champ.name]: champ.checked });
    }
  });

  filtres.hidden = false;
  rendre();

  return {
    appliquerRaccourci(raccourci) {
      if (RACCOURCIS[raccourci]) majEtat(RACCOURCIS[raccourci]);
    },
  };
}
