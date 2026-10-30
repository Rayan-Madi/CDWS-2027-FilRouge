import type { Metadata } from "next";
import Link from "next/link";
import { TitreDeVue } from "@/components/TitreDeVue";
import { CHEMINS } from "@/utils/chemins";

export const metadata: Metadata = { title: "Page introuvable" };

/** La route * de React Router devenue not-found.tsx : une adresse inconnue, ou un notFound() d'une fiche. */
export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>Page introuvable</TitreDeVue>
      <p>Rien ne répond à cette adresse : l'atelier a peut-être été retiré, ou le lien est incomplet.</p>
      <ul className="mt-4 list-disc pl-6">
        <li><Link href={CHEMINS.accueil}>Revenir à l'accueil</Link></li>
        <li><Link href={CHEMINS.ateliers}>Voir les ateliers</Link></li>
      </ul>
    </div>
  );
}
