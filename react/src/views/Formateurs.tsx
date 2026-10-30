import { Link } from "react-router";
import { CarteFormateur } from "../components/CarteFormateur";
import { TitreDeVue } from "../components/TitreDeVue";
import { CHEMINS } from "../router/chemins";
import { FORMATEURS } from "../services/formateurs";

export function Formateurs() {
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>Nos formateurs</TitreDeVue>
      <ul role="list" className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-6">
        {FORMATEURS.map((f) => (
          <li key={f.id}>
            <CarteFormateur formateur={f} />
          </li>
        ))}
      </ul>
      <p className="mt-6">
        Vous êtes formateur indépendant ? <Link to={`${CHEMINS.inscription}?profil=formateur`}>Créez votre compte</Link> en choisissant « Formateur indépendant » : vous pourrez proposer vos ateliers.
      </p>
    </div>
  );
}
