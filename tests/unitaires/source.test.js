// TP 2, point 5 : aucun any, et rien qui fasse taire le compilateur.
// TypeScript 7 n'offre pas encore son analyseur en JavaScript : on découpe le code nous-mêmes, sans ses
// commentaires, ses chaînes ni le texte de ses gabarits (où « any » ou « ! » sont du français), mais
// en gardant le code des ${…}, gabarits imbriqués compris.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const dossierTs = path.join(racine, "src/ts");
const dossierJs = path.join(racine, "src/js");
const sources = fs.readdirSync(dossierTs).filter((f) => f.endsWith(".ts"));

/** Le code seul : commentaires, chaînes et texte des gabarits remplacés par des blancs (les lignes restent à leur place). */
function codeSeul(texte) {
  const blanc = (morceau) => morceau.replace(/[^\n]/g, " ");
  let sortie = "";
  let i = 0;
  let mode = "code"; // "code" ou "gabarit"
  let profondeur = 0; // accolades ouvertes dans le code
  const finsDExpression = []; // pour chaque ${ ouvert : la profondeur où sa } le referme

  // Une barre oblique ouvre une expression régulière si le code qui précède attend une valeur
  const attendUneValeur = () =>
    /(^|[=(,:!&|?;{}[+\-*%<>~^]|\b(?:return|typeof|else|of|in|case|do|await|yield|throw|void|delete|new))\s*$/.test(sortie);

  while (i < texte.length) {
    const c = texte[i];
    const reste = texte.slice(i);

    if (mode === "gabarit") {
      if (c === "\\") {
        sortie += blanc(texte.slice(i, i + 2));
        i += 2;
      } else if (c === "`") {
        sortie += " ";
        i += 1;
        mode = "code";
      } else if (reste.startsWith("${")) {
        sortie += "  ";
        i += 2;
        finsDExpression.push(profondeur);
        mode = "code";
      } else {
        sortie += blanc(c);
        i += 1;
      }
      continue;
    }

    const commentaire = /^\/\/[^\n]*/.exec(reste) || /^\/\*[\s\S]*?\*\//.exec(reste);
    const chaine = /^"(?:\\.|[^"\\\n])*"/.exec(reste) || /^'(?:\\.|[^'\\\n])*'/.exec(reste);
    const regex = c === "/" && attendUneValeur() ? /^\/(?![/*])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[a-z]*/.exec(reste) : null;
    const morceau = commentaire || chaine || regex;
    if (morceau) {
      sortie += blanc(morceau[0]);
      i += morceau[0].length;
    } else if (c === "`") {
      sortie += " ";
      i += 1;
      mode = "gabarit";
    } else if (c === "}" && finsDExpression.length > 0 && finsDExpression.at(-1) === profondeur) {
      finsDExpression.pop(); // fin d'un ${…} : retour dans le texte du gabarit
      sortie += " ";
      i += 1;
      mode = "gabarit";
    } else {
      if (c === "{") profondeur += 1;
      if (c === "}") profondeur -= 1;
      sortie += c;
      i += 1;
    }
  }
  // Une désynchronisation (gabarit jamais refermé) masquerait la suite du fichier : elle doit se voir
  if (mode !== "code" || finsDExpression.length > 0) throw new Error("codeSeul : gabarit non refermé, découpage désynchronisé");
  return sortie;
}

// Les mots après lesquels vient une valeur : « return !ok » n'est pas une assertion, « return <T>x » en est une
const MOT_AVANT_VALEUR = /\b(?:return|typeof|else|of|in|case|do|await|yield|throw|void|delete|new)$/;

/** « x! » : un « ! » collé (ou non) à ce qui le précède, si ce qui précède est une valeur et que ce n'est pas « != ». */
function nonNullite(ligne) {
  for (const m of ligne.matchAll(/!(?!=)/g)) {
    const avant = ligne.slice(0, m.index).trimEnd();
    if (/[)\]]$/.test(avant)) return true;
    const mot = /[\w$]+$/.exec(avant)?.[0];
    if (mot !== undefined && !MOT_AVANT_VALEUR.test(avant)) return true;
  }
  return false;
}

