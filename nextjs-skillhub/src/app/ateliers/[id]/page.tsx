import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionsFiche } from "@/components/ActionsFiche";
import { TitreDeVue } from "@/components/TitreDeVue";
import { catalogueEnCache, ficheEnCache } from "@/services/en-cache";
import { CHEMINS } from "@/utils/chemins";
import { formaterDate, formaterDuree, formaterPrix, libelleNiveau } from "@/utils/format";

// Au build : les fiches à prérendre. Avec Cache Components, au moins une, sinon next build refuse
export async function generateStaticParams() {
  return (await catalogueEnCache()).map((a) => ({ id: a.id }));
}

// Un titre par atelier, écrit dans le HTML de la page (TitreDeVue le posait dans un effet, côté Vite)
export async function generateMetadata({ params }: PageProps<"/ateliers/[id]">) {
  const atelier = await ficheEnCache((await params).id);
  return { title: atelier?.titre ?? "Atelier introuvable", description: atelier?.description };
}

/** La fiche d'un atelier. params est une PROMESSE depuis Next.js 15 : on l'attend. [id] est toujours une chaîne. */
export default async function FicheAtelier({ params }: PageProps<"/ateliers/[id]">) {
  const { id } = await params;
  const atelier = await ficheEnCache(id);
  if (!atelier) notFound(); // rend not-found.tsx : la route * du TP 2

  const details: [string, string][] = [
    ["Formateur", atelier.formateur],
    ["Date", formaterDate(atelier.date)],
    ["Durée", formaterDuree(atelier.duree)],
    ["Lieu", atelier.lieu],
    ["Niveau", libelleNiveau(atelier.niveau)],
    ["Prérequis", atelier.prerequis],
    ["Prix", formaterPrix(atelier.prix)],
  ];

  return (
    <article className="mx-auto max-w-page px-4 py-12 md:px-8">
      <p className="mb-2">
        <Link href={CHEMINS.ateliers}>← Tous les ateliers</Link>
      </p>
      <TitreDeVue>{atelier.titre}</TitreDeVue>
      <p className="text-m text-texte-doux">{atelier.description}</p>
      <dl className="mt-6 grid max-w-xl grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
        {details.map(([terme, valeur]) => (
          <div key={terme} className="contents">
            <dt className="font-semibold">{terme}</dt>
            <dd>{valeur}</dd>
          </div>
        ))}
      </dl>
      <ActionsFiche atelier={atelier} />
    </article>
  );
}
