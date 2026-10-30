import { Navigate, Outlet, useLocation } from "react-router";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "./chemins";

/**
 * Le garde (diapo 33) : soit il laisse passer, soit il redirige. La page gardée ne sait rien.
 * replace : la redirection n'ajoute pas d'entrée d'historique, le retour arrière ne reboucle pas.
 * Rappel : le front CACHE, le serveur REFUSE — ce garde est un confort, pas une sécurité.
 */
export function ExigeConnexion() {
  const { utilisateur } = useCompte();
  const { pathname } = useLocation();
  return utilisateur ? <Outlet /> : <Navigate to={CHEMINS.inscription} replace state={{ depuis: pathname }} />;
}
