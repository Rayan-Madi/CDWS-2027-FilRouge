/* Formulaire « Créer mon compte » : on empêche le rechargement, on valide, puis on envoie. */
import { brancherValidation } from "./validation.js";
import { envoyer } from "./envoi.js";
import { inscrire, ErreurServeur } from "./serveur-simule.js";

export function brancherInscription(formulaire) {
  const bouton = formulaire.querySelector("button[type=submit]");
  const confirmation = formulaire.querySelector(".formulaire__confirmation");
  const alerte = formulaire.querySelector(".formulaire__erreur");
  if (!bouton || !confirmation || !alerte) return;

  const { toutVerifier, effacer } = brancherValidation(formulaire);
  let enCours = false; // l'état de l'envoi, dans une variable

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault(); // sans lui, le formulaire recharge la page et tout est perdu
    if (enCours) return; // pas de double envoi
    confirmation.textContent = "";
    alerte.textContent = "";
    if (!toutVerifier()) return;

    const donnees = new FormData(formulaire);
    const inscription = {
      nom: donnees.get("nom").trim(),
      courriel: donnees.get("courriel").trim(),
      profil: donnees.get("profil"),
    };

    enCours = true;
    try {
      await envoyer(bouton, "Inscription en cours…", () => inscrire(inscription));
      const prenom = inscription.nom.split(/\s+/)[0];
      formulaire.reset();
      effacer();
      confirmation.textContent = `Merci ${prenom}, votre compte est prêt. Choisissez maintenant un atelier ci-dessus et touchez « Réserver ».`;
    } catch (erreur) {
      // Un refus du serveur a sa phrase ; une panne imprévue aussi, et son détail part dans la console
      if (erreur instanceof ErreurServeur) {
        alerte.textContent = erreur.message;
      } else {
        console.error(erreur);
        alerte.textContent = "L'inscription n'a pas pu aboutir. Réessayez dans un instant.";
      }
    } finally {
      enCours = false;
    }
  });
}
