import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "../components/Layout";
import { Accueil } from "../views/Accueil";
import { Catalogue } from "../views/Catalogue";
import { Dashboard } from "../views/Dashboard";
import { FicheAtelier } from "../views/FicheAtelier";
import { Formateurs } from "../views/Formateurs";
import { Inscription } from "../views/Inscription";
import { PageIntrouvable } from "../views/PageIntrouvable";
import { ExigeConnexion } from "./ExigeConnexion";

/** L'arbre des routes : le SEUL endroit où elles sont déclarées. Séparé du routeur pour se tester sous un MemoryRouter. */
export function RoutesSkillHub() {
  return (
    <Routes>
      {/* Le layout en route parente : l'en-tête et le pied ne se remontent pas à chaque page */}
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="ateliers" element={<Catalogue />} />
        <Route path="ateliers/:id" element={<FicheAtelier />} />
        <Route path="formateurs" element={<Formateurs />} />
        <Route path="inscription" element={<Inscription />} />
        {/* Route protégée : le garde décide, la page ne sait rien */}
        <Route element={<ExigeConnexion />}>
          <Route path="mon-espace" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<PageIntrouvable />} />
      </Route>
    </Routes>
  );
}

export function Routeur() {
  // basename : l'application vit sous une base (« / » en développement), les liens restent relatifs à elle
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RoutesSkillHub />
    </BrowserRouter>
  );
}
