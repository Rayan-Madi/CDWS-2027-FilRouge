/* Navigation : où suis-je dans la page ?
   aria-current marque le lien de la section visible : le lecteur d'écran l'annonce (« page actuelle »),
   et le style ne repose pas sur la couleur seule. */
// liens : les liens de premier niveau de la navigation (les raccourcis du sous-menu visent tous #ateliers) ;
// sections : TOUTES les sections de la page, y compris l'accroche, qui n'a pas de lien : quand c'est elle
// qui traverse le milieu de l'écran, plus aucun lien n'est marqué (sinon « Valeurs » le resterait en haut).
export function brancherNavigationCourante(liens, sections) {
    if (liens.length === 0 || !("IntersectionObserver" in window))
        return;
    const observateur = new IntersectionObserver((entrees) => {
        entrees
            .filter((entree) => entree.isIntersecting)
            .forEach((entree) => {
            liens.forEach((lien) => {
                // lien.hash et non getAttribute("href") : jamais null, et un id cherché par getElementById
                // (un querySelector("#") lèverait une erreur de sélecteur et arrêterait le module)
                if (lien.hash === `#${entree.target.id}`) {
                    lien.setAttribute("aria-current", "true");
                }
                else {
                    lien.removeAttribute("aria-current");
                }
            });
        });
    }, 
    // Une section est « courante » quand elle traverse le milieu de l'écran
    { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((section) => observateur.observe(section));
}
//# sourceMappingURL=navigation-courante.js.map