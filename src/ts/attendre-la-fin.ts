/* Attendre la fin de la frappe (cours, 5.6) : l'appel est repoussé tant qu'on tape, et ne part qu'après
   `delai` ms de calme. Ici le filtre est local, rien ne part au serveur : ce qu'on économise, c'est un
   rendu et une annonce du compteur à chaque lettre — le lecteur d'écran lirait « 14 ateliers, 9 ateliers,
   3 ateliers… » pendant qu'on tape « accessibilite ». */

export interface AppelDiffere<A extends unknown[]> {
  (...args: A): void;
  /** Oublie l'appel en attente. */
  annuler(): void;
  /** Appelle tout de suite (la touche Entrée, par exemple) et oublie l'appel en attente. */
  maintenant(...args: A): void;
}

export function attendreLaFin<A extends unknown[]>(fn: (...args: A) => void, delai = 300): AppelDiffere<A> {
  let minuterie: ReturnType<typeof setTimeout> | undefined;

  const annuler = (): void => {
    clearTimeout(minuterie); // on annule la précédente : sans ça, les minuteries s'empilent et tirent toutes
    minuterie = undefined;
  };

  const differe = (...args: A): void => {
    annuler();
    minuterie = setTimeout(() => {
      minuterie = undefined;
      fn(...args);
    }, delai);
  };

  return Object.assign(differe, {
    annuler,
    maintenant: (...args: A): void => {
      annuler();
      fn(...args);
    },
  });
}
