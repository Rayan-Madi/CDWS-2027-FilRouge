import { FournisseurAteliersCrees } from "./contexts/AteliersCrees";
import { FournisseurCompte } from "./contexts/Compte";
import { FournisseurInscriptions } from "./contexts/Inscriptions";
import { Routeur } from "./router/routes";

/** Les fournisseurs autour du routeur : le compte d'abord (les inscriptions en ont besoin), puis les ateliers publiés pendant la visite. */
export function Application() {
  return (
    <FournisseurCompte>
      <FournisseurAteliersCrees>
        <FournisseurInscriptions>
          <Routeur />
        </FournisseurInscriptions>
      </FournisseurAteliersCrees>
    </FournisseurCompte>
  );
}
