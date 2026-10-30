"use client";

import { useSearchParams } from "next/navigation";
import { LienAction } from "./Action";
import { TitreDeVue } from "./TitreDeVue";
import { useAteliersCrees } from "../contexts/AteliersCrees";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../utils/chemins";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "../utils/filtre";
import { formaterDate, formaterPlaces, formaterPrix, infosAtelier } from "../utils/format";

/** Mes ateliers (TP 2), côté formateur : ceux que j'ai publiés pendant la visite, par date. Gardée par proxy.ts et GardeEspace. */
export function MesAteliers() {
  const { utilisateur } = useCompte();
  const { crees } = useAteliersCrees();
  // ?publie=… : posé par CreerAtelier, à la place du state de navigation de React Router
  const publie = useSearchParams().get("publie") ?? undefined;

  // Valeur dérivée : mes ateliers, triés par date (le filtre par défaut ne filtre rien, il trie)
  const miens = filtrerAteliers(
    crees.filter((a) => a.formateur === utilisateur?.nom),
    CRITERES_PAR_DEFAUT
  );

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>Mes ateliers</TitreDeVue>
      {publie && <p className="mb-4 rounded-s bg-succes-fond px-4 py-3 font-semibold text-succes">{`« ${publie} » est publié pour cette visite.`}</p>}
      <p className="mb-6">
        <LienAction href={CHEMINS.creerAtelier}>Créer un atelier</LienAction>
      </p>
      {miens.length === 0 ? (
        <p>Vous n'avez encore proposé aucun atelier. Le premier se publie en deux minutes.</p>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {miens.map((atelier) => (
            <li key={atelier.id}>
              <article className="flex h-full flex-col gap-2 rounded-m border border-bordure bg-fond p-6">
                <h2 className="text-m leading-titre font-semibold">
                  {/* Pas de lien vers une fiche : les fiches sont rendues sur le SERVEUR, qui ne connaît pas
                      cet atelier (il vit dans la mémoire du navigateur). Il le connaîtra avec l'API de BC02. */}
                  {atelier.titre}
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
