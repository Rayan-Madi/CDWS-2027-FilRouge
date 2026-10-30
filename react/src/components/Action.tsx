import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router";

type Variante = "primaire" | "secondaire";

// Le bouton de FM02 (composant 1) : pilule, 44 px de haut au moins, focus visible, état désactivé lisible
const CLASSES: Record<Variante, string> = {
  primaire:
    "bg-accent text-white border-accent hover:bg-accent-fonce hover:border-accent-fonce aria-disabled:bg-texte-doux aria-disabled:border-texte-doux",
  secondaire:
    "bg-transparent text-accent border-accent hover:bg-accent-fonce hover:border-accent-fonce hover:text-white aria-disabled:text-texte-doux aria-disabled:border-texte-doux",
};
const BASE =
  "inline-flex min-h-11 items-center justify-center rounded-full border-2 px-6 py-3 text-center font-semibold leading-titre no-underline transition-transform aria-disabled:cursor-progress";

const classesAction = (variante: Variante = "primaire") => `${BASE} ${CLASSES[variante]}`;

export function BoutonAction({ variante = "primaire", className = "", type = "button", ...attributs }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button type={type} className={`${classesAction(variante)} ${className}`} {...attributs} />;
}

export function LienAction({ variante = "primaire", className = "", ...attributs }: LinkProps & { variante?: Variante }) {
  return <Link className={`${classesAction(variante)} ${className}`} {...attributs} />;
}