/** « <T>valeur » : des chevrons suivis d'une valeur, là où l'on attend une valeur (pas après un nom : f<T>(x), Map<K, V>). */
function assertionChevrons(ligne) {
  for (const m of ligne.matchAll(/<[A-Za-z_$][\w$.]*(?:<[^<>]*>)?(?:\[\])*>\s*[\w$(\["'!+\-]/g)) {
    const avant = ligne.slice(0, m.index).trimEnd();
    if (avant === "" || /=>$/.test(avant) || MOT_AVANT_VALEUR.test(avant) || !/[\w$.)\]>]$/.test(avant)) return true;
  }
  return false;
}

const INTERDITS = [
  [(l) => /(?<![.\w$])any\b/.test(l), "any"], // et non AbortSignal.any, qui est une méthode
  [(l) => /(?<![.\w$])as\b(?!\s*const\b)/.test(l), "assertion de type « as » (elle ne vérifie rien)"],
  [nonNullite, "assertion de non-nullité « ! »"],
  [assertionChevrons, "assertion de type <T>valeur"],
];

// Les « as » des imports et exports renommés (import { a as b }, import * as ns) ne sont pas des assertions :
// on efface ces spécificateurs, et seulement eux (import.meta, import(…) restent analysés)
function sansSpecificateurs(code) {
  const blanc = (morceau) => morceau.replace(/[^\n]/g, " ");
  return code
    .replace(/\b(?:import|export)\s+(?:type\s+)?\{[^}]*\}/g, blanc)
    .replace(/\b(?:import|export)\s+\*\s+as\s+[\w$]+/g, blanc);
}

function fautesDe(texte) {
  const fautes = [];
  texte.split("\n").forEach((ligne, n) => {
    if (/@ts-(?:ignore|expect-error|nocheck)/.test(ligne)) fautes.push(`${n + 1} directive @ts-…`);
  });
  sansSpecificateurs(codeSeul(texte))
    .split("\n")
    .forEach((ligne, n) => {
      for (const [regle, nom] of INTERDITS) {
        if (regle(ligne)) fautes.push(`${n + 1} ${nom} : ${ligne.trim()}`);
      }
    });
  return fautes;
}

test("le code TypeScript n'a ni any, ni as, ni !, ni @ts-ignore", () => {
  assert.ok(sources.length >= 10, "les sources sont bien lues");
  const fautes = sources.flatMap((fichier) => fautesDe(fs.readFileSync(path.join(dossierTs, fichier), "utf8")).map((f) => `${fichier}:${f}`));
  assert.deepEqual(fautes, []);
});

test("le filet attrape bien ce qu'il doit attraper", () => {
  const essais = [
    "let x: any = 1;",
    "const y = z as HTMLInputElement;",
    'const n = v as "debutant";',
    "const m = v as 1;",
    "el!.focus();",
    "fn(a!);",
    "const t = <Foo>bar;",
    "const s = `${(x as any).y}`;",
    "const s = `${el!.value}`;",
    "let el!: HTMLElement;",
    "class A { champ!: string }",
    "const t = [b!];",
    "const o = { c: d! };",
    "const n = el! + 1;",
    "const v = m.get(k)!",
    "const s = `a ${`b ${c as any}`} d`;",
    "// @ts-ignore",
    "const f = (e: Event) => <HTMLElement>e.target;",
    "const l = brutes.map((e) => <Atelier>e);",
    "const v = await <Promise<void>>x;",
    "const t = [<T>x];",
    "const o = { a: <T>x };",
    "const b = !<T>x;",
    "return <T>x;",
    "const y = x as",
    "const u = import.meta.url as any;",
    "el !.focus();",
  ];
  for (const essai of essais) assert.ok(fautesDe(essai).length > 0, `non détecté : ${essai}`);

  // Le gabarit imbriqué de catalogue.ts ne doit pas désynchroniser la suite
  const imbrique = "console.error(`a (${p.raison}${p.statut ? ` ${p.statut}` : \"\"}).`, p);\nconst x = y as any;\nel!.focus();";
  assert.equal(fautesDe(imbrique).length, 3, "les deux lignes après le gabarit sont analysées");
});

test("le filet ne crie pas à tort", () => {
  const permis = [
    'const s = "Jonny !";',
    "if (a !== b) {}",
    "if (a!==b) {}",
    "const c = [1] as const;",
    "// any est un mot anglais, as aussi !",
    "if (!ok) return;",
    "x = /a!b/.test(s);",
    "x = /[`'\"]/.test(s);",
    "AbortSignal.any([a, b]);",
    'import { a as b } from "./x.js";',
    'import * as ns from "./x.js";',
    "export { a as b };",
    "const m = new Map<string, Regle>();",
    "function f<T extends Element>(x: T): T { return x; }",
    "const p: Promise<void> = attendre();",
    "const s = `Merci ${prenom} !`;",
    "return !ok;",
    "if (typeof x !== \"string\") return;",
    "const r = a < b && c > d;",
    "const t: ReturnType<typeof setTimeout> = x;",
    "const u = new URL(\"a\", import.meta.url);",
    "else !fini && relancer();",
  ];
  for (const essai of permis) assert.deepEqual(fautesDe(essai), [], `faux positif : ${essai}`);
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
