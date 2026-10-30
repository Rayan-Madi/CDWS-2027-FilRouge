import { FournisseurCompte } from "./contexts/Compte";
import { FournisseurInscriptions } from "./contexts/Inscriptions";
import { Routeur } from "./router/routes";

/** Les fournisseurs autour du routeur : le compte d'abord, les inscriptions en ont besoin. */
export function Application() {
  return (
    <FournisseurCompte>
      <FournisseurInscriptions>
        <Routeur />
      </FournisseurInscriptions>
    </FournisseurCompte>
  );
}
