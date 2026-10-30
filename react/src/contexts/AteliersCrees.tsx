import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Atelier } from "../types";
import { publierAtelier } from "../services/serveur-simule";

type ValeurAteliersCrees = {
  /** Les ateliers publiés pendant la visite. En mémoire, comme le compte : pas de back-end avant BC02. */
  crees: readonly Atelier[];
  /** Envoie l'atelier au serveur simulé ; lève ErreurServeur s'il refuse (même titre, même jour). */
  publier: (atelier: Atelier) => Promise<void>;
};

const AteliersCreesContext = createContext<ValeurAteliersCrees | null>(null);

export function FournisseurAteliersCrees({ children }: { children: ReactNode }) {
  const [crees, setCrees] = useState<readonly Atelier[]>([]);

  const publier = useCallback(async (atelier: Atelier) => {
    await publierAtelier(atelier);
    setCrees((p) => [...p, atelier]); // un nouveau tableau, jamais un push
  }, []);

  const valeur = useMemo(() => ({ crees, publier }), [crees, publier]);
  return <AteliersCreesContext.Provider value={valeur}>{children}</AteliersCreesContext.Provider>;
}

export function useAteliersCrees(): ValeurAteliersCrees {
  const valeur = useContext(AteliersCreesContext);
  if (!valeur) throw new Error("useAteliersCrees doit être appelé sous <FournisseurAteliersCrees>.");
  return valeur;
}
