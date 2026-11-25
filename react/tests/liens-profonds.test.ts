// Les liens profonds sur GitHub Pages (TP 3, point 6). Pages ne sait pas que /react/mon-espace est une
// route de l'application : il sert le 404.html de la racine du site. Deux petits scripts réparent ça, et
// ce test les fait tourner dans un bac à sable : celui du 404.html renvoie vers l'application en gardant
// le chemin dans la requête, celui de react/index.html remet l'adresse d'origine avant que React la lise.
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, test, vi } from "vitest";

const SITE = "https://rayan-madi.github.io";
const lire = (chemin: string): string => readFileSync(new URL(chemin, import.meta.url), "utf8");
const page404 = lire("../../404.html");
const pageApplication = lire("../index.html");

/** Le script en ligne (sans attribut) d'une page : c'est lui qui s'exécute avant tout le reste. */
function scriptEnLigne(html: string): string {
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (script === undefined) throw new Error("la page n'a pas de script en ligne");
  return script;
}

/** Ce que fait le 404.html pour une adresse : l'adresse vers laquelle il renvoie, ou null. */
function redirection404(adresse: string): string | null {
  const url = new URL(adresse, SITE);
  const replace = vi.fn<(cible: string) => void>();
  const location = { protocol: url.protocol, host: url.host, pathname: url.pathname, search: url.search, hash: url.hash, replace };
  runInNewContext(scriptEnLigne(page404), { window: { location } });
  return replace.mock.calls[0]?.[0] ?? null;
}

/** Ce que fait le script de react/index.html sur l'adresse reçue : l'adresse remise, ou null s'il n'y touche pas. */
function adresseRestauree(adresse: string): string | null {
  const url = new URL(adresse, SITE);
  const replaceState = vi.fn<(etat: unknown, titre: unknown, cible: string) => void>();
  const location = { pathname: url.pathname, search: url.search, hash: url.hash };
  runInNewContext(scriptEnLigne(pageApplication), { window: { location, history: { replaceState } } });
  return replaceState.mock.calls[0]?.[2] ?? null;
}

describe("le 404.html de la racine du site", () => {
  test("une adresse de l'application repart vers elle, le chemin passé dans la requête", () => {
    expect(redirection404("/CDWS-2027-FilRouge/react/ateliers/git-initiation")).toBe(
      `${SITE}/CDWS-2027-FilRouge/react/?/ateliers/git-initiation`,
    );
  });

  test("la requête et l'ancre suivent ; leurs & deviennent ~and~ pour ne pas se mêler au chemin", () => {
    expect(redirection404("/CDWS-2027-FilRouge/react/ateliers?niveau=debutant&soir=oui#x")).toBe(
      `${SITE}/CDWS-2027-FilRouge/react/?/ateliers&niveau=debutant~and~soir=oui#x`,
    );
  });

  test("ailleurs dans le site, aucune redirection : la page dit simplement « introuvable »", () => {
    expect(redirection404("/CDWS-2027-FilRouge/docs/absent.html")).toBeNull();
    expect(page404).toContain("<h1>Page introuvable</h1>");
  });

  test("déjà redirigé, parce que l'application manque : il s'arrête au lieu de boucler", () => {
    expect(redirection404("/CDWS-2027-FilRouge/react/?/mon-espace")).toBeNull();
  });
});

describe("react/index.html remet l'adresse d'origine", () => {
  test("avant React : le script en ligne précède le module de l'application", () => {
    expect(pageApplication.indexOf("<script>")).toBeGreaterThan(-1);
    expect(pageApplication.indexOf("<script>")).toBeLessThan(pageApplication.indexOf('<script type="module"'));
  });

  test("aller-retour : après le détour par le 404.html, l'adresse est celle qu'on avait demandée", () => {
    const adresses = [
      "/CDWS-2027-FilRouge/react/mon-espace",
      "/CDWS-2027-FilRouge/react/ateliers/git-initiation",
      "/CDWS-2027-FilRouge/react/ateliers?niveau=debutant&soir=oui#x",
    ];
    for (const adresse of adresses) {
      const detour = redirection404(adresse);
      if (detour === null) throw new Error(`aucun détour pour ${adresse}`);
      expect(adresseRestauree(detour)).toBe(adresse);
    }
  });

  test("une adresse ordinaire n'est pas touchée", () => {
    expect(adresseRestauree("/CDWS-2027-FilRouge/react/ateliers?niveau=debutant")).toBeNull();
  });
});
