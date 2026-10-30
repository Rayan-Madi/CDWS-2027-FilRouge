import { useRef } from "react";
import { BoutonAction } from "../components/Action";
import { CartesFantomes } from "../components/CartesFantomes";
import { FiltresAteliers } from "../components/FiltresAteliers";
import { ListeAteliers } from "../components/ListeAteliers";
import { TitreDeVue } from "../components/TitreDeVue";
import { useAteliers } from "../hooks/useAteliers";
import { useCriteres } from "../hooks/useCriteres";
import { CRITERES_PAR_DEFAUT, decrireResultat, filtrerAteliers, MESSAGE_VIDE } from "../utils/filtre";
import { messageErreur } from "../utils/messages";

/** Le catalogue (TP 1, puis TP 2 point 2 : les critères dans l'URL), et ses quatre états (FM03). */
export function Catalogue() {
  const { requete, recharger } = useAteliers();
  const [criteres, changerCriteres] = useCriteres();
  const zone = useRef<HTMLDivElement>(null);

  // Valeur DÉRIVÉE : recalculée à chaque rendu, jamais rangée dans un état
  const visibles = requete.statut === "succes" ? filtrerAteliers(requete.donnees, criteres) : [];

  // Le texte de la région annoncée : il nomme les critères, donc il change (et s'annonce) à chaque filtre
  let annonce = "";
  let ecran;
  switch (requete.statut) {
    case "chargement":
      annonce = "Chargement des ateliers…";
      ecran = <CartesFantomes />;
      break;
    case "erreur":
      ecran = (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-m border border-l-4 border-erreur bg-fond px-6 py-4">
          <p role="alert">
            <strong className="text-erreur">Impossible de charger les ateliers.</strong> {messageErreur(requete.erreur)}
          </p>
          <BoutonAction
            variante="secondaire"
            onClick={() => {
              // Le bouton va disparaître : le focus part sur le titre, pas dans le vide
              zone.current?.parentElement?.querySelector<HTMLElement>("[data-titre-de-vue]")?.focus();
              recharger();
            }}
          >
            Réessayer
          </BoutonAction>
        </div>
      );
      break;
    case "succes":
      if (visibles.length === 0) {
        annonce = MESSAGE_VIDE;
        ecran = (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-m border border-dashed border-texte-doux bg-fond px-6 py-4">
            <p>Changez de niveau ou de mot-clé, ou revenez au catalogue complet.</p>
            <BoutonAction
              variante="secondaire"
              onClick={() => {
                changerCriteres(CRITERES_PAR_DEFAUT);
                document.getElementById("recherche")?.focus(); // on repart de la première commande
              }}
            >
              Tout afficher
            </BoutonAction>
          </div>
        );
      } else {
        annonce = decrireResultat(visibles.length, criteres);
        ecran = <ListeAteliers ateliers={visibles} />;
      }
      break;
    default: {
      // Un état ajouté au type sans être traité ici ne compile pas : l'écran blanc devient impossible
      const oublie: never = requete;
      throw new Error(`État non traité : ${JSON.stringify(oublie)}`);
    }
  }

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue titreOnglet="Les ateliers · SkillHub">Les ateliers du moment</TitreDeVue>
      <FiltresAteliers criteres={criteres} onChange={changerCriteres} />
      {/* Présente dès le départ, vide au besoin : une région qui apparaît n'est pas toujours annoncée */}
      <p role="status" className="mt-4 font-semibold text-texte-doux empty:m-0">
        {annonce}
      </p>
      <div ref={zone} aria-busy={requete.statut === "chargement"}>
        {ecran}
      </div>
    </div>
  );
}
