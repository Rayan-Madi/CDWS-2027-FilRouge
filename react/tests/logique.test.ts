// La logique pure : les règles du formulaire, et les critères lus et écrits dans l'URL.
import { describe, expect, test } from "vitest";
import { ecrireCriteres, lireCriteres } from "../src/hooks/useCriteres";
import { CRITERES_PAR_DEFAUT } from "../src/utils/filtre";
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
