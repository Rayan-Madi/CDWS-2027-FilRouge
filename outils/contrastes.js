// Mesure des contrastes de SkillHub — formule WCAG 2.2 (cours FM02, slide 43). Lancer : node outils/contrastes.js
const canal = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const W = [0.2126, 0.7152, 0.0722];
const lum = (hex) => [0, 2, 4].reduce((s, i, k) => s + W[k] * canal(parseInt(hex.slice(i, i + 2), 16)), 0);
const r = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
const paires = [
  ["--texte sur --fond", "12293F", "FFFFFF", "texte"],
  ["--texte sur --fond-teinte", "12293F", "F1F4F8", "texte"],
  ["--texte-doux sur --fond", "44566B", "FFFFFF", "texte"],
  ["--texte-doux sur --fond-teinte", "44566B", "F1F4F8", "texte"],
  ["--accent (liens) sur --fond", "0B5CAD", "FFFFFF", "texte"],
  ["--accent (liens) sur --fond-teinte", "0B5CAD", "F1F4F8", "texte"],
  ["blanc sur --accent (boutons)", "FFFFFF", "0B5CAD", "texte"],
  ["blanc sur --accent-fonce (survol)", "FFFFFF", "084784", "texte"],
  ["--accent-fonce sur --accent-clair (étiquettes)", "084784", "E3EEFA", "texte"],
  ["--erreur sur --fond", "B3261E", "FFFFFF", "texte"],
  ["--succes sur fond vert", "1D6B3A", "E6F4EA", "texte"],
  ["pied : #DBE4EE sur --texte", "DBE4EE", "12293F", "texte"],
  ["pied : liens blancs sur --texte", "FFFFFF", "12293F", "texte"],
  ["bordure de champ (--texte-doux) sur --fond", "44566B", "FFFFFF", "composant"],
  ["focus (--accent) sur --fond", "0B5CAD", "FFFFFF", "composant"],
  ["focus (--accent) sur --fond-teinte", "0B5CAD", "F1F4F8", "composant"],
  ["focus blanc (pied) sur --texte", "FFFFFF", "12293F", "composant"],
  ["bordure de carte (--bordure) sur --fond", "CBD5E1", "FFFFFF", "décor"],
];
for (const [nom, a, b, type] of paires) {
  const v = r(a, b), seuil = type === "texte" ? 4.5 : 3;
  const verdict = type === "décor" ? "décoratif, sans seuil" : v >= seuil ? (type==="texte" && v>=7 ? "✓ AAA" : "✓ AA") : "✗ ÉCHEC";
  console.log(`${nom.padEnd(48)} ${(Math.floor(v*100)/100).toFixed(2).padStart(6)}:1  ${verdict}`);
}
