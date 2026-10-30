import { useEffect, useEffectEvent, useRef } from "react";
import { Link, Outlet, useLocation, useNavigationType } from "react-router";
import { CHEMINS } from "../router/chemins";
import { IconeLogo } from "./icones";
import { Navigation } from "./Navigation";

// Calculée une fois, hors du rendu : un composant doit rester une fonction pure
const ANNEE = new Date().getFullYear();

/**
 * Le layout de toutes les vues : il vit au-dessus de l'Outlet et n'est jamais remonté.
 * Il répare ce qu'une navigation sans rechargement perd (diapo 36) : le défilement et le focus.
 * Le titre de l'onglet, lui, est posé par TitreDeVue dans chaque vue.
 */
export function Layout() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  const cheminPrecedent = useRef(pathname);
  const contenu = useRef<HTMLElement>(null);

  // useEffectEvent : lit le type de navigation du moment SANS en faire une dépendance. En dépendance,
  // chaque filtre du catalogue (navigation « REPLACE », même chemin) relancerait l'effet.
  const apresNavigation = useEffectEvent(() => {
    // Au premier chargement, le focus reste en tête de document, comme pour une page classique.
    // On compare au chemin précédent plutôt qu'avec un drapeau « premier rendu » : StrictMode rejoue
    // l'effet au montage, et le drapeau ferait croire à une navigation.
    if (cheminPrecedent.current === pathname) return;
    cheminPrecedent.current = pathname;
    // Au retour arrière, le navigateur restaure lui-même la position : on n'y touche pas
    if (type !== "POP") window.scrollTo(0, 0);
    // Le focus sur le h1 de la nouvelle vue : le lecteur d'écran annonce la page où l'on arrive
    contenu.current?.querySelector<HTMLElement>("[data-titre-de-vue]")?.focus({ preventScroll: true });
  });

  // Seulement quand le CHEMIN change : un filtre du catalogue (même chemin) ne bouge rien
  useEffect(() => {
    apresNavigation();
  }, [pathname]);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      {/* Le lien d'évitement porte le focus sur <main> sans ajouter #contenu à l'adresse */}
      <a
        href="#contenu"
        onClick={(e) => {
          e.preventDefault();
          contenu.current?.focus();
        }}
        className="absolute -top-16 left-4 z-20 rounded-m border-2 border-accent bg-fond px-4 py-2 focus:top-4"
      >
        Aller au contenu
      </a>
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bordure bg-white/95 px-4 py-3 md:px-8 lg:px-[max(2rem,calc((100%-72rem)/2))]">
        <Link to={CHEMINS.accueil} className="inline-flex items-center gap-2 text-m font-semibold text-texte no-underline">
          <IconeLogo />
          SkillHub
        </Link>
        <Navigation />
      </header>
      <main id="contenu" ref={contenu} tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <footer className="bg-texte px-4 py-8 text-center text-pied-texte">
        <ul role="list" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <li><Link to={CHEMINS.ateliers} className="inline-block py-2 text-white focus-visible:outline-white">Ateliers</Link></li>
          <li><Link to={CHEMINS.formateurs} className="inline-block py-2 text-white focus-visible:outline-white">Formateurs</Link></li>
          <li><Link to={CHEMINS.inscription} className="inline-block py-2 text-white focus-visible:outline-white">S'inscrire</Link></li>
        </ul>
        <p className="mt-4">SkillHub · IMIE Paris · projet pédagogique · {ANNEE}</p>
      </footer>
    </div>
  );
}
