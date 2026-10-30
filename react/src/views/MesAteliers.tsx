import { Link, useLocation } from "react-router";
import { LienAction } from "../components/Action";
import { TitreDeVue } from "../components/TitreDeVue";
import { useAteliersCrees } from "../contexts/AteliersCrees";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../router/chemins";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "../utils/filtre";
import { formaterDate, formaterPlaces, formaterPrix, infosAtelier } from "../utils/format";

/** Mes ateliers (TP 2), côté formateur : ceux que j'ai publiés, par date. Gardée : connecté ET formateur. */
export function MesAteliers() {
  const { utilisateur } = useCompte();
  const { crees } = useAteliersCrees();
  // Le state de navigation est « unknown » : on le vérifie au lieu de l'affirmer avec un « as »
  const etat: unknown = useLocation().state;
  const publie = typeof etat === "object" && etat !== null && "publie" in etat && typeof etat.publie === "string" ? etat.publie : undefined;

  // Valeur dérivée : mes ateliers, triés par date (le filtre par défaut ne filtre rien, il trie)
  const miens = filtrerAteliers(
    crees.filter((a) => a.formateur === utilisateur?.nom),
    CRITERES_PAR_DEFAUT
  );

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue titreOnglet="Mes ateliers · SkillHub">Mes ateliers</TitreDeVue>
      {publie && <p className="mb-4 rounded-s bg-succes-fond px-4 py-3 font-semibold text-succes">{`« ${publie} » est publié : il apparaît dans le catalogue.`}</p>}
      <p className="mb-6">
        <LienAction to={CHEMINS.creerAtelier}>Créer un atelier</LienAction>
      </p>
      {miens.length === 0 ? (
        <p>Vous n'avez encore proposé aucun atelier. Le premier se publie en deux minutes.</p>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {miens.map((atelier) => (
            <li key={atelier.id}>
              <article className="flex h-full flex-col gap-2 rounded-m border border-bordure bg-fond p-6">
                <h2 className="text-m leading-titre font-semibold">
                  <Link to={CHEMINS.atelier(atelier.id)} className="text-texte underline-offset-4 hover:underline">
                    {atelier.titre}
                  </Link>
                </h2>
                <p className="text-xs text-texte-doux">
                  {infosAtelier(atelier)} · <time dateTime={atelier.date}>{formaterDate(atelier.date)}</time>
                </p>
                <p className="text-xs">{formaterPlaces(atelier.places)}</p>
                <p className="mt-auto font-semibold">{formaterPrix(atelier.prix)}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
