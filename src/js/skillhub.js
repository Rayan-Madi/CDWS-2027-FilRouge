/* SkillHub — JavaScript natif, chargé en defer.
   Amélioration progressive : sans ce fichier, la page reste complète
   (menu visible, liens « Réserver » vers le formulaire, validation par le navigateur). */

/* ---------- Menu mobile ---------- */
const boutonMenu = document.querySelector(".menu-bouton");
const menu = document.querySelector("#menu");
const petitEcran = window.matchMedia("(max-width: 47.99em)");

// L'état annoncé (aria-expanded) et l'état réel changent dans la MÊME fonction :
// séparés, ils finissent par diverger et l'attribut ment.
function ouvrirMenu(ouvert) {
  boutonMenu.setAttribute("aria-expanded", String(ouvert)); // une chaîne, pas un booléen
  menu.toggleAttribute("data-ferme", !ouvert);
}

function menuOuvert() {
  return boutonMenu.getAttribute("aria-expanded") === "true"; // "false" est une chaîne vraie
}

if (boutonMenu && menu) {
  ouvrirMenu(false);

  boutonMenu.addEventListener("click", () => {
    ouvrirMenu(!menuOuvert());
  });

  // Un lien choisi referme le menu sur petit écran
  menu.addEventListener("click", (evenement) => {
    if (evenement.target.closest("a") && petitEcran.matches) {
      ouvrirMenu(false);
    }
  });

  // Échap referme le menu ET rend le focus au bouton : sinon on est perdu au clavier
  document.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Escape" && menuOuvert()) {
      ouvrirMenu(false);
      boutonMenu.focus();
    }
  });

  // Un clic en dehors de l'en-tête referme aussi
  document.addEventListener("click", (evenement) => {
    if (menuOuvert() && !evenement.target.closest(".entete")) {
      ouvrirMenu(false);
    }
  });
}

/* ---------- Validation des formulaires ----------
   Un confort pour la personne, jamais une sécurité : le serveur revalide. */
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

// Le message s'écrit dans la zone reliée au champ par aria-describedby,
// et aria-invalid dit au lecteur d'écran que le champ est en erreur.
function verifierChamp(champ) {
  const zoneErreur = document.querySelector(`#erreur-${champ.id}`);
  const etat = champ.validity;
  let message = "";

  if (!etat.valid) {
    const messagesDuChamp = messages[champ.name] || {};
    const cle = Object.keys(messagesDuChamp).find((nom) => etat[nom]);
    message = cle ? messagesDuChamp[cle] : champ.validationMessage;
  }

  champ.setAttribute("aria-invalid", String(!etat.valid));
  if (zoneErreur) {
    zoneErreur.textContent = message;
  }
  return etat.valid;
}

// Aider au fil de la saisie, pas punir : l'erreur apparaît quand on quitte le champ,
// puis disparaît dès que la saisie devient valide.
function brancherValidation(formulaire) {
  const champs = [...formulaire.querySelectorAll("input, select")];

  // Le JavaScript prend le relais des bulles du navigateur, pour des messages en français
  formulaire.noValidate = true;

  champs.forEach((champ) => {
    champ.addEventListener("blur", () => verifierChamp(champ));
    champ.addEventListener("input", () => {
      if (champ.getAttribute("aria-invalid") === "true") {
        verifierChamp(champ);
      }
    });
  });

  // Renvoie vrai si tout est valide ; sinon place le focus sur le premier champ fautif
  return function toutVerifier() {
    const invalides = champs.filter((champ) => !verifierChamp(champ));
    if (invalides.length > 0) {
      invalides[0].focus();
      return false;
    }
    return true;
  };
}

function effacerErreurs(formulaire) {
  formulaire.querySelectorAll("[aria-invalid]").forEach((champ) => champ.removeAttribute("aria-invalid"));
  formulaire.querySelectorAll(".champ__erreur").forEach((zone) => (zone.textContent = ""));
}

// Le bouton passe à « … en cours » et se désactive : pas de double envoi,
// et la personne voit que sa demande est prise (heuristique 1 de Nielsen).
function envoiEnCours(bouton, enCours, libelleEnCours) {
  if (enCours) {
    bouton.dataset.libelle = bouton.textContent;
    bouton.textContent = libelleEnCours;
  } else if (bouton.dataset.libelle) {
    bouton.textContent = bouton.dataset.libelle;
  }
  bouton.disabled = enCours;
}

// Pas de back-end dans ce projet : on simule le délai de réponse du serveur
const DELAI_SIMULE = 800;

/* ---------- Formulaire « Créer mon compte » ---------- */
const formInscription = document.querySelector("#form-inscription");

