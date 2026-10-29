/* L'envoi d'un formulaire : le bouton se désactive et dit « … en cours » le temps de l'action,
   puis redevient lui-même, QUOI QU'IL ARRIVE (finally) : un indicateur resté bloqué vient toujours
   d'une sortie oubliée. Pas de double envoi, et la personne voit que sa demande est prise.
   Un bouton désactivé n'est plus annoncé (il perd le focus) : « … en cours » est donc aussi écrit dans
   la zone role="status" du formulaire, que l'appelant remplace ensuite par le résultat. */
export async function envoyer(bouton, libelleEnCours, action, annonce) {
    const libelle = bouton.textContent; // gardé dans une variable, pas dans le DOM
    const avaitLeFocus = document.activeElement === bouton;
    bouton.disabled = true;
    bouton.textContent = libelleEnCours;
    if (annonce) {
        annonce.textContent = libelleEnCours;
        annonce.toggleAttribute("data-en-cours", true); // une attente n'a pas l'allure d'un succès (CSS)
    }
    try {
        return await action();
    }
    finally {
        bouton.disabled = false;
        bouton.textContent = libelle;
        // L'appelant écrit le résultat juste après ; en cas d'échec, c'est l'alerte qui parle : on n'y laisse rien
        if (annonce) {
            annonce.toggleAttribute("data-en-cours", false);
            if (annonce.textContent === libelleEnCours)
                annonce.textContent = "";
        }
        // Un bouton désactivé perd le focus : on le lui rend, sinon le clavier repart du haut de la page
        if (avaitLeFocus && document.activeElement === document.body) {
            bouton.focus();
        }
    }
}
//# sourceMappingURL=envoi.js.map