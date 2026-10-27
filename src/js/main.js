/* SkillHub — le point d'entrée, le SEUL que la page charge (cours, 2.5) : le navigateur suit les imports.
   type="module" implique defer, et donne à chaque fichier sa propre portée : plus de variables globales.
   Amélioration progressive : sans ce module, la page reste complète (menu déplié, liens « Réserver »
   vers le formulaire, validation par le navigateur). */
import { brancherMenu } from "./menu.js";
import { brancherFiltre } from "./filtre.js";
import { brancherInscription } from "./inscription.js";
import { brancherModale } from "./modale.js";
import { brancherNavigationCourante } from "./navigation-courante.js";

// Chaque composant démarre à part : s'il plante, les autres marchent encore, et la console dit lequel
function monter(nom, brancher) {
  try {
    return brancher();
  } catch (erreur) {
    console.error(`SkillHub : « ${nom} » n'a pas pu démarrer.`, erreur);
    return null;
  }
}

const sectionAteliers = document.querySelector("#ateliers");
const filtre = sectionAteliers ? monter("filtre", () => brancherFiltre(sectionAteliers)) : null;

const nav = document.querySelector(".navigation");
if (nav) {
  // Le menu ne connaît pas le filtre : il prévient, et c'est ici qu'on décide quoi en faire
  monter("menu", () => brancherMenu(nav, { surRaccourci: (raccourci) => filtre?.appliquerRaccourci(raccourci) }));
}

const formInscription = document.querySelector("#form-inscription");
if (formInscription) monter("inscription", () => brancherInscription(formInscription));

const modale = document.querySelector("#modale-reservation");
const listeAteliers = document.querySelector(".ateliers");
if (modale && listeAteliers) monter("modale", () => brancherModale(modale, listeAteliers));

monter("navigation courante", () =>
  brancherNavigationCourante([...document.querySelectorAll('.navigation__liste > li > a[href^="#"]')])
);

/* ---------- Lien « formateur » : le profil est déjà choisi ----------
   Un choix de moins pour la formatrice qui arrive par l'appel aux formateurs. Délégué à la section :
   un seul écouteur, quel que soit le nombre de liens. */
const formateurs = document.querySelector("#formateurs");
const profil = document.querySelector("#profil");
if (formateurs && profil) {
  formateurs.addEventListener("click", (evenement) => {
    const lien = evenement.target.closest("a[data-profil]");
    if (lien) {
      profil.value = lien.dataset.profil;
    }
  });
}

/* ---------- Année du pied de page ---------- */
const annee = document.querySelector(".annee");
if (annee) {
  annee.textContent = new Date().getFullYear();
}
