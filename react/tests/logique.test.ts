// La logique pure : les règles des deux formulaires, et les critères lus et écrits dans l'URL.
import { describe, expect, test } from "vitest";
import { ecrireCriteres, lireCriteres } from "../src/hooks/useCriteres";
import { CRITERES_PAR_DEFAUT } from "../src/utils/filtre";
import { erreursAtelier, versAtelier } from "../src/utils/atelier";
import { erreursDe, VALEURS_VIDES } from "../src/utils/validation";

describe("validation de l'inscription", () => {
  test("tout vide : un message par champ, dans l'ordre du formulaire", () => {
    expect(Object.values(erreursDe(VALEURS_VIDES))).toEqual([
      "Indiquez votre prénom et votre nom.",
      "Indiquez votre adresse électronique.",
      "Choisissez votre profil.",
      "Vous devez accepter les conditions pour continuer.",
    ]);
  });

  test("les deux trous du navigateur restent bouchés : un nom d'espaces, et « a@b »", () => {
    const erreurs = erreursDe({ nom: "   ", courriel: "a@b", profil: "apprenant", cgu: true });
    expect(erreurs.nom).toBe("Indiquez votre prénom et votre nom.");
    expect(erreurs.courriel).toBe("L'adresse doit ressembler à nom@exemple.fr.");
    expect(erreursDe({ nom: "Jonny Martin", courriel: "jonny@exemple.fr", profil: "apprenant", cgu: true })).toEqual({});
  });
});

describe("les critères dans l'URL", () => {
  test("lecture : absent ou inconnu vaut la valeur par défaut", () => {
    expect(lireCriteres(new URLSearchParams(""))).toEqual(CRITERES_PAR_DEFAUT);
    expect(lireCriteres(new URLSearchParams("niveau=expert&tri=nimporte"))).toEqual(CRITERES_PAR_DEFAUT);
    expect(lireCriteres(new URLSearchParams("recherche=git&niveau=debutant&soir=oui&tri=prix-croissant"))).toEqual({
      recherche: "git",
      niveau: "debutant",
      soir: true,
      tri: "prix-croissant",
    });
  });

  test("écriture : seules les valeurs qui diffèrent du défaut apparaissent", () => {
    expect(ecrireCriteres(CRITERES_PAR_DEFAUT).toString()).toBe("");
    expect(ecrireCriteres({ ...CRITERES_PAR_DEFAUT, niveau: "avance", soir: true }).toString()).toBe("niveau=avance&soir=oui");
  });
});

describe("validation d'un atelier (côté formateur)", () => {
  const bon = {
    titre: "Docker sans douleur",
    description: "Construire, lancer et partager ses premiers conteneurs.",
    categorie: "Développement",
    niveau: "intermediaire",
    date: "2027-03-10T18:30",
    duree: "180",
    lieu: "En ligne",
    places: "8",
    prix: "30",
    prerequis: "",
  } as const;

  test("un atelier complet ne reçoit aucun message", () => {
    expect(erreursAtelier(bon)).toEqual({});
  });

  test("date passée, neuf places, prix négatif : trois refus qui disent quoi faire", () => {
    const erreurs = erreursAtelier({ ...bon, date: "2020-01-01T10:00", places: "9", prix: "-5" });
    expect(erreurs.date).toBe("Choisissez une date à venir.");
    expect(erreurs.places).toBe("Entre 1 et 8 places : les groupes restent petits.");
    expect(erreurs.prix).toBe("Indiquez un prix en euros, sans centimes (0 pour un atelier gratuit).");
  });

  test("versAtelier : un identifiant lisible, une date ISO avec son décalage, des nombres", () => {
    const atelier = versAtelier(bon, "Aïcha N'Diaye");
    expect(atelier.id).toBe("docker-sans-douleur-2027-03-10");
    expect(atelier.date).toMatch(/^2027-03-10T18:30:00[+-]\d\d:\d\d$/);
    expect(atelier).toMatchObject({ niveau: "intermediaire", duree: 180, places: 8, prix: 30, formateur: "Aïcha N'Diaye", prerequis: "Aucun." });
  });
});
