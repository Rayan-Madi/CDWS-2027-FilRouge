"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Atelier } from "../types";
import { LienAction } from "./Action";
import { ListeAteliers } from "./ListeAteliers";
import { TitreDeVue } from "./TitreDeVue";
import { useCompte } from "../contexts/Compte";
import { useInscriptions } from "../contexts/Inscriptions";
import { CHEMINS } from "../utils/chemins";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "../utils/filtre";
import { prenomDe } from "../utils/messages";

/** « Mon espace » (TP 2, point 4) : les ateliers suivis, leurs places, et de quoi se désinscrire ; pour un formateur, l'accès à ses ateliers. Gardée par proxy.ts et GardeEspace. */
export function Dashboard({ ateliers }: { ateliers: readonly Atelier[] }) {
  const { utilisateur } = useCompte();
  const { inscrits } = useInscriptions();
  // ?bienvenue=1 : posé par l'inscription, à la place du state de navigation de React Router
  const bienvenue = useSearchParams().get("bienvenue") === "1";

  // Valeur dérivée : le catalogue (chargé par la page serveur), réduit aux ateliers suivis, par date
  const suivis = filtrerAteliers(ateliers, CRITERES_PAR_DEFAUT).filter((a) => inscrits.has(a.id));

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>{`Bonjour ${utilisateur ? prenomDe(utilisateur.nom) : ""}`}</TitreDeVue>
      {bienvenue && <p className="mb-4 rounded-s bg-succes-fond px-4 py-3 font-semibold text-succes">Votre compte est créé. Bienvenue !</p>}
      <p className="text-texte-doux">Profil : {utilisateur?.profil === "formateur" ? "formateur indépendant" : "en reconversion"}</p>

      {utilisateur?.profil === "formateur" && (
        <section aria-labelledby="t-cote-formateur" className="mt-8">
          <h2 id="t-cote-formateur" className="text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">
            Côté formateur
          </h2>
          <p className="mt-4 flex flex-wrap gap-3">
            <LienAction href={CHEMINS.creerAtelier}>Créer un atelier</LienAction>
            <LienAction href={CHEMINS.mesAteliers} variante="secondaire">
              Mes ateliers publiés
            </LienAction>
          </p>
        </section>
      )}

      <h2 className="mt-8 text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">Mes inscriptions</h2>
      {suivis.length === 0 ? (
        <p className="mt-4">
          Vous n'êtes inscrit à aucun atelier pour l'instant. <Link href={CHEMINS.ateliers}>Parcourir le catalogue</Link>
        </p>
      ) : (
        // Sous le h2 « Mes inscriptions » : les titres des cartes sont des h3
        <ListeAteliers ateliers={suivis} niveauTitre={3} />
      )}
    </div>
  );
}
