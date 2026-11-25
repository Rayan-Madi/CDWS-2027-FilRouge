import Link from "next/link";
import { BoutonsAccroche } from "@/components/BoutonsAccroche";
import { IconeValeur } from "@/components/icones";
import { ListeAteliers } from "@/components/ListeAteliers";
import { TitreDeVue } from "@/components/TitreDeVue";
import { catalogueEnCache } from "@/services/en-cache";
import { image } from "@/services/formateurs";
import { CHEMINS } from "@/utils/chemins";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "@/utils/filtre";

const VALEURS = [
  { nom: "proximite", titre: "Proximité", texte: "Des groupes de huit personnes au maximum : votre formateur connaît votre prénom et votre projet." },
  { nom: "transparence", titre: "Transparence", texte: "Le prix, le programme et les avis des anciens participants sont affichés avant toute inscription." },
  { nom: "exigence", titre: "Exigence", texte: "Chaque atelier se termine par une réalisation concrète que vous pouvez montrer à un recruteur." },
] as const;

/** L'accueil : la landing de FM03 transposée — accroche, valeurs, les prochains ateliers, l'appel aux formateurs. Page SERVEUR. */
export default async function Accueil() {
  // Les trois plus proches : le filtre par défaut trie par date. Attendus sur le serveur : plus d'état « chargement »
  const prochains = filtrerAteliers(await catalogueEnCache(), CRITERES_PAR_DEFAUT).slice(0, 3);

  return (
    <>
      <section aria-labelledby="t-accroche" className="mx-auto grid max-w-page grid-cols-1 items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <TitreDeVue id="t-accroche">
            Reprenez la main sur votre reconversion
          </TitreDeVue>
          <p className="text-m text-texte-doux">Des ateliers courts et concrets, animés par des formateurs indépendants qui ont fait le chemin avant vous.</p>
          <BoutonsAccroche />
        </div>
        {/* L'image d'accroche fait le LCP : jamais de loading="lazy", fetchPriority haute (FM01). Elle est maintenant
            dans le HTML prérendu : le navigateur la découvre sans attendre le JavaScript (le défaut relevé au TP 3).
            <img> et non next/image : les trois largeurs WebP sont déjà produites depuis FM01. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image("accroche-800.webp")}
          srcSet={`${image("accroche-400.webp")} 400w, ${image("accroche-700.webp")} 700w, ${image("accroche-800.webp")} 800w`}
          sizes="(min-width: 64em) 30rem, (min-width: 48em) calc(50vw - 3rem), calc(100vw - 2rem)"
          width={800}
          height={492}
          alt="Une apprenante code sur son ordinateur portable pendant un atelier en ligne"
          fetchPriority="high"
          className="block w-full rounded-m shadow-2"
        />
      </section>

      <section aria-labelledby="t-valeurs" className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-page">
          <h2 id="t-valeurs" className="text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">
            Nos valeurs
          </h2>
          <ul role="list" className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-6">
            {VALEURS.map((v) => (
              <li key={v.nom} className="rounded-m border border-bordure bg-fond p-6">
                <IconeValeur nom={v.nom} />
                <h3 className="mb-3 text-m leading-titre font-semibold">{v.titre}</h3>
                <p>{v.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="t-prochains" className="bg-fond-teinte px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-page">
          <h2 id="t-prochains" className="text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">
            Les prochains ateliers
          </h2>
          <ListeAteliers ateliers={prochains} niveauTitre={3} />
          <p className="mt-6">
            <Link href={CHEMINS.ateliers}>Voir tout le catalogue</Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="t-formateurs" className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-page">
          <h2 id="t-formateurs" className="text-[clamp(1.563rem,3vw+0.5rem,2.441rem)] leading-titre font-semibold">
            Vous êtes formateur indépendant ?
          </h2>
          <p className="mt-3">
            <Link href={`${CHEMINS.inscription}?profil=formateur`}>Créez votre compte</Link> en choisissant « Formateur indépendant » : vous pourrez proposer vos ateliers. Découvrez aussi <Link href={CHEMINS.formateurs}>nos formateurs</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
