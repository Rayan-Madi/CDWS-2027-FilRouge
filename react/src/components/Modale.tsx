import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = {
  ouverte: boolean;
  titre: string;
  /** Pendant un envoi : Échap et le clic sur le fond ne ferment plus (les boutons, eux, sont déjà gardés). */
  bloquee?: boolean;
  /** Appelé quelle que soit la façon de fermer : bouton, Échap, clic sur le fond. */
  onFermer: () => void;
  children: ReactNode;
};

/**
 * Le <dialog> de FM02, en React (diapo 64) : showModal() fait entrer le focus, le garde dedans et
 * ferme sur Échap. Ce qu'on ajoute : le clic sur le fond, et le focus rendu au déclencheur
 * (ou au h1 de la vue, si le déclencheur a disparu entre-temps).
 */
export function Modale({ ouverte, titre, bloquee = false, onFermer, children }: Props) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const idTitre = useId();

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (ouverte && !d.open) {
      declencheur.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
    } else if (!ouverte && d.open) {
      d.close();
    }
  }, [ouverte]);

  // Démontée encore ouverte (la liste qui la porte vient de disparaître) : pas d'événement close,
  // le focus resterait sur un élément sorti de la page. On le rend ici.
  useEffect(() => {
    const d = dialogue.current;
    return () => {
      if (d?.open) rendreLeFocus();
    };
  }, []);

  function rendreLeFocus() {
    const retour = declencheur.current;
    if (retour?.isConnected) retour.focus();
    else document.querySelector<HTMLElement>("[data-titre-de-vue]")?.focus();
  }

  return (
    <dialog
      ref={dialogue}
      aria-labelledby={idTitre}
      // Échap déclenche cancel avant close : c'est là qu'on peut encore dire non
      onCancel={(e) => {
        if (bloquee) e.preventDefault();
      }}
      // L'événement close part quelle que soit la façon de fermer
      onClose={() => {
        rendreLeFocus();
        onFermer();
      }}
      // Le dialog n'a pas de marge interne : un clic dont la cible est le dialog lui-même vient du fond
      onClick={(e) => {
        if (e.target === e.currentTarget && !bloquee) e.currentTarget.close();
      }}
      className="w-[min(32rem,100%-2rem)] rounded-m bg-fond p-0 text-texte shadow-2"
    >
      <div className="p-6">
        <h2 id={idTitre} className="mb-3 text-l leading-titre font-semibold">
          {titre}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
