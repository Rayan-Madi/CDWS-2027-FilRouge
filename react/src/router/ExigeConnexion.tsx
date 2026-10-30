import { Navigate, Outlet, useLocation } from "react-router";
import { LienAction } from "../components/Action";
import { TitreDeVue } from "../components/TitreDeVue";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "./chemins";

/**
 * Le garde (diapo 33) : soit il laisse passer, soit il redirige. La page gardée ne sait rien.
 * replace : la redirection n'ajoute pas d'entrée d'historique, le retour arrière ne reboucle pas.
 * formateursSeulement : la personne est connectée mais apprenante ; on ne la renvoie pas, on lui dit pourquoi.
 * Rappel : le front CACHE, le serveur REFUSE — ce garde est un confort, pas une sécurité.
 */
export function ExigeConnexion({ formateursSeulement = false }: { formateursSeulement?: boolean }) {
  const { utilisateur } = useCompte();
  const { pathname } = useLocation();
  if (!utilisateur) return <Navigate to={CHEMINS.inscription} replace state={{ depuis: pathname }} />;
  if (formateursSeulement && utilisateur.profil !== "formateur") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <TitreDeVue>Réservé aux formateurs</TitreDeVue>
        <p>Cette page sert à proposer des ateliers. Votre compte est un compte apprenant : vos inscriptions vous attendent dans votre espace.</p>
        <p className="mt-6">
          <LienAction to={CHEMINS.monEspace}>Retour à mon espace</LienAction>
        </p>
      </div>
    );
  }
  return <Outlet />;
}
