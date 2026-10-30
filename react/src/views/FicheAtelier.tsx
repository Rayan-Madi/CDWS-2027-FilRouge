import { Link, useParams } from "react-router";
import { ActionInscription } from "../components/ActionInscription";
import { ConfirmationDesinscription } from "../components/ListeAteliers";
import { TitreDeVue } from "../components/TitreDeVue";
import { useInscriptions } from "../contexts/Inscriptions";
import { useActionsInscription } from "../hooks/useActionsInscription";
import { useAteliers } from "../hooks/useAteliers";
import { CHEMINS } from "../router/chemins";
import { formaterDate, formaterDuree, formaterPlaces, formaterPrix, libelleNiveau } from "../utils/format";
import { messageErreur } from "../utils/messages";

const CONTENU = "mx-auto max-w-page px-4 py-12 md:px-8";

/** La fiche d'un atelier : l'identifiant vient de l'URL (:id), toujours une chaîne. */
export function FicheAtelier() {
  const { id } = useParams();
  const { requete, recharger } = useAteliers();
  const { inscrits, envois, erreurs, placesRestantes } = useInscriptions();
  const { inscrire, demanderDesinscription, aConfirmer, confirmer, annuler } = useActionsInscription();

  if (requete.statut === "chargement") {
    return (
      <div className={CONTENU} aria-busy="true">
        <TitreDeVue titreOnglet="Chargement · SkillHub">Chargement de l'atelier…</TitreDeVue>
      </div>
    );
  }
  if (requete.statut === "erreur") {
    return (
      <div className={CONTENU}>
        <TitreDeVue>Atelier indisponible</TitreDeVue>
        <p role="alert">{messageErreur(requete.erreur)}</p>
        <button type="button" onClick={recharger} className="mt-4 underline">
          Réessayer
        </button>
      </div>
    );
  }

  const atelier = requete.donnees.find((a) => a.id === id);
  if (!atelier) {
    return (
      <div className={CONTENU}>
        <TitreDeVue>Atelier introuvable</TitreDeVue>
        <p>Cet atelier n'existe pas, ou plus. Les autres vous attendent.</p>
        <p className="mt-4">
          <Link to={CHEMINS.ateliers}>Retour au catalogue</Link>
        </p>
      </div>
    );
  }

  const places = placesRestantes(atelier);
  const inscrit = inscrits.has(atelier.id);
  const details: [string, string][] = [
    ["Formateur", atelier.formateur],
    ["Date", formaterDate(atelier.date)],
    ["Durée", formaterDuree(atelier.duree)],
    ["Lieu", atelier.lieu],
    ["Niveau", libelleNiveau(atelier.niveau)],
    ["Prérequis", atelier.prerequis],
    ["Places", formaterPlaces(places)],
    ["Prix", formaterPrix(atelier.prix)],
  ];

  return (
    <article className={CONTENU}>
      <p className="mb-2">
        <Link to={CHEMINS.ateliers}>← Tous les ateliers</Link>
      </p>
      <TitreDeVue>{atelier.titre}</TitreDeVue>
      <p className="text-m text-texte-doux">{atelier.description}</p>
      <dl className="mt-6 grid max-w-xl grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
        {details.map(([terme, valeur]) => (
          <div key={terme} className="contents">
            <dt className="font-semibold">{terme}</dt>
            <dd>{valeur}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 max-w-xl">
        <ActionInscription
          titre={atelier.titre}
          inscrit={inscrit}
          complet={places === 0}
          envoi={envois.get(atelier.id)}
          erreur={erreurs.get(atelier.id)}
          onInscrire={() => inscrire(atelier)}
          onDesinscrire={() => demanderDesinscription(atelier)}
        />
      </div>
      <ConfirmationDesinscription atelier={aConfirmer} envoi={aConfirmer ? envois.has(aConfirmer.id) : false} erreur={aConfirmer ? erreurs.get(aConfirmer.id) : undefined} onConfirmer={confirmer} onAnnuler={annuler} />
    </article>
  );
}
