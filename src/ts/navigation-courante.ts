/* Navigation : où suis-je dans la page ?
   aria-current marque le lien de la section visible : le lecteur d'écran l'annonce (« page actuelle »),
   et le style ne repose pas sur la couleur seule. */

// liens : les liens de premier niveau de la navigation (les raccourcis du sous-menu visent tous #ateliers) ;
// sections : TOUTES les sections de la page, y compris l'accroche, qui n'a pas de lien : quand c'est elle
// la section courante, plus aucun lien n'est marqué (sinon « Valeurs » le resterait en haut de page).
export function brancherNavigationCourante(liens: readonly HTMLAnchorElement[], sections: readonly HTMLElement[]): void {
  if (liens.length === 0 || !("IntersectionObserver" in window)) return;

  // L'observateur ne signale que les CHANGEMENTS (une section entre dans la bande, ou en sort) : on tient
  // donc nous-mêmes l'ensemble des sections présentes dans la bande, et on en déduit la courante.
  const dansLaBande = new Set<Element>();

  function rendre(): void {
    // La dernière section de la bande, dans l'ordre de la page : celle qui vient d'y arriver en descendant
    const courante = sections.filter((section) => dansLaBande.has(section)).at(-1);
    liens.forEach((lien) => {
      // lien.hash et non getAttribute("href") : jamais null ; on le compare à l'id de la section, sans
      // chercher l'élément par l'attribut (un querySelector("#") lèverait une erreur de sélecteur)
      if (courante !== undefined && lien.hash === `#${courante.id}`) {
        lien.setAttribute("aria-current", "true");
      } else {
        lien.removeAttribute("aria-current");
      }
    });
  }

  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (entree.isIntersecting) dansLaBande.add(entree.target);
        else dansLaBande.delete(entree.target);
      }
      // Bande vide (entre deux sections) : on garde le marquage tel quel plutôt que de tout effacer
      if (dansLaBande.size > 0) rendre();
    },
    // Une section est « courante » quand elle traverse le milieu de l'écran
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observateur.observe(section));
}
