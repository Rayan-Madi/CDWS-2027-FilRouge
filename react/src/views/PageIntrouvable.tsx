import { Link, useLocation } from "react-router";
import { TitreDeVue } from "../components/TitreDeVue";
import { CHEMINS } from "../router/chemins";

/** La route * : une adresse inconnue n'affiche jamais un écran blanc. */
export function PageIntrouvable() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>Page introuvable</TitreDeVue>
      <p>
        Rien ne répond à l'adresse <code className="rounded-s bg-fond-teinte px-1">{pathname}</code>.
      </p>
      <ul className="mt-4 list-disc pl-6">
        <li><Link to={CHEMINS.accueil}>Revenir à l'accueil</Link></li>
        <li><Link to={CHEMINS.ateliers}>Voir les ateliers</Link></li>
      </ul>
    </div>
  );
}
