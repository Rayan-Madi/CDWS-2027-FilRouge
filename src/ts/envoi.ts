/* L'envoi d'un formulaire : le bouton se désactive et dit « … en cours » le temps de l'action,
   puis redevient lui-même, QUOI QU'IL ARRIVE (finally) : un indicateur resté bloqué vient toujours
   d'une sortie oubliée. Pas de double envoi, et la personne voit que sa demande est prise. */
export async function envoyer<T>(bouton: HTMLButtonElement, libelleEnCours: string, action: () => Promise<T>): Promise<T> {
  const libelle = bouton.textContent; // gardé dans une variable, pas dans le DOM
  const avaitLeFocus = document.activeElement === bouton;
  bouton.disabled = true;
  bouton.textContent = libelleEnCours;
  try {
    return await action();
  } finally {
    bouton.disabled = false;
    bouton.textContent = libelle;
    // Un bouton désactivé perd le focus : on le lui rend, sinon le clavier repart du haut de la page
    if (avaitLeFocus && document.activeElement === document.body) {
      bouton.focus();
    }
  }
}
