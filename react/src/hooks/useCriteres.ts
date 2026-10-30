import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { CRITERES_PAR_DEFAUT, estNiveau, estTri, type Criteres } from "../utils/filtre";

/** Lire les critères dans l'adresse : une valeur absente ou inconnue (niveau=expert) vaut la valeur par défaut. */
export function lireCriteres(params: URLSearchParams): Criteres {
  const niveau = params.get("niveau");
  const tri = params.get("tri");
  return {
    recherche: params.get("recherche") ?? "",
    niveau: estNiveau(niveau) ? niveau : "tous",
    soir: params.get("soir") === "oui",
    tri: estTri(tri) ? tri : "date",
  };
}

/** Écrire les critères : seules les valeurs qui diffèrent du défaut apparaissent dans l'adresse. */
export function ecrireCriteres(criteres: Criteres): URLSearchParams {
  const params = new URLSearchParams();
  if (criteres.recherche.trim() !== "") params.set("recherche", criteres.recherche.trim());
  if (criteres.niveau !== CRITERES_PAR_DEFAUT.niveau) params.set("niveau", criteres.niveau);
  if (criteres.soir) params.set("soir", "oui");
  if (criteres.tri !== CRITERES_PAR_DEFAUT.tri) params.set("tri", criteres.tri);
  return params;
}

/** Le filtre du catalogue vit dans l'URL (TP 2, point 2) : partageable, et il survit au rechargement. */
export function useCriteres(): [Criteres, (changement: Partial<Criteres>) => void] {
  const [params, setParams] = useSearchParams();
  const criteres = useMemo(() => lireCriteres(params), [params]);
  const changer = useCallback(
    (changement: Partial<Criteres>) =>
      // replace : le retour arrière quitte le catalogue, au lieu de défaire un filtre à la fois
      setParams((actuels) => ecrireCriteres({ ...lireCriteres(actuels), ...changement }), { replace: true }),
    [setParams]
  );
  return [criteres, changer];
}
