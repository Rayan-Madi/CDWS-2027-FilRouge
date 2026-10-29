/* Sélectionner dans le DOM sans mentir au compilateur.
   querySelector rend null sans prévenir, et un Element trop large (pas de .value, pas de .focus) :
   c'est le « Cannot read properties of null » de la production. Ces fonctions VÉRIFIENT à l'exécution
   ce que le type promet à la compilation — sans « as », qui ne vérifierait rien. */
/** Le premier élément qui correspond, du bon type ; sinon une erreur qui dit lequel manque. */
export function trouver(racine, selecteur, Type) {
    const element = racine.querySelector(selecteur);
    if (!(element instanceof Type)) {
        throw new Error(`SkillHub : « ${selecteur} » est introuvable, ou n'est pas un ${Type.name}.`);
    }
    return element; // instanceof a fait le travail : ici, element est un T
}
/** Tous les éléments qui correspondent et sont du bon type, dans un vrai tableau (une NodeList n'a pas .filter). */
export function trouverTous(racine, selecteur, Type) {
    return [...racine.querySelectorAll(selecteur)].filter((element) => element instanceof Type);
}
/** event.target est un EventTarget : peut-être un nœud texte, la fenêtre, ou rien. On veut un Element. */
export function elementCible(evenement) {
    return evenement.target instanceof Element ? evenement.target : null;
}
//# sourceMappingURL=dom.js.map