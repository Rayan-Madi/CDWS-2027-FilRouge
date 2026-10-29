/* Attendre la fin de la frappe (cours, 5.6) : l'appel est repoussé tant qu'on tape, et ne part qu'après
   `delai` ms de calme. Ici le filtre est local, rien ne part au serveur : ce qu'on économise, c'est un
   rendu et une annonce du compteur à chaque lettre — le lecteur d'écran lirait « 14 ateliers, 9 ateliers,
   3 ateliers… » pendant qu'on tape « accessibilite ». */
export function attendreLaFin(fn, delai = 300) {
    let minuterie;
    const annuler = () => {
        clearTimeout(minuterie); // on annule la précédente : sans ça, les minuteries s'empilent et tirent toutes
        minuterie = undefined;
    };
    const differe = (...args) => {
        annuler();
        minuterie = setTimeout(() => {
            minuterie = undefined;
            fn(...args);
        }, delai);
    };
    return Object.assign(differe, {
        annuler,
        maintenant: (...args) => {
            annuler();
            fn(...args);
        },
    });
}
//# sourceMappingURL=attendre-la-fin.js.map