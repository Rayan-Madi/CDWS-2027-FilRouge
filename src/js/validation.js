/* Validation des formulaires, au fil de la saisie.
   Un confort pour la personne, jamais une sécurité : le serveur revalide.
   L'ordre : la validation native d'abord (checkValidity), puis nos règles par-dessus. */

export const MESSAGES = {
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

// Nos règles bouchent deux trous du navigateur : required accepte un nom fait d'espaces,
// et type="email" accepte « a@b » (une adresse sans domaine valable). Chaque règle rend "" si tout va bien.
const REGLES = {
  nom: (valeur) => (valeur.trim().length < 2 ? MESSAGES.nom.valueMissing : ""),
  courriel: (valeur) => (/^[^@\s]+@[^@\s]+\.[^@\s.]{2,}$/.test(valeur.trim()) ? "" : MESSAGES.courriel.typeMismatch),
};

// Le message d'un champ invalide : le nôtre s'il existe, sinon celui du navigateur
function messageDe(champ) {
  if (champ.validity.customError) {
    return champ.validationMessage; // posé par setCustomValidity : c'est déjà notre texte
  }
  const messagesDuChamp = MESSAGES[champ.name] || {};
  const cle = Object.keys(messagesDuChamp).find((nom) => champ.validity[nom]);
  return cle ? messagesDuChamp[cle] : champ.validationMessage;
}

// La zone d'erreur est celle que le champ désigne par aria-describedby : le lien du code est le lien
// annoncé au lecteur d'écran, il ne peut pas y en avoir deux.
function zoneErreurDe(champ) {
  const ids = (champ.getAttribute("aria-describedby") || "").split(" ");
  return ids.map((id) => document.getElementById(id)).find((zone) => zone && zone.classList.contains("champ__erreur"));
}

export function brancherValidation(formulaire) {
  const champs = [...formulaire.querySelectorAll("input, select, textarea")].filter((champ) => champ.name);
  const enErreur = new Set(); // l'état : les champs dont l'erreur est affichée (on ne relit pas aria-invalid)

  // Le JavaScript prend le relais des bulles du navigateur, pour des messages en français
  formulaire.noValidate = true;

  function verifierChamp(champ) {
    champ.setCustomValidity(""); // 1. on repart de la validation native…
    if (champ.checkValidity()) {
      // 2. … et seulement si elle passe, nos règles
      const regle = REGLES[champ.name];
      champ.setCustomValidity(regle ? regle(champ.value) : "");
    }
    const valide = champ.validity.valid;
    champ.setAttribute("aria-invalid", String(!valide));
    const zone = zoneErreurDe(champ);
    if (zone) {
      zone.textContent = valide ? "" : messageDe(champ); // à côté du champ, relié par aria-describedby
    }
    if (valide) enErreur.delete(champ);
    else enErreur.add(champ);
    return valide;
  }

  // Aider, pas punir : l'erreur apparaît quand on quitte le champ, puis se met à jour à chaque frappe
  // tant qu'elle est affichée, et disparaît dès que la saisie devient valide.
  // focusout et non blur : blur ne remonte pas, focusout si — un écouteur sur le formulaire suffit.
  formulaire.addEventListener("focusout", (evenement) => {
    if (champs.includes(evenement.target)) {
      verifierChamp(evenement.target);
    }
  });
  formulaire.addEventListener("input", (evenement) => {
    if (enErreur.has(evenement.target)) {
      verifierChamp(evenement.target);
    }
  });

  return {
    // Vrai si tout est valide ; sinon le focus va au premier champ fautif
    toutVerifier() {
      const invalides = champs.filter((champ) => !verifierChamp(champ));
      if (invalides.length > 0) {
        invalides[0].focus();
        return false;
      }
      return true;
    },
    effacer() {
      champs.forEach((champ) => {
        champ.setCustomValidity("");
        champ.removeAttribute("aria-invalid");
        const zone = zoneErreurDe(champ);
        if (zone) zone.textContent = "";
      });
      enErreur.clear();
    },
  };
}
