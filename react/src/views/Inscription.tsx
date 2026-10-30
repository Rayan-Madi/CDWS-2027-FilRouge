import { useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { BoutonAction, LienAction } from "../components/Action";
import { Champ, CLASSES_CHAMP } from "../components/Champ";
import { TitreDeVue } from "../components/TitreDeVue";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../router/chemins";
import { ErreurServeur } from "../services/serveur-simule";
import { prenomDe } from "../utils/messages";
import { erreursDe, ORDRE_DES_CHAMPS, REGLES, VALEURS_VIDES, type ChampInscription, type ValeursInscription } from "../utils/validation";

type Erreurs = Partial<Record<ChampInscription, string>>;

/** Le state de navigation est « unknown » : on vérifie ce qu'on lit (où revenir, et pourquoi). */
function lireRetour(state: unknown): { depuis: string | undefined; pourquoi: string | undefined } {
  const objet = typeof state === "object" && state !== null ? (state as Record<string, unknown>) : {};
  return {
    depuis: typeof objet.depuis === "string" ? objet.depuis : undefined,
    pourquoi: typeof objet.pourquoi === "string" ? objet.pourquoi : undefined,
  };
}

/** Pose ou retire l'erreur d'un champ : une règle qui rend "" veut dire « plus d'erreur ». */
function avecErreur(erreurs: Erreurs, champ: ChampInscription, message: string): Erreurs {
  const copie = { ...erreurs };
  if (message === "") delete copie[champ];
  else copie[champ] = message;
  return copie;
}

/** Créer mon compte : un formulaire CONTRÔLÉ (diapo 51) — la valeur est l'état, le champ n'en est que le reflet. */
export function Inscription() {
  const { utilisateur, creerCompte } = useCompte();
  const navigate = useNavigate();
  const retour = lireRetour(useLocation().state);
  const [params] = useSearchParams();
  const [valeurs, setValeurs] = useState<ValeursInscription>({ ...VALEURS_VIDES, profil: params.get("profil") === "formateur" ? "formateur" : "" });
  // Les erreurs AFFICHÉES : un champ n'est jugé qu'une fois quitté (aider, pas punir)
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [refus, setRefus] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const formulaire = useRef<HTMLFormElement>(null);

  if (utilisateur) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <TitreDeVue>Vous avez déjà un compte</TitreDeVue>
        <p>Vous êtes connecté en tant que {prenomDe(utilisateur.nom)}.</p>
        <p className="mt-6 flex flex-wrap gap-3">
          <LienAction to={CHEMINS.monEspace}>Mon espace</LienAction>
          <LienAction to={CHEMINS.ateliers} variante="secondaire">Voir les ateliers</LienAction>
        </p>
      </div>
    );
  }

  function changer<C extends ChampInscription>(champ: C, valeur: ValeursInscription[C]) {
    const suivantes = { ...valeurs, [champ]: valeur };
    setValeurs(suivantes);
    // Une erreur déjà affichée se met à jour à chaque frappe, et disparaît dès que c'est bon
    if (erreurs[champ] !== undefined) setErreurs((e) => avecErreur(e, champ, REGLES[champ](suivantes)));
  }

  const quitter = (champ: ChampInscription) => setErreurs((e) => avecErreur(e, champ, REGLES[champ](valeurs)));

  async function envoyer(evenement: FormEvent) {
    evenement.preventDefault(); // sans lui, le navigateur recharge la page et tout est perdu
    if (envoi) return; // aria-disabled n'empêche pas le clic : c'est ici qu'on refuse le double envoi
    setRefus("");
    const toutes = erreursDe(valeurs);
    setErreurs(toutes);
    const premier = ORDRE_DES_CHAMPS.find((c) => toutes[c] !== undefined);
    if (premier) {
      formulaire.current?.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus();
      return;
    }
    if (valeurs.profil === "") return; // déjà signalé ; garde pour le type

    setEnvoi(true);
    try {
      await creerCompte({ nom: valeurs.nom.trim(), courriel: valeurs.courriel.trim(), profil: valeurs.profil });
      // replace : le retour arrière ne ramène pas sur un formulaire déjà envoyé
      navigate(retour.depuis ?? CHEMINS.monEspace, { replace: true, state: { bienvenue: true } });
    } catch (erreur) {
      if (erreur instanceof ErreurServeur) setRefus(erreur.message);
      else {
        console.error(erreur);
        setRefus("L'inscription n'a pas pu aboutir. Réessayez dans un instant.");
      }
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <TitreDeVue titreOnglet="Créer mon compte · SkillHub">Créer mon compte</TitreDeVue>
      {retour.pourquoi && <p className="mb-2 font-semibold">Pour vous inscrire à « {retour.pourquoi} », créez d'abord votre compte : vous y reviendrez ensuite.</p>}
      <p>L'inscription est gratuite. Vous ne payez que les ateliers que vous réservez.</p>
      <form ref={formulaire} noValidate onSubmit={envoyer} className="mt-6 grid gap-4 rounded-m border border-bordure bg-fond p-6">
        <Champ libelle="Prénom et nom" erreur={erreurs.nom}>
          {(a) => <input {...a} name="nom" type="text" autoComplete="name" value={valeurs.nom} onChange={(e) => changer("nom", e.target.value)} onBlur={() => quitter("nom")} className={CLASSES_CHAMP} />}
        </Champ>
        <Champ libelle="Adresse électronique" aide="Nous ne la transmettons à personne." erreur={erreurs.courriel}>
          {(a) => <input {...a} name="courriel" type="email" autoComplete="email" value={valeurs.courriel} onChange={(e) => changer("courriel", e.target.value)} onBlur={() => quitter("courriel")} className={CLASSES_CHAMP} />}
        </Champ>
        <Champ libelle="Je suis" erreur={erreurs.profil}>
          {(a) => (
            <select {...a} name="profil" value={valeurs.profil} onChange={(e) => changer("profil", e.target.value === "apprenant" || e.target.value === "formateur" ? e.target.value : "")} onBlur={() => quitter("profil")} className={CLASSES_CHAMP}>
              <option value="">Choisissez</option>
              <option value="apprenant">En reconversion</option>
              <option value="formateur">Formateur indépendant</option>
            </select>
          )}
        </Champ>
        <Champ libelle="J'accepte les conditions d'utilisation" erreur={erreurs.cgu} caseACocher>
          {(a) => <input {...a} name="cgu" type="checkbox" checked={valeurs.cgu} onChange={(e) => changer("cgu", e.target.checked)} onBlur={() => quitter("cgu")} className="size-6 accent-accent" />}
        </Champ>
        <details className="text-xs">
          <summary className="cursor-pointer py-2 text-accent underline">Lire les conditions d'utilisation</summary>
          <ul className="mb-2 list-disc pl-6">
            <li>SkillHub est un projet pédagogique : ce formulaire est une démonstration, aucune donnée n'est envoyée ni conservée.</li>
            <li>L'inscription est gratuite. Seuls les ateliers réservés sont payants, au prix affiché sur leur carte.</li>
            <li>Une réservation s'annule sans frais jusqu'à 48 heures avant l'atelier.</li>
          </ul>
        </details>
        <p>
          {/* aria-disabled et non disabled : un bouton désactivé perdrait le focus pendant l'envoi */}
          <BoutonAction type="submit" aria-disabled={envoi || undefined}>
            {envoi ? "Inscription en cours…" : "Créer mon compte"}
          </BoutonAction>
        </p>
        {/* Insérée au refus : une alerte qui apparaît est annoncée tout de suite (elle interrompt) */}
        {refus && (
          <p role="alert" className="font-semibold text-erreur">
            {refus}
          </p>
        )}
      </form>
    </div>
  );
}
