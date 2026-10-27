/* Navigation : où suis-je dans la page ?
   aria-current marque le lien de la section visible : le lecteur d'écran l'annonce (« page actuelle »),
   et le style ne repose pas sur la couleur seule. */
// liens : les liens de premier niveau de la navigation (les raccourcis du sous-menu visent tous #ateliers)
export function brancherNavigationCourante(liens) {
    if (liens.length === 0 || !("IntersectionObserver" in window))
        return;
    const observateur = new IntersectionObserver((entrees) => {
        entrees
            .filter((entree) => entree.isIntersecting)
            .forEach((entree) => {
            liens.forEach((lien) => {
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
    liens.forEach((lien) => {
        // getElementById et non querySelector(href) : un lien href="#" donnerait querySelector("#"),
        // qui LÈVE une erreur (sélecteur invalide) et arrêterait tout le module
        const section = document.getElementById(decodeURIComponent(lien.hash.slice(1)));
        if (section)
            observateur.observe(section);
    });
}
//# sourceMappingURL=navigation-courante.js.map