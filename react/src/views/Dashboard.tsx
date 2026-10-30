import { Link, useLocation } from "react-router";
import { CartesFantomes } from "../components/CartesFantomes";
import { ListeAteliers } from "../components/ListeAteliers";
import { TitreDeVue } from "../components/TitreDeVue";
import { useCompte } from "../contexts/Compte";
import { useInscriptions } from "../contexts/Inscriptions";
import { useAteliers } from "../hooks/useAteliers";
import { CHEMINS } from "../router/chemins";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "../utils/filtre";
import { messageErreur, prenomDe } from "../utils/messages";

/** « Mon espace » (TP 2, point 4) : les ateliers suivis, leurs places, et de quoi se désinscrire. Gardée par ExigeConnexion. */
export function Dashboard() {
  const { utilisateur } = useCompte();
  const { inscrits } = useInscriptions();
  const { requete, recharger } = useAteliers();
  const bienvenue = (useLocation().state as { bienvenue?: unknown } | null)?.bienvenue === true;

  // Valeur dérivée : le catalogue chargé, réduit aux ateliers suivis, par date
  const suivis = requete.statut === "succes" ? filtrerAteliers(requete.donnees, CRITERES_PAR_DEFAUT).filter((a) => inscrits.has(a.id)) : [];

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue titreOnglet="Mon espace · SkillHub">{`Bonjour ${utilisateur ? prenomDe(utilisateur.nom) : ""}`}</TitreDeVue>
      {bienvenue && <p className="mb-4 rounded-s bg-succes-fond px-4 py-3 font-semibold text-succes">Votre compte est créé. Bienvenue !</p>}
      <p className="text-texte-doux">Profil : {utilisateur?.profil === "formateur" ? "formateur indépendant" : "en reconversion"}</p>

      <h2 className="mt-8 text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">Mes ateliers</h2>
      <div aria-busy={requete.statut === "chargement"}>
        {requete.statut === "chargement" && <CartesFantomes />}
        {requete.statut === "erreur" && (
          <p role="alert" className="mt-4">
            {messageErreur(requete.erreur)}{" "}
            <button type="button" onClick={recharger} className="underline">
              Réessayer
            </button>
          </p>
        )}
        {requete.statut === "succes" &&
          (suivis.length === 0 ? (
            <p className="mt-4">
              Vous n'êtes inscrit à aucun atelier pour l'instant. <Link to={CHEMINS.ateliers}>Parcourir le catalogue</Link>
            </p>
          ) : (
            <ListeAteliers ateliers={suivis} />
          ))}
      </div>
    </div>
  );
}
