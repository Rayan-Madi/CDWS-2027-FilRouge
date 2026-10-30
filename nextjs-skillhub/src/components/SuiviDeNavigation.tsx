"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Ce qui reste du Layout de Vite : le focus. Next.js défile tout seul et annonce la page ; il ne déplace
 * pas le focus. On le porte sur le h1 quand le CHEMIN change (pas au premier affichage, pas pour un filtre).
 */
export function SuiviDeNavigation() {
  const chemin = usePathname();
  const precedent = useRef(chemin);

  useEffect(() => {
    // Comparé au chemin précédent, pas à un drapeau « premier rendu » : StrictMode rejoue l'effet au montage
    if (precedent.current === chemin) return;
    precedent.current = chemin;
    document.querySelector<HTMLElement>("main [data-titre-de-vue]")?.focus({ preventScroll: true });
  }, [chemin]);

  return null;
}
