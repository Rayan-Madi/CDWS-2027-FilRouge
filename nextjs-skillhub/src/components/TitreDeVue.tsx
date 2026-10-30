/**
 * Le h1 de chaque page. En Next.js, il ne garde que son rôle de cible du focus : metadata pose le titre
 * de l'onglet, et Next.js gère le défilement et annonce la page. tabIndex={-1} : focalisable par le code
 * (SuiviDeNavigation y porte le focus après une navigation), absent de l'ordre de tabulation.
 * Sans état ni effet : c'est un composant SERVEUR, il ne part pas dans le JavaScript du navigateur.
 */
export function TitreDeVue({ children, id }: { children: string; id?: string }) {
  return (
    <h1 id={id} tabIndex={-1} data-titre-de-vue className="mb-4 text-[clamp(1.953rem,5vw+0.5rem,3.052rem)] leading-titre font-semibold focus:outline-none">
      {children}
    </h1>
  );
}
