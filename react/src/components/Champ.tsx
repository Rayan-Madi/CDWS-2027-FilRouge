import { useId, type ReactNode } from "react";

export type AttributsReliés = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

type Props = {
  libelle: string;
  aide?: string;
  erreur?: string | undefined;
  /** Variante case à cocher : la case avant l'étiquette, sur une ligne. */
  caseACocher?: boolean;
  /** Le champ lui-même, qui reçoit les attributs reliés (id, aria-invalid, aria-describedby). */
  children: (attributs: AttributsReliés) => ReactNode;
};

/**
 * Un champ de formulaire de FM02 : étiquette cliquable (htmlFor), aide, erreur RELIÉE au champ.
 * useId : des identifiants uniques même si le composant sert plusieurs fois dans la page (diapo 64).
 */
export function Champ({ libelle, aide, erreur, caseACocher = false, children }: Props) {
  const id = useId();
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;
  const decrit = [aide ? idAide : "", erreur ? idErreur : ""].filter(Boolean).join(" ");
  const attributs: AttributsReliés = { id, "aria-invalid": Boolean(erreur), ...(decrit ? { "aria-describedby": decrit } : {}) };

  return (
    <p className={caseACocher ? "flex flex-wrap items-center gap-x-2" : "flex flex-col gap-1"}>
      {caseACocher && children(attributs)}
      <label htmlFor={id} className={caseACocher ? "flex-1" : "font-semibold"}>
        {libelle}
      </label>
      {!caseACocher && children(attributs)}
      {aide && (
        <span id={idAide} className="text-xs text-texte-doux">
          {aide}
        </span>
      )}
      {erreur && (
        <span id={idErreur} className="basis-full text-xs font-semibold text-erreur">
          {erreur}
        </span>
      )}
    </p>
  );
}

/** Les classes d'un champ texte : bordure --texte-doux (7,52:1, WCAG 1.4.11), plus épaisse en erreur. */
export const CLASSES_CHAMP =
  "min-h-11 rounded-s border border-texte-doux bg-fond px-3 py-2 text-texte aria-invalid:border-2 aria-invalid:border-erreur";
