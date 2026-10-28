/* Le catalogue d'ateliers : un composant sans framework (cours, 4.1).
   Trois choses à lui : un ÉTAT, une fonction de RENDU, des ÉCOUTEURS délégués sur sa racine.
   Il reçoit sa section en argument et prévient par un rappel ; il ne sait rien de la modale. */
import type { Atelier } from "./types.js";
import { trouver, elementCible } from "./dom.js";
import { chargerAteliers, ErreurChargement, type OptionsChargement } from "./api.js";
import { CRITERES_PAR_DEFAUT, MESSAGE_VIDE, decrireResultat, estNiveau, estTri, filtrerAteliers, type Criteres } from "./filtre.js";
import { carteAtelier, carteFantome } from "./carte.js";
import { attendreLaFin } from "./attendre-la-fin.js";

/** Où en est le chargement. Une union : un catalogue « prêt » a forcément ses ateliers, une « erreur » sa panne. */
type Chargement =
  | { readonly statut: "en-cours" }
  | { readonly statut: "erreur"; readonly erreur: ErreurChargement }
  | { readonly statut: "pret"; readonly ateliers: readonly Atelier[] };

interface EtatCatalogue {
  readonly chargement: Chargement;
  readonly criteres: Criteres;
}

/** Les quatre écrans que toute requête impose (cours, 5.5). */
type Ecran =
  | { readonly nom: "chargement" }
  | { readonly nom: "erreur"; readonly erreur: ErreurChargement }
  | { readonly nom: "vide" }
  | { readonly nom: "succes"; readonly ateliers: readonly Atelier[] };

/** L'écran se DÉDUIT de l'état : il n'est stocké nulle part, il ne peut donc pas le contredire. */
function ecranDe(etat: EtatCatalogue): Ecran {
  switch (etat.chargement.statut) {
    case "en-cours":
      return { nom: "chargement" };
    case "erreur":
      return { nom: "erreur", erreur: etat.chargement.erreur };
    case "pret": {
      const visibles = filtrerAteliers(etat.chargement.ateliers, etat.criteres);
      return visibles.length > 0 ? { nom: "succes", ateliers: visibles } : { nom: "vide" };
    }
  }
}

/** Ce qui s'est passé, en une phrase et sans code HTTP : le numéro va dans la console (cours, 5.4). */
export function messageErreur(erreur: ErreurChargement): string {
  switch (erreur.raison) {
    case "reseau":
      return "La connexion semble coupée. Vérifiez votre réseau, puis réessayez.";
    case "delai":
      return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
    case "format":
      return "Les données reçues sont illisibles. Réessayez dans un instant ; si cela continue, revenez plus tard.";
    case "http":
      if (erreur.statut === 404) return "Le catalogue est introuvable pour le moment. Réessayez dans un instant.";
      if (erreur.statut !== undefined && erreur.statut >= 500) return "Le serveur rencontre un problème. Réessayez dans un instant.";
      return "Le serveur a refusé la demande. Réessayez dans un instant.";
  }
}

const RACCOURCIS: Readonly<Record<string, Criteres>> = {
  tous: CRITERES_PAR_DEFAUT,
  debutant: { ...CRITERES_PAR_DEFAUT, niveau: "debutant" },
  soir: { ...CRITERES_PAR_DEFAUT, soir: true },
};

export interface RappelsCatalogue {
  /** La personne a choisi « Réserver » sur une carte. */
  surReserver: (atelier: Atelier) => void;
}

/** Ce que le catalogue permet depuis l'extérieur : sa frontière, et rien d'autre. */
export interface Catalogue {
  /** Un raccourci du sous-menu : « tous », « debutant » ou « soir ». */
  appliquerRaccourci(raccourci: string): void;
  /** Une réservation a abouti : une place de moins (et « Complet » à zéro). */
  retirerUnePlace(id: string): void;
  /** Rend le focus à la carte de l'atelier : à son bouton, ou à son titre s'il est devenu complet. */
  rendreLeFocus(id: string): void;
}