if (formInscription) {
  const toutVerifier = brancherValidation(formInscription);
  const bouton = formInscription.querySelector("button[type=submit]");
  const confirmation = formInscription.querySelector(".formulaire__confirmation");

  formInscription.addEventListener("submit", (evenement) => {
    evenement.preventDefault();
    confirmation.hidden = true;

    if (bouton.disabled || !toutVerifier()) {
      return;
    }

    envoiEnCours(bouton, true, "Création en cours…");

    setTimeout(() => {
      const prenom = formInscription.nom.value.trim().split(" ")[0];
      confirmation.textContent = `Merci ${prenom}, votre compte est prêt. Choisissez maintenant un atelier ci-dessus et touchez « Réserver ».`;
      confirmation.hidden = false;
      formInscription.reset();
      effacerErreurs(formInscription);
      envoiEnCours(bouton, false);
    }, DELAI_SIMULE);
  });
}

/* ---------- Modale de réservation ---------- */
const modale = document.querySelector("#modale-reservation");
const formReservation = document.querySelector("#form-reservation");
let declencheur = null;

if (modale && formReservation && typeof modale.showModal === "function") {
  const toutVerifier = brancherValidation(formReservation);
  const titreAtelier = modale.querySelector(".modale__atelier");
  const recap = modale.querySelector(".modale__recap");
  const zonesSaisie = formReservation.querySelectorAll(".champ, .modale__actions");
  const boutonReserver = formReservation.querySelector("button[value=reserver]");
  const confirmation = formReservation.querySelector(".formulaire__confirmation");
  const fin = formReservation.querySelector(".modale__fin");

  function ouvrirModale(atelier) {
    // L'atelier choisi est repris dans la modale : on n'a pas à s'en souvenir (heuristique 6)
    titreAtelier.textContent = atelier.querySelector("h3").textContent;
    recap.textContent = `${atelier.querySelector(".atelier__infos").textContent} · ${atelier.querySelector(".atelier__prix").textContent}`;

    formReservation.reset();
    effacerErreurs(formReservation);
    zonesSaisie.forEach((zone) => (zone.hidden = false));
    confirmation.hidden = true;
    fin.hidden = true;
    envoiEnCours(boutonReserver, false);

    // showModal() et non show() : le focus entre dans la modale, Échap ferme,
    // et le reste de la page devient inerte, gratuitement.
    modale.showModal();
  }

  // Sans JavaScript, « Réserver » est un lien vers le formulaire.
  // Avec, il devient un vrai bouton qui ouvre la modale.
  document.querySelectorAll("a[data-reserver]").forEach((lien) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = lien.className;
    bouton.innerHTML = lien.innerHTML;
    bouton.addEventListener("click", () => {
      declencheur = bouton;
      ouvrirModale(bouton.closest(".atelier"));
    });
    lien.replaceWith(bouton);
  });

  formReservation.addEventListener("submit", (evenement) => {
    const action = evenement.submitter?.value;
    if (action === "annuler" || action === "fermer") {
      return; // method="dialog" : ces deux boutons ferment la modale, sans validation
    }

    evenement.preventDefault(); // retient la modale ouverte tant que ce n'est pas valide
    if (boutonReserver.disabled || !toutVerifier()) {
      return;
    }

    envoiEnCours(boutonReserver, true, "Réservation en cours…");

    setTimeout(() => {
      const prenom = formReservation.nom.value.trim().split(" ")[0];
      zonesSaisie.forEach((zone) => (zone.hidden = true));
      confirmation.textContent = `C'est réservé, ${prenom} ! Vous recevrez le lien de l'atelier à ${formReservation.courriel.value.trim()} la veille.`;
      confirmation.hidden = false;
      fin.hidden = false;
      fin.querySelector("button").focus(); // le focus ne reste pas sur un bouton devenu caché
    }, DELAI_SIMULE);
  });

  // La seule chose que <dialog> ne garantit pas partout : rendre le focus au déclencheur.
  // L'événement close part quelle que soit la façon de fermer (bouton, Échap, fond).
  modale.addEventListener("close", () => {
    if (declencheur) {
      declencheur.focus();
    }
  });

  // Un clic sur le fond sombre ferme : la cible est alors le <dialog> lui-même,
  // car tout le contenu est dans .modale__contenu et le dialog n'a pas de marge interne.
  modale.addEventListener("click", (evenement) => {
    if (evenement.target === modale) {
      modale.close();
    }
  });
}

/* ---------- Année du pied de page ---------- */
const annee = document.querySelector(".annee");
if (annee) {
  annee.textContent = new Date().getFullYear();
}
