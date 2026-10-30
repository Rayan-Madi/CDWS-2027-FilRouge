// Les jetons de FM02 (le :root de src/css/skillhub.css), devenus le thème de Tailwind.
// Mêmes noms, mêmes hexadécimaux, ratios mesurés en commentaire : la charte ne change pas
// parce que le framework change. Branché par @config dans src/index.css.
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        texte: "#12293f", //        sur fond : 14,84:1 · sur fond-teinte : 13,45:1
        "texte-doux": "#44566b", // sur fond : 7,52:1 · sur fond-teinte : 6,82:1
        fond: "#ffffff",
        "fond-teinte": "#f1f4f8",
        accent: "#0b5cad", //       sur fond : 6,66:1 · blanc dessus : 6,66:1
        "accent-fonce": "#084784", // blanc dessus : 9,35:1
        "accent-clair": "#e3eefa",
        erreur: "#b3261e", //       sur fond : 6,53:1
        succes: "#1d6b3a", //       sur succes-fond : 5,74:1
        "succes-fond": "#e6f4ea",
        "pied-texte": "#dbe4ee", // sur texte : 11,55:1
        bordure: "#cbd5e1", //      1,48:1 : bordure décorative seulement, jamais un champ
      },
      lineHeight: { texte: "1.5", titre: "1.2" },
      boxShadow: {
        1: "0 1rem 1.5rem -1rem rgba(18, 41, 63, 0.35)",
        2: "0 1.5rem 3rem -1.25rem rgba(18, 41, 63, 0.5)",
      },
      fontFamily: { sans: ['"Sora"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"] },
      maxWidth: { page: "72rem" },
    },
    // Hors de extend : l'échelle de rapport 1,25 REMPLACE celle de Tailwind (dans extend, text-xl
    // garderait son interligne et les noms se mélangeraient). Le pas d'espacement n'est pas redéclaré :
    // celui de Tailwind (0,25rem) EST le pas de 4 px de FM02, p-4 = 1rem.
    fontSize: {
      xs: "0.875rem",
      s: "1rem",
      m: "1.25rem",
      l: "1.563rem",
      xl: "1.953rem",
      "2xl": "2.441rem",
      "3xl": "3.052rem",
    },
    borderRadius: { none: "0", s: "0.5rem", m: "0.75rem", full: "9999px" },
  },
};
