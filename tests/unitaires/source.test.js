// TP 2, point 5 : aucun any, et rien qui fasse taire le compilateur.
// On lit le code sans ses commentaires ni ses chaînes (où « any » ou « ! » sont du français).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const dossierTs = path.join(racine, "src/ts");
const dossierJs = path.join(racine, "src/js");
const sources = fs.readdirSync(dossierTs).filter((f) => f.endsWith(".ts"));

/** Le code seul : commentaires, chaînes et gabarits remplacés par des blancs (les lignes restent à leur place). */
function codeSeul(texte) {
  let sortie = "";
  let i = 0;
  const blanc = (morceau) => morceau.replace(/[^\n]/g, " ");
  while (i < texte.length) {
    const reste = texte.slice(i);
    const motif =
      /^\/\/[^\n]*/.exec(reste) ||
      /^\/\*[\s\S]*?\*\//.exec(reste) ||
      /^"(?:\\.|[^"\\\n])*"/.exec(reste) ||
      /^'(?:\\.|[^'\\\n])*'/.exec(reste) ||
      /^`(?:\\.|\$\{[^}]*\}|[^`\\])*`/.exec(reste) ||
      // une expression régulière littérale, après un opérateur ou une parenthèse
      (/[=(,:!&|?;{}\n]\s*$/.test(sortie) || sortie.trim() === "" ? /^\/(?![/*])(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n])+\/[a-z]*/.exec(reste) : null);
    if (motif) {
      sortie += blanc(motif[0]);
      i += motif[0].length;
    } else {
      sortie += texte[i];
      i += 1;
    }
  }
  return sortie;
}

const INTERDITS = [
  [/(?<![.\w])any\b/, "any"], // et non AbortSignal.any, qui est une méthode
  [/@ts-(?:ignore|expect-error|nocheck)/, "directive qui fait taire le compilateur"],
  [/\bas\s+(?!const\b)[A-Za-z_{[(]/, "assertion de type « as » (elle ne vérifie rien)"],
  [/[\w)\]]!(?=\s*[.[;,)])/, "assertion de non-nullité « ! »"],
  [/<[A-Z]\w*>\s*\w/, "assertion de type <T>valeur"],
];

test("le code TypeScript n'a ni any, ni as, ni !, ni @ts-ignore", () => {
  assert.ok(sources.length >= 10, "les sources sont bien lues");
  const fautes = [];
  for (const fichier of sources) {
    const brut = fs.readFileSync(path.join(dossierTs, fichier), "utf8");
    const directives = brut.split("\n"); // les directives vivent dans des commentaires : on les cherche dans le brut
    directives.forEach((ligne, n) => {
      if (/@ts-(?:ignore|expect-error|nocheck)/.test(ligne)) fautes.push(`${fichier}:${n + 1} directive @ts-…`);
    });
    codeSeul(brut)
      .split("\n")
      .forEach((ligne, n) => {
        for (const [motif, nom] of INTERDITS) {
          if (motif.test(ligne)) fautes.push(`${fichier}:${n + 1} ${nom} : ${ligne.trim()}`);
        }
      });
  }
  assert.deepEqual(fautes, []);
});

test("le filet attrape bien ce qu'il doit attraper", () => {
  const essais = ["let x: any = 1;", "const y = z as HTMLInputElement;", "el!.focus();", "fn(a!);", "const t = <Foo>bar;"];
  for (const essai of essais) {
    const ligne = codeSeul(essai);
    assert.ok(INTERDITS.some(([motif]) => motif.test(ligne)), `non détecté : ${essai}`);
  }
  const permis = ['const s = "Jonny !";', "if (a !== b) {}", "const c = [1] as const;", "// any est un mot anglais", "if (!ok) return;", "x = /a!b/.test(s);", "AbortSignal.any([a, b]);"];
  for (const essai of permis) {
    const ligne = codeSeul(essai);
    assert.ok(!INTERDITS.some(([motif]) => motif.test(ligne)), `faux positif : ${essai}`);
  }
});

test("chaque source a son JavaScript compilé, et aucun JavaScript n'est orphelin", () => {
  const compiles = fs.readdirSync(dossierJs).filter((f) => f.endsWith(".js"));
  const attendus = sources.map((f) => f.replace(/\.ts$/, ".js"));
  assert.deepEqual(compiles.sort(), attendus.sort(), "lancez npm run build");
  for (const f of attendus) {
    assert.ok(fs.existsSync(path.join(dossierJs, `${f}.map`)), `carte de sources manquante : ${f}.map`);
  }
});

test("les imports relatifs finissent par .js, sinon le navigateur ne trouve pas le fichier", () => {
  for (const fichier of fs.readdirSync(dossierJs).filter((f) => f.endsWith(".js"))) {
    const js = fs.readFileSync(path.join(dossierJs, fichier), "utf8");
    for (const [, cible] of js.matchAll(/\bfrom\s+"(\.[^"]+)"/g)) {
      assert.ok(cible.endsWith(".js"), `${fichier} importe ${cible}`);
      assert.ok(fs.existsSync(path.join(dossierJs, cible)), `${fichier} importe ${cible}, introuvable`);
    }
  }
});
