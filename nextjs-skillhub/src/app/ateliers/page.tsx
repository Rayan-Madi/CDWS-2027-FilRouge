import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue } from "@/components/Catalogue";
import { ListeAteliers } from "@/components/ListeAteliers";
import { TitreDeVue } from "@/components/TitreDeVue";
import { catalogueEnCache } from "@/services/en-cache";
import { CRITERES_PAR_DEFAUT, filtrerAteliers } from "@/utils/filtre";

export const metadata: Metadata = { title: "Les ateliers" };

// Composant SERVEUR : async, il attend ses données avant de rendre. catalogueEnCache et non chargerAteliers :
// sans "use cache", next build refuse la page (« uncached data during prerendering », diapo 5.5)
export default async function PageAteliers() {
  const ateliers = await catalogueEnCache();
  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-8">
      <TitreDeVue>Les ateliers du moment</TitreDeVue>
      {ateliers.length === 0 ? (
        <p>Aucun atelier pour l'instant : revenez bientôt.</p>
      ) : (
        // useSearchParams (dans Catalogue) exige un Suspense. Son repli est la liste complète, prérendue :
        // le HTML livré contient déjà les 14 ateliers, ceux que lisent les robots et Ctrl+U
        <Suspense fallback={<ListeAteliers ateliers={filtrerAteliers(ateliers, CRITERES_PAR_DEFAUT)} />}>
          <Catalogue ateliers={ateliers} />
        </Suspense>
      )}
    </div>
  );
}
