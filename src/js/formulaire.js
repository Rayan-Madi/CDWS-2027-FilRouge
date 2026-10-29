/* Lire un formulaire sans « any ».
   formulaire.nom est typé any par le DOM (accès par nom), et FormData.get() rend une chaîne, un fichier
   ou null : ces fonctions rendent toujours une chaîne, propre. */
/** La valeur texte d'un champ, sans les espaces autour ; "" si le champ manque ou n'est pas du texte. */
export function texteDu(donnees, nom) {
    const valeur = donnees.get(nom);
    return typeof valeur === "string" ? valeur.trim() : "";
}
/** Le prénom, pour la phrase de confirmation : le premier mot du nom saisi. */
export function prenomDe(nom) {
    return nom.split(/\s+/)[0] ?? nom;
}
//# sourceMappingURL=formulaire.js.map