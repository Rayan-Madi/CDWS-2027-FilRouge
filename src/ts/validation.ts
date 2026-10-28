/* Validation des formulaires, au fil de la saisie.
   Un confort pour la personne, jamais une sécurité : le serveur revalide.
   L'ordre : la validation native d'abord (checkValidity), puis nos règles par-dessus. */
import { trouverTous } from "./dom.js";

type Champ = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Les drapeaux de ValidityState qui ont un message, dans l'ordre où on les teste. */
type Defaut = "valueMissing" | "typeMismatch" | "patternMismatch" | "tooShort" | "tooLong" | "badInput";
const DEFAUTS: readonly Defaut[] = ["valueMissing", "typeMismatch", "patternMismatch", "tooShort", "tooLong", "badInput"];

/** Une règle rend le message d'erreur, ou "" si la valeur est bonne. */
type Regle = (valeur: string) => string;

const MESSAGE_NOM = "Indiquez votre prénom et votre nom.";
const MESSAGE_COURRIEL = "L'adresse doit ressembler à nom@exemple.fr.";

// Des Map et non des objets : MESSAGES[nom] sur un objet trouve aussi « constructor » ou « valueOf »,
// hérités de Object.prototype — un champ nommé ainsi serait toujours invalide, ou ferait planter la validation.
const MESSAGES = new Map<string, Partial<Record<Defaut, string>>>([
  ["nom", { valueMissing: MESSAGE_NOM }],
  ["courriel", { valueMissing: "Indiquez votre adresse électronique.", typeMismatch: MESSAGE_COURRIEL }],
  ["profil", { valueMissing: "Choisissez votre profil." }],
  ["cgu", { valueMissing: "Vous devez accepter les conditions pour continuer." }],
]);

// Nos règles bouchent deux trous du navigateur : required accepte un nom fait d'espaces,
// et type="email" accepte « a@b » (une adresse sans domaine valable).
const REGLES = new Map<string, Regle>([
  ["nom", (valeur) => (valeur.trim().length < 2 ? MESSAGE_NOM : "")],
  ["courriel", (valeur) => (/^[^@\s]+@[^@\s]+\.[^@\s.]{2,}$/.test(valeur.trim()) ? "" : MESSAGE_COURRIEL)],
]);

function estChamp(element: Element): element is Champ {
  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;
}

// Le message d'un champ invalide : le nôtre s'il existe, sinon celui du navigateur
function messageDe(champ: Champ): string {
  if (champ.validity.customError) {
    return champ.validationMessage; // posé par setCustomValidity : c'est déjà notre texte
  }
  const messages = MESSAGES.get(champ.name);
  const defaut = DEFAUTS.find((d) => champ.validity[d] && messages?.[d] !== undefined);
  return (defaut && messages?.[defaut]) || champ.validationMessage;
}

// La zone d'erreur est celle que le champ désigne par aria-describedby : le lien du code est le lien
// annoncé au lecteur d'écran, il ne peut pas y en avoir deux.
function zoneErreurDe(champ: Champ): HTMLElement | undefined {
  const ids = (champ.getAttribute("aria-describedby") ?? "").split(/\s+/);
  return ids
    .map((id) => document.getElementById(id))
    .find((zone): zone is HTMLElement => zone instanceof HTMLElement && zone.classList.contains("champ__erreur"));
}

export interface Validation {
  /** Vrai si tout est valide ; sinon le focus va au premier champ fautif. */
  toutVerifier(): boolean;
  /** Retire toutes les erreurs affichées (après un envoi réussi, ou à l'ouverture de la modale). */
  effacer(): void;
}

export function brancherValidation(formulaire: HTMLFormElement): Validation {
  const champs = trouverTous(formulaire, "input, select, textarea", Element).filter(estChamp).filter((champ) => champ.name);
  const zones = new Map(champs.map((champ): [Champ, HTMLElement | undefined] => [champ, zoneErreurDe(champ)]));
  const enErreur = new Set<Champ>(); // l'état : les champs dont l'erreur est affichée (on ne relit pas aria-invalid)

  // Le JavaScript prend le relais des bulles du navigateur, pour des messages en français
  formulaire.noValidate = true;

  function verifierChamp(champ: Champ): boolean {
    champ.setCustomValidity(""); // 1. on repart de la validation native…
    if (champ.checkValidity()) {
      // 2. … et seulement si elle passe, nos règles
      champ.setCustomValidity(REGLES.get(champ.name)?.(champ.value) ?? "");
    }
    const valide = champ.validity.valid;
    champ.setAttribute("aria-invalid", String(!valide));
    const zone = zones.get(champ);
    if (zone) {
      zone.textContent = valide ? "" : messageDe(champ); // à côté du champ, relié par aria-describedby
    }
    if (valide) enErreur.delete(champ);
    else enErreur.add(champ);
    return valide;
  }

  // Le champ visé par un événement, s'il fait partie des nôtres
  const champDe = (evenement: Event): Champ | undefined => champs.find((champ) => champ === evenement.target);

  // Aider, pas punir : l'erreur apparaît quand on quitte le champ, puis se met à jour à chaque frappe
  // tant qu'elle est affichée, et disparaît dès que la saisie devient valide.
  // focusout et non blur : blur ne remonte pas, focusout si — un écouteur sur le formulaire suffit.
  formulaire.addEventListener("focusout", (evenement) => {
    // Le focus part vers « Annuler » (formnovalidate) : on abandonne, on ne valide pas. Sinon le message
    // qui apparaît pousserait le bouton sous le pointeur, et le clic serait perdu.
    const vers = evenement.relatedTarget;
    if (vers instanceof HTMLButtonElement && vers.formNoValidate) return;
    const champ = champDe(evenement);
    if (champ) verifierChamp(champ);
  });
  formulaire.addEventListener("input", (evenement) => {
    const champ = champDe(evenement);
    if (champ && enErreur.has(champ)) verifierChamp(champ);
  });

  return {
    toutVerifier() {
      const invalides = champs.filter((champ) => !verifierChamp(champ));
      invalides[0]?.focus(); // le premier champ fautif, s'il y en a un
      return invalides.length === 0;
    },
    effacer() {
      for (const champ of champs) {
        champ.setCustomValidity("");
        champ.removeAttribute("aria-invalid");
        const zone = zones.get(champ);
        if (zone) zone.textContent = "";
      }
      enErreur.clear();
    },
  };
}
