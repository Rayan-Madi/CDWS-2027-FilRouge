/* SkillHub — JavaScript natif, chargé en defer.
   Amélioration progressive : sans ce fichier, la page reste complète
   (menu visible, formulaire validé par le navigateur). */

/* ---------- Menu mobile ---------- */
const boutonMenu = document.querySelector(".menu-bouton");
const menu = document.querySelector("#menu");
const petitEcran = window.matchMedia("(max-width: 47.99em)");

function ouvrirMenu(ouvert) {
  boutonMenu.setAttribute("aria-expanded", String(ouvert));
  menu.toggleAttribute("data-ferme", !ouvert);
}

if (boutonMenu && menu) {
  ouvrirMenu(false);

  boutonMenu.addEventListener("click", () => {
    ouvrirMenu(boutonMenu.getAttribute("aria-expanded") !== "true");
  });

  // Un lien choisi referme le menu sur petit écran
  menu.addEventListener("click", (evenement) => {
    if (evenement.target.closest("a") && petitEcran.matches) {
      ouvrirMenu(false);
    }
  });

  // Échap referme le menu et rend le focus au bouton
  document.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Escape" && boutonMenu.getAttribute("aria-expanded") === "true") {
      ouvrirMenu(false);
      boutonMenu.focus();
    }
  });
}

/* ---------- Validation du formulaire ----------
   Un confort pour la personne, jamais une sécurité : le serveur revalide. */
const formulaire = document.querySelector(".formulaire");

const messages = {
  nom: {
    valueMissing: "Indiquez votre prénom et votre nom.",
  },
  courriel: {
    valueMissing: "Indiquez votre adresse électronique.",
    typeMismatch: "L'adresse doit ressembler à nom@exemple.fr.",
  },
  profil: {
    valueMissing: "Choisissez votre profil.",
  },
  cgu: {
    valueMissing: "Vous devez accepter les conditions pour continuer.",
  },
};

function verifierChamp(champ) {
  const zoneErreur = document.querySelector(`#erreur-${champ.id}`);
  const etat = champ.validity;
  let message = "";

  if (!etat.valid) {
    const messagesDuChamp = messages[champ.id] || {};
    const cle = Object.keys(messagesDuChamp).find((nom) => etat[nom]);
    message = cle ? messagesDuChamp[cle] : champ.validationMessage;
  }

  champ.setAttribute("aria-invalid", String(!etat.valid));
  if (zoneErreur) {
    zoneErreur.textContent = message;
  }
  return etat.valid;
}

if (formulaire) {
  const champs = formulaire.querySelectorAll("input, select");
  const confirmation = formulaire.querySelector(".formulaire__confirmation");

  // Le JavaScript prend le relais des bulles du navigateur pour des messages en français
  formulaire.noValidate = true;

  // On ne signale une erreur qu'après que la personne a quitté le champ
  champs.forEach((champ) => {
    champ.addEventListener("blur", () => verifierChamp(champ));
    champ.addEventListener("input", () => {
      if (champ.getAttribute("aria-invalid") === "true") {
        verifierChamp(champ);
      }
    });
  });

  formulaire.addEventListener("submit", (evenement) => {
    evenement.preventDefault();
    confirmation.hidden = true;

    const invalides = [...champs].filter((champ) => !verifierChamp(champ));

    if (invalides.length > 0) {
      invalides[0].focus();
      return;
    }

    // Pas de back-end dans ce module : on simule l'envoi
    const prenom = formulaire.nom.value.trim().split(" ")[0];
    confirmation.textContent = `Merci ${prenom}, votre compte est créé. Un courriel de confirmation vient de partir.`;
    confirmation.hidden = false;
    formulaire.reset();
    champs.forEach((champ) => champ.removeAttribute("aria-invalid"));
  });
}

/* ---------- Année du pied de page ---------- */
const annee = document.querySelector(".annee");
if (annee) {
  annee.textContent = new Date().getFullYear();
}
