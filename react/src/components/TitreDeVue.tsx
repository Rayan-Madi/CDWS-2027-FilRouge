import { useEffect } from "react";

/**
 * Le h1 de chaque vue, et le titre de l'onglet : une navigation sans rechargement ne les change plus
 * d'elle-même (diapo 36). tabIndex={-1} : focalisable par le code (Layout y porte le focus après une
 * navigation), absent de l'ordre de tabulation.
 */
export function TitreDeVue({ children, titreOnglet, id }: { children: string; titreOnglet?: string | undefined; id?: string }) {
  const onglet = titreOnglet ?? `${children} · SkillHub`;
  useEffect(() => {
    document.title = onglet;
  }, [onglet]);

  return (
    <h1 id={id} tabIndex={-1} data-titre-de-vue className="mb-4 text-[clamp(1.953rem,5vw+0.5rem,3.052rem)] leading-titre font-semibold focus:outline-none">
      {children}
    </h1>
  );
}
