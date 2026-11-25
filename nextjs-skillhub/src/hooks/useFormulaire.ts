import { useRef, useState } from "react";
import { erreursSelon, type Regles } from "../utils/validation";

export type Erreurs<V> = Partial<Record<keyof V, string>>;

/** Pose ou retire l'erreur d'un champ : une règle qui rend "" veut dire « plus d'erreur ». */
function avecErreur<V>(erreurs: Erreurs<V>, champ: keyof V, message: string): Erreurs<V> {
  const copie = { ...erreurs };
  if (message === "") delete copie[champ];
  else copie[champ] = message;
  return copie;
}

/**
 * La mécanique commune aux deux formulaires CONTRÔLÉS (diapo 51) : « Créer mon compte » et « Créer un atelier ».
 * Un champ n'est jugé qu'une fois quitté (aider, pas punir) ; une erreur affichée suit ensuite la frappe ;
 * à l'envoi, tout est jugé et le focus va au premier champ fautif.
 */
export function useFormulaire<V extends object>(initiales: V | (() => V), regles: Regles<V>, ordre: readonly (keyof V & string)[]) {
  const [valeurs, setValeurs] = useState<V>(initiales);
  // Les erreurs AFFICHÉES, pas toutes celles qui existent
  const [erreurs, setErreurs] = useState<Erreurs<V>>({});
  const formulaire = useRef<HTMLFormElement>(null);

  function changer<C extends keyof V>(champ: C, valeur: V[C]) {
    const suivantes: V = { ...valeurs, [champ]: valeur };
    setValeurs(suivantes);
    if (erreurs[champ] !== undefined) setErreurs((e) => avecErreur(e, champ, regles[champ](suivantes)));
  }

  const quitter = (champ: keyof V) => setErreurs((e) => avecErreur(e, champ, regles[champ](valeurs)));

  /** Juge tout. Faux s'il reste une erreur : le focus est alors sur le premier champ concerné. */
  function valider(): boolean {
    const toutes = erreursSelon(regles, ordre, valeurs);
    setErreurs(toutes);
    const premier = ordre.find((champ) => toutes[champ] !== undefined);
    if (premier !== undefined) formulaire.current?.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus();
    return premier === undefined;
  }

  return { valeurs, erreurs, changer, quitter, valider, formulaire };
}
