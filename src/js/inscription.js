/* Formulaire « Créer mon compte » : on empêche le rechargement, on valide, puis on envoie. */
import { trouver } from "./dom.js";
import { brancherValidation } from "./validation.js";
import { envoyer } from "./envoi.js";
import { texteDu, prenomDe } from "./formulaire.js";
import { inscrire, ErreurServeur } from "./serveur-simule.js";
const estProfil = (valeur) => valeur === "apprenant" || valeur === "formateur";
export function brancherInscription(formulaire) {
    const bouton = trouver(formulaire, "button[type=submit]", HTMLButtonElement);
    const confirmation = trouver(formulaire, ".formulaire__confirmation", HTMLElement);
    const alerte = trouver(formulaire, ".formulaire__erreur", HTMLElement);
    const { toutVerifier, effacer } = brancherValidation(formulaire);
    let enCours = false; // l'état de l'envoi, dans une variable
    formulaire.addEventListener("submit", async (evenement) => {
        evenement.preventDefault(); // sans lui, le formulaire recharge la page et tout est perdu
        if (enCours)
            return; // pas de double envoi
        confirmation.textContent = "";
        alerte.textContent = "";
        if (!toutVerifier())
            return;
        const donnees = new FormData(formulaire);
        const profil = texteDu(donnees, "profil");
        if (!estProfil(profil)) {
            alerte.textContent = "Choisissez votre profil dans la liste."; // une option ajoutée au HTML sans passer par le type
            return;
        }
        const inscription = { nom: texteDu(donnees, "nom"), courriel: texteDu(donnees, "courriel"), profil };
        enCours = true;
        try {
            await envoyer(bouton, "Inscription en cours…", () => inscrire(inscription));
            formulaire.reset();
            effacer();
            confirmation.textContent = `Merci ${prenomDe(inscription.nom)}, votre compte est prêt. Choisissez maintenant un atelier ci-dessus et touchez « Réserver ».`;
        }
        catch (erreur) {
            // Un refus du serveur a sa phrase ; une panne imprévue aussi, et son détail part dans la console
            if (erreur instanceof ErreurServeur) {
                alerte.textContent = erreur.message;
            }
            else {
                console.error(erreur);
                alerte.textContent = "L'inscription n'a pas pu aboutir. Réessayez dans un instant.";
            }
        }
        finally {
            enCours = false;
        }
    });
}
//# sourceMappingURL=inscription.js.map