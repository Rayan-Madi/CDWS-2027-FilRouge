/** Les adresses de l'application, en un seul endroit : les liens et les routes lisent les mêmes. */
export const CHEMINS = {
  accueil: "/",
  ateliers: "/ateliers",
  atelier: (id: string) => `/ateliers/${encodeURIComponent(id)}`,
  formateurs: "/formateurs",
  inscription: "/inscription",
  monEspace: "/mon-espace",
} as const;
