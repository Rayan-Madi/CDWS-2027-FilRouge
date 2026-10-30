import type { Metadata } from "next";
import { Suspense } from "react";
import { FormulaireInscription } from "@/components/FormulaireInscription";
import { TitreDeVue } from "@/components/TitreDeVue";

export const metadata: Metadata = { title: "Créer mon compte" };

/** La page reste serveur ; le formulaire, client, lit l'adresse (?profil, ?depuis) : il attend sous Suspense. */
export default function PageInscription() {
  return (
    // Le repli est ce que contient le HTML prérendu : le titre est déjà là, le formulaire suit
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-12">
          <TitreDeVue>Créer mon compte</TitreDeVue>
          <p className="text-texte-doux">Chargement du formulaire…</p>
        </div>
      }
    >
      <FormulaireInscription />
    </Suspense>
  );
}
