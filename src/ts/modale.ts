/* Modale de réservation : un <dialog> ouvert par showModal().
   showModal() et non show() : le focus entre dans la modale, Échap ferme, et le reste de la page
   devient inerte, gratuitement. */
import { trouver, trouverTous, elementCible } from "./dom.js";
import { brancherValidation } from "./validation.js";
import { envoyer } from "./envoi.js";
import { texteDu, prenomDe } from "./formulaire.js";
import { reserver, ErreurServeur } from "./serveur-simule.js";
import type { Reservation } from "./types.js";

/** Ce que la modale reprend de la carte choisie. */
interface FicheAtelier {
  readonly id: string;
  readonly titre: string;
  readonly recap: string;
}

const texteDe = (racine: ParentNode, selecteur: string): string => (trouver(racine, selecteur, HTMLElement).textContent ?? "").trim();

function ficheDe(carte: HTMLElement): FicheAtelier {
  return {
    id: carte.dataset.id ?? "",
    titre: texteDe(carte, "h3"),
    recap: `${texteDe(carte, ".atelier__infos")} · ${texteDe(carte, ".atelier__prix")}`,
  };
}

// modale : le <dialog> ; liste : la liste des ateliers, où sont les boutons « Réserver »
export function brancherModale(modale: HTMLDialogElement, liste: HTMLElement): void {
  if (typeof modale.showModal !== "function") return; // sans <dialog>, « Réserver » reste un lien

  const formulaire = trouver(modale, "#form-reservation", HTMLFormElement);
  const titreAtelier = trouver(modale, ".modale__atelier", HTMLElement);
  const recap = trouver(modale, ".modale__recap", HTMLElement);
  const zonesSaisie = trouverTous(formulaire, ".champ, .modale__actions", HTMLElement);
  const boutonReserver = trouver(formulaire, "button[value=reserver]", HTMLButtonElement);
  const confirmation = trouver(formulaire, ".formulaire__confirmation", HTMLElement);
  const alerte = trouver(formulaire, ".formulaire__erreur", HTMLElement);
  const fin = trouver(formulaire, ".modale__fin", HTMLElement);
  const boutonFermer = trouver(fin, "button", HTMLButtonElement);
  const { toutVerifier, effacer } = brancherValidation(formulaire);

  // L'état de la modale : quel atelier, ouvert depuis quel bouton, envoi en cours ou non
  let atelier: FicheAtelier | null = null;
  let declencheur: HTMLButtonElement | null = null;
  let enCours = false;

  function ouvrir(fiche: FicheAtelier, bouton: HTMLButtonElement): void {
    atelier = fiche;
    declencheur = bouton;
    // L'atelier choisi est repris dans la modale : on n'a pas à s'en souvenir (Nielsen, heuristique 6)
    titreAtelier.textContent = fiche.titre;
    recap.textContent = fiche.recap;
    formulaire.reset();
    effacer();
    zonesSaisie.forEach((zone) => (zone.hidden = false));
    confirmation.textContent = "";
    alerte.textContent = "";
    fin.hidden = true;
    modale.showModal();
  }

  // Sans JavaScript, « Réserver » est un lien vers le formulaire. Avec, il devient un vrai bouton.
  // On DÉPLACE son contenu (le texte masqué compris) au lieu de le recopier par innerHTML.
  trouverTous(liste, "a[data-reserver]", HTMLAnchorElement).forEach((lien) => {
    const bouton = document.createElement("button");
    bouton.type = "button"; // sinon, dans un formulaire, il soumettrait
    bouton.className = lien.className;
    bouton.dataset.reserver = "";
    bouton.append(...lien.childNodes);
    lien.replaceWith(bouton);
  });

  // UN écouteur pour toutes les cartes, présentes et futures (délégation)
  liste.addEventListener("click", (evenement) => {
    const bouton = elementCible(evenement)?.closest("button[data-reserver]");
    const carte = bouton?.closest(".atelier");
    if (bouton instanceof HTMLButtonElement && carte instanceof HTMLElement) {
      ouvrir(ficheDe(carte), bouton);
    }
  });

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

    const fiche = atelier;
    const donnees = new FormData(formulaire);
    const reservation: Reservation = { atelierId: fiche.id, nom: texteDu(donnees, "nom"), courriel: texteDu(donnees, "courriel") };

    enCours = true;
    try {
      // Les cartes écrites dans la page n'annoncent pas leurs places : on n'en limite pas le nombre ici
      await envoyer(boutonReserver, "Réservation en cours…", () => reserver(reservation, Infinity));
      zonesSaisie.forEach((zone) => (zone.hidden = true));
      confirmation.textContent = `C'est réservé, ${prenomDe(reservation.nom)} ! ${fiche.titre} : ${fiche.recap}. Le lien de l'atelier arrivera à ${reservation.courriel} la veille.`;
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

  // La seule chose que <dialog> ne garantit pas partout : rendre le focus au déclencheur.
  // L'événement close part quelle que soit la façon de fermer (bouton, Échap, fond).
  modale.addEventListener("close", () => {
    declencheur?.focus();
  });

  // Un clic sur le fond sombre ferme : la cible est alors le <dialog> lui-même,
  // car tout le contenu est dans .modale__contenu et le dialog n'a pas de marge interne.
  modale.addEventListener("click", (evenement) => {
    if (evenement.target === modale) {
      modale.close();
    }
  });
}
