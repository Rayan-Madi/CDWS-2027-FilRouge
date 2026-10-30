import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { BoutonAction } from "../components/Action";
import { Champ, CLASSES_CHAMP } from "../components/Champ";
import { TitreDeVue } from "../components/TitreDeVue";
import { useAteliersCrees } from "../contexts/AteliersCrees";
import { useCompte } from "../contexts/Compte";
import { useFormulaire } from "../hooks/useFormulaire";
import { CHEMINS } from "../router/chemins";
import { ErreurServeur } from "../services/serveur-simule";
import { CATEGORIES, DUREES, LIEUX, ORDRE_CHAMPS_ATELIER, PLACES_MAX, REGLES_ATELIER, VALEURS_ATELIER_VIDES, versAtelier } from "../utils/atelier";
import { estNiveau } from "../utils/filtre";
import { formaterDuree } from "../utils/format";

/**
 * Créer un atelier (TP 2, point 5), côté formateur : le second formulaire CONTRÔLÉ, sur la même
 * mécanique que « Créer mon compte » (useFormulaire). Gardée : connecté ET formateur.
 */
export function CreerAtelier() {
  const { utilisateur } = useCompte();
  const { publier } = useAteliersCrees();
  const navigate = useNavigate();
  const { valeurs, erreurs, changer, quitter, valider, formulaire } = useFormulaire(VALEURS_ATELIER_VIDES, REGLES_ATELIER, ORDRE_CHAMPS_ATELIER);
  const [refus, setRefus] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(evenement: FormEvent) {
    evenement.preventDefault();
    if (envoi || !utilisateur) return; // aria-disabled n'empêche pas le clic : le double envoi s'arrête ici
    setRefus("");
    if (!valider()) return;

    setEnvoi(true);
    try {
      const atelier = versAtelier(valeurs, utilisateur.nom);
      await publier(atelier);
      // replace : le retour arrière ne ramène pas sur un formulaire déjà publié
      navigate(CHEMINS.mesAteliers, { replace: true, state: { publie: atelier.titre } });
    } catch (erreur) {
      if (erreur instanceof ErreurServeur) setRefus(erreur.message);
      else {
        console.error(erreur);
        setRefus("L'atelier n'a pas pu être publié. Réessayez dans un instant.");
      }
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <TitreDeVue titreOnglet="Créer un atelier · SkillHub">Créer un atelier</TitreDeVue>
      <p>Tous les champs sont obligatoires, sauf les prérequis. L'atelier apparaît dans le catalogue dès sa publication.</p>
      <form ref={formulaire} noValidate onSubmit={envoyer} className="mt-6 grid gap-4 rounded-m border border-bordure bg-fond p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Champ libelle="Titre de l'atelier" erreur={erreurs.titre}>
            {(a) => <input {...a} name="titre" type="text" value={valeurs.titre} onChange={(e) => changer("titre", e.target.value)} onBlur={() => quitter("titre")} className={CLASSES_CHAMP} />}
          </Champ>
        </div>
        <div className="md:col-span-2">
          <Champ libelle="Description" aide="Ce qu'on y fait, ce qu'on en retire : deux phrases suffisent." erreur={erreurs.description}>
            {(a) => <textarea {...a} name="description" rows={3} value={valeurs.description} onChange={(e) => changer("description", e.target.value)} onBlur={() => quitter("description")} className={CLASSES_CHAMP} />}
          </Champ>
        </div>
        <Champ libelle="Catégorie" erreur={erreurs.categorie}>
          {(a) => (
            <select {...a} name="categorie" value={valeurs.categorie} onChange={(e) => changer("categorie", e.target.value)} onBlur={() => quitter("categorie")} className={CLASSES_CHAMP}>
              <option value="">Choisissez</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Champ>
        <Champ libelle="Niveau" erreur={erreurs.niveau}>
          {(a) => (
            <select {...a} name="niveau" value={valeurs.niveau} onChange={(e) => changer("niveau", estNiveau(e.target.value) ? e.target.value : "")} onBlur={() => quitter("niveau")} className={CLASSES_CHAMP}>
              <option value="">Choisissez</option>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          )}
        </Champ>
        <Champ libelle="Date et heure" erreur={erreurs.date}>
          {(a) => <input {...a} name="date" type="datetime-local" value={valeurs.date} onChange={(e) => changer("date", e.target.value)} onBlur={() => quitter("date")} className={CLASSES_CHAMP} />}
        </Champ>
        <Champ libelle="Durée" erreur={erreurs.duree}>
          {(a) => (
            <select {...a} name="duree" value={valeurs.duree} onChange={(e) => changer("duree", e.target.value)} onBlur={() => quitter("duree")} className={CLASSES_CHAMP}>
              <option value="">Choisissez</option>
              {DUREES.map((d) => (
                <option key={d} value={d}>
                  {formaterDuree(d)}
                </option>
              ))}
            </select>
          )}
        </Champ>
        <Champ libelle="Lieu" erreur={erreurs.lieu}>
          {(a) => (
            <select {...a} name="lieu" value={valeurs.lieu} onChange={(e) => changer("lieu", e.target.value)} className={CLASSES_CHAMP}>
              {LIEUX.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          )}
        </Champ>
        <Champ libelle="Places" aide={`De 1 à ${PLACES_MAX}.`} erreur={erreurs.places}>
          {(a) => <input {...a} name="places" type="number" inputMode="numeric" min={1} max={PLACES_MAX} step={1} value={valeurs.places} onChange={(e) => changer("places", e.target.value)} onBlur={() => quitter("places")} className={CLASSES_CHAMP} />}
        </Champ>
        <Champ libelle="Prix en euros" aide="0 pour un atelier gratuit." erreur={erreurs.prix}>
          {(a) => <input {...a} name="prix" type="number" inputMode="numeric" min={0} step={1} value={valeurs.prix} onChange={(e) => changer("prix", e.target.value)} onBlur={() => quitter("prix")} className={CLASSES_CHAMP} />}
        </Champ>
        <Champ libelle="Prérequis (facultatif)" aide="Laissé vide : « Aucun. »" erreur={erreurs.prerequis}>
          {(a) => <input {...a} name="prerequis" type="text" value={valeurs.prerequis} onChange={(e) => changer("prerequis", e.target.value)} className={CLASSES_CHAMP} />}
        </Champ>
        <p className="md:col-span-2">
          {/* aria-disabled et non disabled : un bouton désactivé perdrait le focus pendant l'envoi */}
          <BoutonAction type="submit" aria-disabled={envoi || undefined}>
            {envoi ? "Publication en cours…" : "Publier l'atelier"}
          </BoutonAction>
        </p>
        {/* Insérée au refus : une alerte qui apparaît est annoncée tout de suite */}
        {refus && (
          <p role="alert" className="font-semibold text-erreur md:col-span-2">
            {refus}
          </p>
        )}
      </form>
    </div>
  );
}
