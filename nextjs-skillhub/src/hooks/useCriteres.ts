import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

/**
 * Le filtre du catalogue vit dans l'URL : partageable, et il survit au rechargement.
 * En Next.js, useSearchParams vient de next/navigation, en lecture seule, et l'écriture passe par le routeur.
 * Le composant qui l'appelle doit être sous <Suspense> : sans lui, next build refuse la page prérendue.
 */
export function useCriteres(): [Criteres, (changement: Partial<Criteres>) => void] {
  const params = useSearchParams();
  const chemin = usePathname();
  const routeur = useRouter();
  const criteres = useMemo(() => lireCriteres(new URLSearchParams(params.toString())), [params]);
  const changer = useCallback(
    (changement: Partial<Criteres>) => {
      // L'adresse du moment, et non celle du dernier rendu : la recherche part après 300 ms de calme
      const suivants = ecrireCriteres({ ...lireCriteres(new URLSearchParams(window.location.search)), ...changement }).toString();
      // replace : le retour arrière quitte le catalogue ; scroll: false : un filtre ne remonte pas la page
      routeur.replace(suivants ? `${chemin}?${suivants}` : chemin, { scroll: false });
    },
    [chemin, routeur]
  );
  return [criteres, changer];
}
