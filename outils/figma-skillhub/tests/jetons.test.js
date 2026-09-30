// Les jetons du plugin sont ceux de la feuille de style, et leurs ratios ceux du rapport de contrastes.
// Lancer : npm test (dans outils/figma-skillhub)
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JETONS, MESURES, hexDe, ratioContraste, formaterRatio, descriptionCouleur } = require("../code.js");

const racine = path.join(__dirname, "..", "..", "..");
const css = fs.readFileSync(path.join(racine, "src/css/skillhub.css"), "utf8");
const contrastes = fs.readFileSync(path.join(racine, "docs/fm02-contrastes.md"), "utf8");

// Le premier :root de la feuille : celui des jetons (le second, dans une media query, ne change que --espace)
function variablesDuRoot() {
  const bloc = css.match(/:root\s*\{([\s\S]*?)\}/)[1].replace(/\/\*[\s\S]*?\*\//g, "");
  const variables = {};
  for (const [, nom, valeur] of bloc.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    variables[nom] = valeur.trim();
  }
  return variables;
}

const enPixels = (valeur) => (valeur.endsWith("rem") ? parseFloat(valeur) * 16 : parseFloat(valeur));

test("chaque couleur du plugin est celle du CSS", () => {
  const css = variablesDuRoot();
  for (const [nom, hex] of Object.entries(JETONS.couleurs)) {
    assert.equal(hex.toLowerCase(), (css[nom] || "").toLowerCase(), `--${nom}`);
  }
});

test("chaque couleur du CSS existe dans le plugin", () => {
  const couleursCss = Object.entries(variablesDuRoot()).filter(([, v]) => v.startsWith("#"));
  for (const [nom] of couleursCss) {
    assert.ok(nom in JETONS.couleurs, `--${nom} manque dans JETONS.couleurs`);
  }
});

test("tailles, espacements et formes valent les rem du CSS, en pixels", () => {
  const css = variablesDuRoot();
  for (const groupe of ["typo", "espace", "forme"]) {
    for (const [nom, px] of Object.entries(JETONS[groupe])) {
      assert.ok(css[nom], `--${nom} absent du CSS`);
      assert.ok(Math.abs(px - enPixels(css[nom])) < 0.01, `--${nom} : ${px} au lieu de ${enPixels(css[nom])}`);
    }
  }
});

test("chaque ratio recalculé est celui du rapport de contrastes", () => {
  for (const { libelle, avant, sur } of MESURES) {
    const ligne = `| ${libelle} | ${formaterRatio(ratioContraste(hexDe(avant), hexDe(sur)))}:1 |`;
    assert.ok(contrastes.includes(ligne), `ligne absente de fm02-contrastes.md : ${ligne}`);
  }
});

test("la description d'une couleur donne ses ratios", () => {
  const description = descriptionCouleur("accent");
  assert.match(description, /6,66:1/);
  assert.match(description, /6,04:1/);
});

test("le code tourne dans le bac à sable de Figma : ni ?. ni ?? ni décomposition d'objet", () => {
  const code = fs
    .readFileSync(path.join(__dirname, "..", "code.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(code, /\?\.|\?\?/);
  assert.doesNotMatch(code, /\{\s*\.\.\./);
});
