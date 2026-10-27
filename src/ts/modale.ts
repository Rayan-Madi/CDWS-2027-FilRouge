/* La fiche d'un atelier, et sa réservation, dans un <dialog> ouvert par showModal().
   showModal() et non show() : le focus entre dans la modale, Échap ferme, et le reste de la page
   devient inerte, gratuitement. */
import type { Atelier, Reservation } from "./types.js";
import { trouver, trouverTous } from "./dom.js";
import { brancherValidation } from "./validation.js";
import { envoyer } from "./envoi.js";
import { texteDu, prenomDe } from "./formulaire.js";
import { formaterPlaces, recapAtelier } from "./format.js";
import { reserver, ErreurServeur } from "./serveur-simule.js";

export interface RappelsModale {
  /** La réservation a abouti : le catalogue retire une place. */
  surReservee: (atelier: Atelier) => void;
  /** La modale s'est fermée, quelle que soit la façon : le catalogue rend le focus à la carte. */
  surFermee: (atelier: Atelier) => void;
}

export interface Modale {
  ouvrir(atelier: Atelier): void;
}

/** La suite de la confirmation dépend du lieu : un lien de connexion, ou une adresse. */
function suiteConfirmation(atelier: Atelier, courriel: string): string {
  return atelier.lieu === "En ligne"
    ? `Le lien de connexion arrivera à ${courriel} la veille.`
    : `L'adresse exacte, à ${atelier.lieu}, arrivera à ${courriel} la veille.`;
}

export function brancherModale(modale: HTMLDialogElement, rappels: RappelsModale): Modale {
  const formulaire = trouver(modale, "#form-reservation", HTMLFormElement);
  const titreAtelier = trouver(modale, ".modale__atelier", HTMLElement);
  const recap = trouver(modale, ".modale__recap", HTMLElement);
  const description = trouver(modale, ".modale__description", HTMLElement);
  const formateur = trouver(modale, ".modale__formateur", HTMLElement);
  const prerequis = trouver(modale, ".modale__prerequis", HTMLElement);
  const places = trouver(modale, ".modale__places", HTMLElement);
  const zonesSaisie = trouverTous(formulaire, ".champ, .modale__actions", HTMLElement);
  const boutonReserver = trouver(formulaire, "button[value=reserver]", HTMLButtonElement);
  const confirmation = trouver(formulaire, ".formulaire__confirmation", HTMLElement);
  const alerte = trouver(formulaire, ".formulaire__erreur", HTMLElement);
  const fin = trouver(formulaire, ".modale__fin", HTMLElement);
  const boutonFermer = trouver(fin, "button", HTMLButtonElement);
  const { toutVerifier, effacer } = brancherValidation(formulaire);

  // L'état de la modale : l'atelier affiché, et l'envoi en cours ou non
  let atelier: Atelier | null = null;
  let enCours = false;

  function ouvrir(choisi: Atelier): void {
    atelier = choisi;
    // L'atelier choisi est repris dans la modale : on n'a pas à s'en souvenir (Nielsen, heuristique 6)
    titreAtelier.textContent = choisi.titre;
    recap.textContent = recapAtelier(choisi);
    description.textContent = choisi.description;
    formateur.textContent = choisi.formateur;
    prerequis.textContent = choisi.prerequis;
    places.textContent = formaterPlaces(choisi.places);
    formulaire.reset();
    effacer();
    zonesSaisie.forEach((zone) => (zone.hidden = false));
    confirmation.textContent = "";
    alerte.textContent = "";
    fin.hidden = true;
    modale.showModal();
  }

  formulaire.addEventListener("submit", async (evenement) => {
    const envoyeur = evenement.submitter;
    const action = envoyeur instanceof HTMLButtonElement ? envoyeur.value : "";
    if (action === "annuler" || action === "fermer") {
      return; // method="dialog" : ces deux boutons ferment la modale, sans validation
    }
    evenement.preventDefault(); // retient la modale ouverte tant que ce n'est pas réservé
    if (enCours || !atelier) return;
    alerte.textContent = "";
    if (!toutVerifier()) return;

    const choisi = atelier;
    const donnees = new FormData(formulaire);
    const reservation: Reservation = { atelierId: choisi.id, nom: texteDu(donnees, "nom"), courriel: texteDu(donnees, "courriel") };

    enCours = true;
    try {
      await envoyer(boutonReserver, "Réservation en cours…", () => reserver(reservation, choisi.places));
      rappels.surReservee(choisi);
      zonesSaisie.forEach((zone) => (zone.hidden = true));
      confirmation.textContent = `C'est réservé, ${prenomDe(reservation.nom)} ! ${choisi.titre} : ${recapAtelier(choisi)}. ${suiteConfirmation(choisi, reservation.courriel)}`;
      fin.hidden = false;
      boutonFermer.focus(); // le focus ne reste pas sur un bouton devenu caché
    } catch (erreur) {
      if (erreur instanceof ErreurServeur) {
        alerte.textContent = erreur.message;
      } else {
        console.error(erreur);
        alerte.textContent = "La réservation n'a pas pu aboutir. Réessayez dans un instant.";
      }
    } finally {
      enCours = false;
    }
  });

  // La seule chose que <dialog> ne garantit pas partout : rendre le focus là d'où l'on vient.
  // L'événement close part quelle que soit la façon de fermer (bouton, Échap, fond). Le catalogue,
  // qui a pu reconstruire ses cartes entre-temps, retrouve la bonne par l'identifiant de l'atelier.
  modale.addEventListener("close", () => {
    if (atelier) rappels.surFermee(atelier);
  });

  // Un clic sur le fond sombre ferme : la cible est alors le <dialog> lui-même,
  // car tout le contenu est dans .modale__contenu et le dialog n'a pas de marge interne.
  modale.addEventListener("click", (evenement) => {
    if (evenement.target === modale) {
      modale.close();
    }
  });

  return { ouvrir };
}
