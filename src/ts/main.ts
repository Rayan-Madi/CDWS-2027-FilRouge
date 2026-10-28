/* SkillHub — le point d'entrée, le SEUL que la page charge (cours, 2.5) : le navigateur suit les imports.
   type="module" implique defer, et donne à chaque fichier sa propre portée : plus de variables globales.
   Amélioration progressive : sans ce module, la page reste complète (menu déplié, trois ateliers écrits
   dans la page, liens « Réserver » vers le formulaire, validation par le navigateur).
   C'est ICI que les composants se rencontrent : chacun ne connaît que ses rappels. */
import { elementCible, trouverTous } from "./dom.js";
import { brancherMenu } from "./menu.js";
import { monterCatalogue, type Catalogue } from "./catalogue.js";
import { brancherModale, type Modale } from "./modale.js";
import { brancherInscription } from "./inscription.js";
import { brancherNavigationCourante } from "./navigation-courante.js";

// Chaque composant démarre à part : s'il plante, les autres marchent encore, et la console dit lequel
function monter<T>(nom: string, brancher: () => T): T | null {
  try {
    return brancher();
  } catch (erreur) {
    console.error(`SkillHub : « ${nom} » n'a pas pu démarrer.`, erreur);
    return null;
  }
}

let catalogue: Catalogue | null = null;
let modale: Modale | null = null;

const dialogue = document.querySelector("#modale-reservation");
if (dialogue instanceof HTMLDialogElement && typeof dialogue.showModal === "function") {
  modale = monter("modale", () =>
    brancherModale(dialogue, {
      surReservee: (atelier) => catalogue?.retirerUnePlace(atelier.id),
      surFermee: (atelier) => catalogue?.rendreLeFocus(atelier.id),
    })
  );
}

const sectionAteliers = document.querySelector("#ateliers");
if (sectionAteliers instanceof HTMLElement) {
  catalogue = monter("catalogue", () =>
    monterCatalogue(sectionAteliers, {
      // Sans modale (navigateur trop ancien), on garde le chemin de la page sans JavaScript : le formulaire
      surReserver: (atelier) => (modale ? modale.ouvrir(atelier) : location.assign("#inscription")),
    })
  );
}

const nav = document.querySelector(".navigation");
if (nav instanceof HTMLElement) {
  // Le menu ne connaît pas le catalogue : il prévient, et c'est ici qu'on décide quoi en faire
  monter("menu", () => brancherMenu(nav, { surRaccourci: (raccourci) => catalogue?.appliquerRaccourci(raccourci) }));
}

const formInscription = document.querySelector("#form-inscription");
if (formInscription instanceof HTMLFormElement) {
  monter("inscription", () => brancherInscription(formInscription));
}

monter("navigation courante", () =>
  brancherNavigationCourante(
    trouverTous(document, '.navigation__liste > li > a[href^="#"]', HTMLAnchorElement),
    trouverTous(document, "main section[id]", HTMLElement)
  )
);

/* ---------- Lien « formateur » : le profil est déjà choisi ----------
   Un choix de moins pour la formatrice qui arrive par l'appel aux formateurs. Délégué à la section :
   un seul écouteur, quel que soit le nombre de liens. */
const formateurs = document.querySelector("#formateurs");
const profil = document.querySelector("#profil");
if (formateurs && profil instanceof HTMLSelectElement) {
  formateurs.addEventListener("click", (evenement) => {
    const lien = elementCible(evenement)?.closest("a[data-profil]");
    if (lien instanceof HTMLAnchorElement) {
      profil.value = lien.dataset.profil ?? "";
      // Une valeur posée par le code ne déclenche aucun événement : on prévient la validation,
      // qui retire le message « Choisissez votre profil » s'il était affiché
      profil.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

/* ---------- Année du pied de page ---------- */
const annee = document.querySelector(".annee");
if (annee) {
  annee.textContent = String(new Date().getFullYear()); // textContent attend une chaîne
}
