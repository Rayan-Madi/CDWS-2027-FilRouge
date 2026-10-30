import { useEffect, useRef, useState } from "react";
import { estNiveau, estTri, type Criteres } from "../utils/filtre";

type Props = {
  criteres: Criteres;
  onChange: (changement: Partial<Criteres>) => void;
};

const CHAMP = "min-h-11 w-full rounded-s border border-texte-doux bg-fond px-3 py-2 text-texte";

/**
 * Le formulaire de filtres : recherche, niveau, tri, « le soir ». Les critères viennent de l'URL ;
 * seul le texte en cours de frappe est un état local, versé dans l'URL après 300 ms de calme
 * (une entrée d'historique par lettre, et une annonce par lettre, ce serait trop).
 */
export function FiltresAteliers({ criteres, onChange }: Props) {
  const [saisie, setSaisie] = useState(criteres.recherche);
  const [critereVu, setCritereVu] = useState(criteres.recherche);
  const minuterie = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // L'adresse a changé d'ailleurs (raccourci du menu, « Tout afficher », retour arrière) : le champ suit.
  // Ajustement pendant le rendu, et non dans un effet (react.dev, « You might not need an effect »)
  if (criteres.recherche !== critereVu) {
    setCritereVu(criteres.recherche);
    setSaisie(criteres.recherche);
  }

  // La minuterie en attente part avec le composant
  useEffect(() => () => clearTimeout(minuterie.current), []);

  function taper(valeur: string) {
    setSaisie(valeur);
    clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => onChange({ recherche: valeur }), 300);
  }

  // Un autre critère emporte la frappe en attente : un seul changement d'adresse, rien de perdu
  function changer(changement: Partial<Criteres>) {
    clearTimeout(minuterie.current);
    onChange({ recherche: saisie, ...changement });
  }

  return (
    <form
      role="search"
      aria-label="Filtrer les ateliers"
      onSubmit={(e) => {
        e.preventDefault(); // Entrée applique tout de suite, et ne recharge surtout pas la page
        changer({});
      }}
      className="mt-4 grid grid-cols-1 items-end gap-x-4 gap-y-3 rounded-m border border-bordure bg-fond p-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <p className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
        <label htmlFor="recherche" className="font-semibold">
          Rechercher un titre, un formateur ou un thème
        </label>
        <input id="recherche" type="search" autoComplete="off" value={saisie} onChange={(e) => taper(e.target.value)} className={CHAMP} />
      </p>
      <p className="flex flex-col gap-1">
        <label htmlFor="niveau" className="font-semibold">
          Niveau
        </label>
        <select id="niveau" value={criteres.niveau} onChange={(e) => changer({ niveau: estNiveau(e.target.value) ? e.target.value : "tous" })} className={CHAMP}>
          <option value="tous">Tous les niveaux</option>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
      </p>
      <p className="flex flex-col gap-1">
        <label htmlFor="tri" className="font-semibold">
          Trier par
        </label>
        <select id="tri" value={criteres.tri} onChange={(e) => changer({ tri: estTri(e.target.value) ? e.target.value : "date" })} className={CHAMP}>
          <option value="date">Date</option>
          <option value="prix-croissant">Prix croissant</option>
          <option value="prix-decroissant">Prix décroissant</option>
        </select>
      </p>
      <p className="flex min-h-11 items-center gap-2 md:col-span-2 lg:col-span-1">
        <input id="soir" type="checkbox" checked={criteres.soir} onChange={(e) => changer({ soir: e.target.checked })} className="size-6 accent-accent" />
        <label htmlFor="soir">Le soir (à partir de 18 h)</label>
      </p>
    </form>
  );
}
