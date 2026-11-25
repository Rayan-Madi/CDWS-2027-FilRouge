"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCompte } from "../contexts/Compte";
import { CHEMINS } from "../utils/chemins";
import { LienAction } from "./Action";
import { TitreDeVue } from "./TitreDeVue";

/**
 * Le second garde, côté client. proxy.ts a vu le cookie, mais le compte vit dans la mémoire de l'onglet :
 * après un rechargement, le cookie reste et le compte non. On renvoie alors vers l'inscription, comme le
 * faisait ExigeConnexion. Et sur les pages formateur, un apprenant lit pourquoi il ne passe pas.
 */
export function GardeEspace({ children }: { children: ReactNode }) {
  const { utilisateur } = useCompte();
  const chemin = usePathname();
  const routeur = useRouter();

  // Un effet, et non un rendu : on se synchronise avec le routeur, système extérieur au composant
  useEffect(() => {
    if (!utilisateur) routeur.replace(`${CHEMINS.inscription}?${new URLSearchParams({ depuis: chemin }).toString()}`);
  }, [utilisateur, chemin, routeur]);

  if (!utilisateur) return null;
  const pageFormateur = chemin === CHEMINS.mesAteliers || chemin === CHEMINS.creerAtelier;
  if (pageFormateur && utilisateur.profil !== "formateur") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <TitreDeVue>Réservé aux formateurs</TitreDeVue>
        <p>Cette page sert à proposer des ateliers. Votre compte est un compte apprenant : vos inscriptions vous attendent dans votre espace.</p>
        <p className="mt-6">
          <LienAction href={CHEMINS.monEspace}>Retour à mon espace</LienAction>
        </p>
      </div>
    );
  }
  return children;
}
