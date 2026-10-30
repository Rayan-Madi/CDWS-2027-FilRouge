import { Link } from "react-router";
import type { Atelier } from "../types";
import type { Envoi } from "../contexts/Inscriptions";
import { CHEMINS } from "../router/chemins";
import { formaterDate, formaterPlaces, formaterPrix, infosAtelier, placesRares } from "../utils/format";
import { ActionInscription } from "./ActionInscription";

type Props = {
  atelier: Atelier;
  placesRestantes: number;
  inscrit: boolean;
  envoi?: Envoi | undefined;
  erreur?: string | undefined;
  /** 2 dans le catalogue (sous le h1 de la vue), 3 sur l'accueil (sous le h2 de la section). */
  niveauTitre?: 2 | 3;
  onInscrire: (id: string) => void;
  onDesinscrire: (id: string) => void;
};

/**
 * Une carte d'atelier (TP 1). Aucun état : elle reçoit tout en props et PRÉVIENT son parent par
 * onInscrire / onDesinscrire. Elle ne décide de rien, c'est ce qui la rend réutilisable.
 */
export function CarteAtelier({ atelier, placesRestantes, inscrit, envoi, erreur, niveauTitre = 2, onInscrire, onDesinscrire }: Props) {
  const Titre = niveauTitre === 2 ? "h2" : "h3";
  const complet = placesRestantes === 0;

  return (
    <article className="flex h-full flex-col gap-2 rounded-m border border-bordure bg-fond p-6">
      <Titre className="text-m leading-titre font-semibold">
        <Link to={CHEMINS.atelier(atelier.id)} className="text-texte underline-offset-4 hover:underline">
          {atelier.titre}
        </Link>
      </Titre>
      <p className="self-start rounded-full bg-accent-clair px-2 py-1 text-xs leading-titre font-semibold text-accent-fonce">{atelier.categorie}</p>
      <p>{atelier.description}</p>
      <p className="text-xs text-texte-doux">
        {infosAtelier(atelier)} · <time dateTime={atelier.date}>{formaterDate(atelier.date)}</time>
      </p>
      <p className="text-xs">Avec {atelier.formateur}</p>
      <p className="text-xs">
        <span className="font-semibold">Prérequis : </span>
        {atelier.prerequis}
      </p>
      {/* Peu de places : en gras et en toutes lettres, jamais la couleur seule */}
      <p className={`text-xs ${placesRares(placesRestantes) ? "font-semibold text-accent-fonce" : ""}`}>{formaterPlaces(placesRestantes)}</p>
      <p className="text-m font-semibold">{formaterPrix(atelier.prix)}</p>
      <ActionInscription
        titre={atelier.titre}
        inscrit={inscrit}
        complet={complet}
        envoi={envoi}
        erreur={erreur}
        onInscrire={() => onInscrire(atelier.id)}
        onDesinscrire={() => onDesinscrire(atelier.id)}
      />
    </article>
  );
}
