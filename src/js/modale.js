/* Modale de réservation : un <dialog> ouvert par showModal().
   showModal() et non show() : le focus entre dans la modale, Échap ferme, et le reste de la page
   devient inerte, gratuitement. */
import { brancherValidation } from "./validation.js";
import { envoyer } from "./envoi.js";
import { reserver, ErreurServeur } from "./serveur-simule.js";

// modale : le <dialog> ; liste : la liste des ateliers, où sont les boutons « Réserver »
export function brancherModale(modale, liste) {
  const formulaire = modale.querySelector("#form-reservation");
  if (!formulaire || typeof modale.showModal !== "function") return; // sans <dialog>, « Réserver » reste un lien

  const titreAtelier = modale.querySelector(".modale__atelier");
  const recap = modale.querySelector(".modale__recap");
  const zonesSaisie = formulaire.querySelectorAll(".champ, .modale__actions");
  const boutonReserver = formulaire.querySelector("button[value=reserver]");
  const confirmation = formulaire.querySelector(".formulaire__confirmation");
  const alerte = formulaire.querySelector(".formulaire__erreur");
  const fin = formulaire.querySelector(".modale__fin");
  const { toutVerifier, effacer } = brancherValidation(formulaire);

  // L'état de la modale : quel atelier, ouvert depuis quel bouton, envoi en cours ou non
  let atelier = null;
  let declencheur = null;
  let enCours = false;

  function ouvrir(carte, bouton) {
    // L'atelier choisi est repris dans la modale : on n'a pas à s'en souvenir (Nielsen, heuristique 6)
    atelier = {
      id: carte.dataset.id,
      titre: carte.querySelector("h3").textContent,
      recap: `${carte.querySelector(".atelier__infos").textContent} · ${carte.querySelector(".atelier__prix").textContent}`,
    };
    declencheur = bouton;

    titreAtelier.textContent = atelier.titre;
    recap.textContent = atelier.recap;
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
  liste.querySelectorAll("a[data-reserver]").forEach((lien) => {
    const bouton = document.createElement("button");
    bouton.type = "button"; // sinon, dans un formulaire, il soumettrait
    bouton.className = lien.className;
    bouton.dataset.reserver = "";
    bouton.append(...lien.childNodes);
    lien.replaceWith(bouton);
  });

  // UN écouteur pour toutes les cartes, présentes et futures (délégation)
  liste.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("button[data-reserver]");
    if (bouton) {
      ouvrir(bouton.closest(".atelier"), bouton);
    }
  });

  formulaire.addEventListener("submit", async (evenement) => {
    const action = evenement.submitter?.value;
    if (action === "annuler" || action === "fermer") {
      return; // method="dialog" : ces deux boutons ferment la modale, sans validation
    }
    evenement.preventDefault(); // retient la modale ouverte tant que ce n'est pas réservé
    if (enCours) return;
    alerte.textContent = "";
    if (!toutVerifier()) return;

    const reservation = {
      atelierId: atelier.id,
      nom: formulaire.nom.value.trim(),
      courriel: formulaire.courriel.value.trim(),
    };

    enCours = true;
    try {
      // Les cartes écrites dans la page n'annoncent pas leurs places : on n'en limite pas le nombre ici
      await envoyer(boutonReserver, "Réservation en cours…", () => reserver(reservation, Infinity));
      const prenom = reservation.nom.split(/\s+/)[0];
      zonesSaisie.forEach((zone) => (zone.hidden = true));
      confirmation.textContent = `C'est réservé, ${prenom} ! ${atelier.titre} : ${atelier.recap}. Le lien de l'atelier arrivera à ${reservation.courriel} la veille.`;
      fin.hidden = false;
      fin.querySelector("button").focus(); // le focus ne reste pas sur un bouton devenu caché
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
