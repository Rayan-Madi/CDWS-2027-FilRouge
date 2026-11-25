"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent as EvenementSouris } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../utils/chemins";
import { IconeChevron, IconeMenu } from "./icones";

const RACCOURCIS = [
  { texte: "Tout le catalogue", vers: CHEMINS.ateliers },
  { texte: "Pour débutants", vers: `${CHEMINS.ateliers}?niveau=debutant` },
  { texte: "Le soir", vers: `${CHEMINS.ateliers}?soir=oui` },
];

// aria-current="page" sur le lien de la page actuelle ; le style suit l'attribut : souligné ET gras, pas la couleur seule
const LIEN =
  "block rounded-s px-2 py-3 text-texte no-underline hover:bg-accent-clair aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[0.3em]";

/** Le NavLink de React Router n'existe pas en Next.js : usePathname, et aria-current posé à la main. */
function LienNav({ href, exact = false, className = LIEN, children }: { href: string; exact?: boolean; className?: string; children: string }) {
  const chemin = usePathname();
  const actuel = exact ? chemin === href : chemin === href || chemin.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={actuel ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}

/** Le menu de FM03 en React : un état, deux panneaux, et Échap qui rend le focus au bon bouton. */
export function Navigation() {
  const { utilisateur } = useCompte();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [sousMenuOuvert, setSousMenuOuvert] = useState(false);
  const boutonMenu = useRef<HTMLButtonElement>(null);
  const boutonSousMenu = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  // Un clic hors de la navigation referme tout ; l'écouteur n'existe que tant qu'un panneau est ouvert
  useEffect(() => {
    if (!menuOuvert && !sousMenuOuvert) return;
    const surClic = (evenement: MouseEvent) => {
      if (evenement.target instanceof Node && !nav.current?.contains(evenement.target)) {
        setMenuOuvert(false);
        setSousMenuOuvert(false);
      }
    };
    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, [menuOuvert, sousMenuOuvert]);

  // Échap ferme d'abord le sous-menu, puis le menu, et rend le focus au bouton qui les a ouverts
  function surTouche(evenement: KeyboardEvent) {
    if (evenement.key !== "Escape") return;
    if (sousMenuOuvert) {
      setSousMenuOuvert(false);
      boutonSousMenu.current?.focus();
    } else if (menuOuvert) {
      setMenuOuvert(false);
      boutonMenu.current?.focus();
    }
  }

  // Un lien suivi referme tout : un seul écouteur délégué sur la nav, comme en FM03 (closest remonte de l'icône au lien)
  function surClic(evenement: EvenementSouris) {
    if (evenement.target instanceof Element && evenement.target.closest("a")) {
      setMenuOuvert(false);
      setSousMenuOuvert(false);
    }
  }

  // Le focus qui sort de la navigation referme tout (relatedTarget null : on quitte la fenêtre, on ne touche à rien)
  function surSortie(evenement: FocusEvent) {
    const vers = evenement.relatedTarget;
    if (vers instanceof Node && !nav.current?.contains(vers)) {
      setMenuOuvert(false);
      setSousMenuOuvert(false);
    }
  }

  return (
    <nav ref={nav} aria-label="Navigation principale" onClick={surClic} onKeyDown={surTouche} onBlur={surSortie} className="md:flex md:items-center">
      <button
        ref={boutonMenu}
        type="button"
        aria-expanded={menuOuvert}
        aria-controls="menu"
        onClick={() => setMenuOuvert((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 rounded-m border border-bordure px-4 py-2 md:hidden"
      >
        <IconeMenu />
        Menu
      </button>
      {/* Sous 48rem, la liste est un panneau sous l'en-tête ; au-dessus, toujours visible, en ligne */}
      <ul
        id="menu"
        role="list"
        className={`${menuOuvert ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 border-b border-bordure bg-fond px-4 pb-4 pt-2 shadow-1 md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:p-0 md:shadow-none`}
      >
        <li>
          <LienNav href={CHEMINS.accueil} exact>
            Accueil
          </LienNav>
        </li>
        <li className="relative flex flex-wrap items-center md:flex-nowrap">
          <LienNav href={CHEMINS.ateliers} className={`${LIEN} flex-1`}>
            Ateliers
          </LienNav>
          <button
            ref={boutonSousMenu}
            type="button"
            aria-expanded={sousMenuOuvert}
            aria-controls="sous-menu-ateliers"
            onClick={() => setSousMenuOuvert((o) => !o)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-s hover:bg-accent-clair md:min-w-7"
          >
            <IconeChevron ouvert={sousMenuOuvert} />
            <span className="sr-only">Raccourcis vers les ateliers</span>
          </button>
          <ul
            id="sous-menu-ateliers"
            role="list"
            className={`${sousMenuOuvert ? "block" : "hidden"} ml-4 basis-full border-l-2 border-bordure pl-2 md:absolute md:left-0 md:top-full md:z-10 md:ml-0 md:mt-1 md:min-w-56 md:rounded-m md:border md:bg-fond md:p-2 md:shadow-1`}
          >
            {RACCOURCIS.map((r) => (
              <li key={r.vers}>
                {/* Link et non LienNav : les trois seraient marqués « page actuelle » */}
                <Link href={r.vers} className={LIEN}>
                  {r.texte}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <LienNav href={CHEMINS.formateurs}>Formateurs</LienNav>
        </li>
        <li>
          {utilisateur ? (
            <LienNav href={CHEMINS.monEspace} className={`${LIEN} md:border-2 md:border-accent md:px-4`}>
              Mon espace
            </LienNav>
          ) : (
            <LienNav href={CHEMINS.inscription} className={`${LIEN} md:border-2 md:border-accent md:px-4`}>
              S'inscrire
            </LienNav>
          )}
        </li>
      </ul>
    </nav>
  );
}
