import type { Envoi } from "../contexts/Inscriptions";
import { BoutonAction } from "./Action";

type Props = {
  titre: string;
  inscrit: boolean;
  complet: boolean;
  envoi?: Envoi | undefined;
  erreur?: string | undefined;
  onInscrire: () => void;
  onDesinscrire: () => void;
};

/**
 * Le bouton « S'inscrire » / « Se désinscrire », partagé par la carte et la fiche. C'est le MÊME bouton
 * avant, pendant et après l'envoi : le focus ne bouge pas. aria-disabled plutôt que disabled, qui ferait
 * perdre le focus ; le clic est simplement ignoré pendant l'envoi (pas de double envoi).
 */
export function ActionInscription({ titre, inscrit, complet, envoi, erreur, onInscrire, onDesinscrire }: Props) {
  if (complet && !inscrit) return null; // « Complet » est écrit dans la ligne des places : pas de bouton

  const enCours = envoi !== undefined;
  const libelle = envoi === "inscription" ? "Inscription en cours…" : envoi === "desinscription" ? "Désinscription en cours…" : inscrit ? "Se désinscrire" : "S'inscrire";
  // Le nom accessible commence par le texte visible (WCAG 2.5.3) et dit de quel atelier il parle
  const nom = enCours ? libelle : `${libelle} ${inscrit ? "de" : "à"} l'atelier ${titre}`;

  return (
    <div className="mt-auto flex flex-col items-start gap-2 pt-2">
      {inscrit && !enCours && (
        <p className="rounded-s bg-succes-fond px-3 py-1 text-xs font-semibold text-succes">Vous êtes inscrit</p>
      )}
      <BoutonAction
        variante={inscrit ? "secondaire" : "primaire"}
        aria-label={nom}
        aria-disabled={enCours || undefined}
        onClick={() => {
          if (enCours) return;
          if (inscrit) onDesinscrire();
          else onInscrire();
        }}
      >
        {libelle}
      </BoutonAction>
      {erreur && (
        <p role="alert" className="text-xs font-semibold text-erreur">
          {erreur}
        </p>
      )}
    </div>
  );
}