export function monterCatalogue(section: HTMLElement, rappels: RappelsCatalogue, options: OptionsChargement = {}): Catalogue {
  const titre = trouver(section, "h2", HTMLHeadingElement);
  const filtres = trouver(section, ".filtres", HTMLFormElement);
  const champRecherche = trouver(filtres, "#recherche", HTMLInputElement);
  const choixNiveau = trouver(filtres, "#niveau", HTMLSelectElement);
  const choixTri = trouver(filtres, "#tri", HTMLSelectElement);
  const caseSoir = trouver(filtres, "#soir", HTMLInputElement);
  const statut = trouver(section, ".catalogue__statut", HTMLElement);
  const zoneErreur = trouver(section, ".catalogue__erreur", HTMLElement);
  const liste = trouver(section, ".ateliers", HTMLUListElement);
  const vide = trouver(section, ".ateliers__vide", HTMLElement);

  // UN état, à un seul endroit
  let etat: EtatCatalogue = { chargement: { statut: "en-cours" }, criteres: CRITERES_PAR_DEFAUT };
  // La requête en vol. Aujourd'hui une seule part à la fois (« Réessayer » n'existe qu'après une panne),
  // mais si l'on relançait pendant qu'elle vole — une recherche côté serveur, cours 5.6 —, l'ancienne
  // serait annulée et ne reviendrait pas écraser la nouvelle.
  let arret: AbortController | null = null;

  // UNE fonction de rendu : l'écran est toujours le reflet de l'état
  function rendre(): void {
    const { criteres } = etat;
    // Les commandes suivent l'état (un raccourci du menu les change aussi). Sauf le champ de recherche
    // pendant qu'on y tape : il a 300 ms d'avance sur l'état (l'anti-rebond), et le réécrire effacerait
    // la frappe — par exemple quand le catalogue finit de charger au milieu d'un mot.
    if (document.activeElement !== champRecherche && champRecherche.value !== criteres.recherche) {
      champRecherche.value = criteres.recherche;
    }
    choixNiveau.value = criteres.niveau;
    choixTri.value = criteres.tri;
    caseSoir.checked = criteres.soir;

    const ecran = ecranDe(etat);
    liste.setAttribute("aria-busy", String(ecran.nom === "chargement")); // la zone est en cours de mise à jour
    vide.hidden = ecran.nom !== "vide";
    if (ecran.nom !== "erreur") zoneErreur.replaceChildren();

    switch (ecran.nom) {
      case "chargement":
        statut.textContent = "Chargement des ateliers…";
        liste.replaceChildren(carteFantome(), carteFantome(), carteFantome()); // la place est réservée AVANT
        return;
      case "erreur":
        statut.textContent = "";
        liste.replaceChildren();
        // Insérée à l'ENTRÉE dans l'erreur seulement : un filtre changé pendant la panne ne doit pas la
        // faire réannoncer (une alerte interrompt). « Réessayer » passe par le chargement, qui la vide.
        if (!zoneErreur.hasChildNodes()) zoneErreur.replaceChildren(boiteErreur(ecran.erreur));
        return;
      case "vide":
        statut.textContent = MESSAGE_VIDE; // polie : un résultat vide n'est pas une panne
        liste.replaceChildren();
        return;
      case "succes":
        statut.textContent = decrireResultat(ecran.ateliers.length, criteres);
        liste.replaceChildren(...ecran.ateliers.map(carteAtelier)); // tout d'un coup : un seul recalcul
        return;
      default: {
        // Un écran ajouté au type sans être traité ici ne compile pas : l'écran blanc devient impossible
        const oublie: never = ecran;
        throw new Error(`Écran non traité : ${JSON.stringify(oublie)}`);
      }
    }
  }

  // Inséré à neuf à chaque panne : un role="alert" qui apparaît est annoncé tout de suite (il interrompt)
  function boiteErreur(erreur: ErreurChargement): HTMLElement {
    const boite = document.createElement("div");
    boite.className = "catalogue__panne";
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    const debut = document.createElement("strong");
    debut.textContent = "Impossible de charger les ateliers.";
    message.append(debut, ` ${messageErreur(erreur)}`);
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "action action--secondaire";
    bouton.dataset.reessayer = "";
    bouton.textContent = "Réessayer";
    boite.append(message, bouton);
    return boite;
  }

  // UN point d'entrée pour changer l'état, et jamais ailleurs : un NOUVEL objet, puis le rendu
  function majEtat(changement: Partial<EtatCatalogue>): void {
    etat = { ...etat, ...changement };
    rendre();
  }

  const majCriteres = (changement: Partial<Criteres>): void => majEtat({ criteres: { ...etat.criteres, ...changement } });

  async function charger(): Promise<void> {
    arret?.abort(); // une requête encore en vol ne reviendra pas écraser la suivante (voir plus haut)
    const controleur = new AbortController();
    arret = controleur;
    majEtat({ chargement: { statut: "en-cours" } }); // AVANT la requête, jamais après
    try {
      const ateliers = await chargerAteliers(controleur.signal, options);
      majEtat({ chargement: { statut: "pret", ateliers } });
    } catch (erreur) {
      if (controleur.signal.aborted) return; // AbortError : une annulation n'est pas une panne
      const panne = erreur instanceof ErreurChargement ? erreur : new ErreurChargement("format", String(erreur), { cause: erreur });
      console.error(`SkillHub : catalogue non chargé (${panne.raison}${panne.statut ? ` ${panne.statut}` : ""}).`, panne);
      majEtat({ chargement: { statut: "erreur", erreur: panne } }); // l'indicateur part dans la sortie « rompue » aussi
    } finally {
      if (arret === controleur) arret = null;
    }
  }

  // La recherche attend la fin de la frappe ; les autres commandes s'appliquent tout de suite
  const rechercher = attendreLaFin((recherche: string) => majCriteres({ recherche }), 300);

  filtres.addEventListener("input", (evenement) => {
    if (evenement.target === champRecherche) rechercher(champRecherche.value);
  });

  filtres.addEventListener("change", (evenement) => {
    const cible = evenement.target;
    const niveau = choixNiveau.value;
    const tri = choixTri.value;
    // Une frappe encore en attente part AVEC ce changement : un seul rendu, une seule annonce, rien de perdu
    const avecLaRecherche = (changement: Partial<Criteres>): void => {
      rechercher.annuler();
      majCriteres({ ...changement, recherche: champRecherche.value });
    };
    // Une valeur du HTML n'est pas une valeur du type : on la vérifie avant de la ranger dans l'état
    if (cible === choixNiveau && (niveau === "tous" || estNiveau(niveau))) {
      avecLaRecherche({ niveau });
    } else if (cible === choixTri && estTri(tri)) {
      avecLaRecherche({ tri });
    } else if (cible === caseSoir) {
      avecLaRecherche({ soir: caseSoir.checked });
    }
  });

  // Entrée dans la recherche : on applique tout de suite, et on ne recharge surtout pas la page
  filtres.addEventListener("submit", (evenement) => {
    evenement.preventDefault();
    rechercher.maintenant(champRecherche.value);
  });

  // UN écouteur pour la section : les boutons « Réserver » des cartes (présentes et futures),
  // « Réessayer » et « Tout afficher »
  section.addEventListener("click", (evenement) => {
    const bouton = elementCible(evenement)?.closest("button");
    if (!bouton || !section.contains(bouton)) return;

    if (bouton.dataset.reessayer !== undefined) {
      titre.focus(); // le bouton va disparaître : le focus ne doit pas partir dans le vide
      void charger();
    } else if (bouton.dataset.toutAfficher !== undefined) {
      rechercher.annuler();
      majEtat({ criteres: CRITERES_PAR_DEFAUT });
      champRecherche.focus(); // on repart de la première commande du filtre
    } else if (bouton.dataset.reserver !== undefined && etat.chargement.statut === "pret") {
      const id = bouton.dataset.reserver;
      const atelier = etat.chargement.ateliers.find((a) => a.id === id);
      if (atelier) rappels.surReserver(atelier);
    }
  });

  filtres.hidden = false;
  void charger();

  return {
    appliquerRaccourci(raccourci) {
      const criteres = RACCOURCIS[raccourci];
      if (criteres && Object.hasOwn(RACCOURCIS, raccourci)) {
        rechercher.annuler();
        majEtat({ criteres });
      }
    },

    retirerUnePlace(id) {
      if (etat.chargement.statut !== "pret") return;
      const ateliers = etat.chargement.ateliers.map((a) => (a.id === id ? { ...a, places: Math.max(0, a.places - 1) } : a));
      majEtat({ chargement: { statut: "pret", ateliers } });
    },

    rendreLeFocus(id) {
      // La carte a pu être reconstruite pendant que la modale était ouverte : on la retrouve par son identifiant
      const carte = [...liste.children].find((li) => li instanceof HTMLElement && li.dataset.id === id);
      const bouton = carte?.querySelector("button");
      const titreCarte = carte?.querySelector("h3");
      if (bouton instanceof HTMLButtonElement && !bouton.disabled) {
        bouton.focus();
      } else if (titreCarte instanceof HTMLElement) {
        titreCarte.focus(); // devenu complet : son bouton est inerte, on se pose sur son titre
      } else {
        titre.focus(); // la carte n'est plus affichée : on revient au titre du catalogue
      }
    },
  };
}
