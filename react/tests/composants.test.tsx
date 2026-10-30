// Les composants et les vues, sous jsdom : ce qu'on voit, ce qu'on annonce, où va le focus.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import type { Atelier } from "../src/types";
import { CarteAtelier } from "../src/components/CarteAtelier";
import { useCompte } from "../src/contexts/Compte";
import { ateliers, catalogueOk, creerUnCompte, rendreA, simulerFetch, taperLAdresse } from "./outils";

const git = ateliers[0] as Atelier;

describe("CarteAtelier : elle ne décide de rien, elle prévient", () => {
  const carte = (props: Partial<Parameters<typeof CarteAtelier>[0]> = {}) => {
    const onInscrire = vi.fn();
    render(
      <MemoryRouter>
        <CarteAtelier atelier={git} placesRestantes={git.places} inscrit={false} onInscrire={onInscrire} onDesinscrire={vi.fn()} {...props} />
      </MemoryRouter>
    );
    return onInscrire;
  };

  test("le bouton dit de quel atelier il parle, et passe l'identifiant au parent", async () => {
    const onInscrire = carte();
    await userEvent.click(screen.getByRole("button", { name: "S'inscrire à l'atelier Initiation à Git" }));
    expect(onInscrire).toHaveBeenCalledWith("git-initiation");
    expect(screen.getByRole("link", { name: "Initiation à Git" })).toHaveAttribute("href", "/ateliers/git-initiation");
  });

  test("complet : « Complet » en toutes lettres, et pas de bouton", () => {
    carte({ placesRestantes: 0 });
    expect(screen.getByText("Complet")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("inscrit : « Vous êtes inscrit » et le même bouton devient « Se désinscrire »", () => {
    carte({ inscrit: true });
    expect(screen.getByText("Vous êtes inscrit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se désinscrire de l'atelier Initiation à Git" })).toBeInTheDocument();
  });
});

describe("Catalogue : les quatre états", () => {
  test("chargement, puis succès : 14 cartes, et le compteur annoncé", async () => {
    catalogueOk();
    rendreA("/ateliers");
    expect(screen.getByRole("status")).toHaveTextContent("Chargement des ateliers…");
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(14);
    expect(document.title).toBe("Les ateliers · SkillHub");
  });

  test("les critères viennent de l'URL : ?niveau=avance&soir=oui", async () => {
    catalogueOk();
    rendreA("/ateliers?niveau=avance&soir=oui");
    expect(await screen.findByText("2 ateliers · niveau avancé · le soir · par date")).toBeInTheDocument();
    expect(screen.getByLabelText("Niveau")).toHaveValue("avance");
  });

  test("vide : une phrase polie, et « Tout afficher » remet tout et renvoie le focus à la recherche", async () => {
    catalogueOk();
    rendreA("/ateliers?recherche=cobol");
    expect(await screen.findByText("Aucun atelier ne correspond à ces filtres.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tout afficher" }));
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
    expect(screen.getByLabelText(/Rechercher/)).toHaveFocus();
  });

  test("erreur 404 : une phrase sans code (role=alert), « Réessayer » relance et réussit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const faux = simulerFetch(() => new Response("introuvable", { status: 404 }));
    rendreA("/ateliers");
    expect(await screen.findByRole("alert")).toHaveTextContent("Le catalogue est introuvable pour le moment.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("404");
    faux.mockImplementation(async () => new Response(JSON.stringify(ateliers), { status: 200 }));
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("14 ateliers · par date")).toBeInTheDocument();
  });
});

describe("Routes", () => {
  test("une adresse inconnue : la page introuvable, jamais un écran blanc", () => {
    catalogueOk();
    rendreA("/nimporte-quoi");
    expect(screen.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeInTheDocument();
  });

  test("le garde : sans compte, /mon-espace mène à l'inscription", () => {
    catalogueOk();
    rendreA("/mon-espace");
    expect(screen.getByRole("heading", { level: 1, name: "Créer mon compte" })).toBeInTheDocument();
  });

  test("la fiche d'un atelier inconnu le dit, avec un lien vers le catalogue", async () => {
    catalogueOk();
    rendreA("/ateliers/existe-pas");
    expect(await screen.findByRole("heading", { level: 1, name: "Atelier introuvable" })).toBeInTheDocument();
  });
});

describe("Inscription, puis Mon espace", () => {
  test("envoi vide : un message relié à chaque champ, focus sur le premier", async () => {
    rendreA("/inscription");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    const nom = screen.getByLabelText("Prénom et nom");
    expect(nom).toHaveFocus();
    expect(nom).toHaveAttribute("aria-invalid", "true");
    expect(nom).toHaveAccessibleDescription("Indiquez votre prénom et votre nom.");
    expect(screen.getByLabelText("Adresse électronique")).toHaveAccessibleDescription(/Indiquez votre adresse électronique/);
  });

  test("compte créé : direction Mon espace, « Bonjour Jonny », et la navigation propose « Mon espace »", async () => {
    catalogueOk();
    rendreA("/inscription");
    await userEvent.type(screen.getByLabelText("Prénom et nom"), "Jonny Martin");
    await userEvent.type(screen.getByLabelText("Adresse électronique"), "jonny@exemple.fr");
    await userEvent.selectOptions(screen.getByLabelText("Je suis"), "apprenant");
    await userEvent.click(screen.getByLabelText("J'accepte les conditions d'utilisation"));
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByRole("button", { name: "Inscription en cours…" })).toHaveAttribute("aria-disabled", "true");
    expect(await screen.findByRole("heading", { level: 1, name: "Bonjour Jonny" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Votre compte est créé. Bienvenue !")).toBeInTheDocument();
    expect(await screen.findByText(/aucun atelier pour l'instant/)).toBeInTheDocument();
    expect(within(screen.getByRole("navigation")).getByRole("link", { name: "Mon espace" })).toHaveAttribute("aria-current", "page");
  });
});

describe("Le focus ne se perd jamais en route", () => {
  test("arriver sur une fiche : le focus est sur son h1, et y reste une fois l'atelier chargé", async () => {
    catalogueOk();
    rendreA("/ateliers");
    await userEvent.click(await screen.findByRole("link", { name: "Initiation à Git" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Initiation à Git" })).toHaveFocus();
  });

  test("se désinscrire du dernier atelier suivi : la liste disparaît avec la modale, le focus revient au h1", async () => {
    catalogueOk();
    rendreA("/inscription");
    await userEvent.type(screen.getByLabelText("Prénom et nom"), "Léa Durand");
    await userEvent.type(screen.getByLabelText("Adresse électronique"), "lea@exemple.fr");
    await userEvent.selectOptions(screen.getByLabelText("Je suis"), "apprenant");
    await userEvent.click(screen.getByLabelText("J'accepte les conditions d'utilisation"));
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    await screen.findByRole("heading", { level: 1, name: "Bonjour Léa" }, { timeout: 3000 });

    const nav = within(screen.getByRole("navigation"));
    await userEvent.click(nav.getByRole("link", { name: "Ateliers" }));
    await userEvent.click(await screen.findByRole("button", { name: "S'inscrire à l'atelier Initiation à Git" }));
    await screen.findByRole("button", { name: "Se désinscrire de l'atelier Initiation à Git" }, { timeout: 3000 });

    await userEvent.click(nav.getByRole("link", { name: "Mon espace" }));
    // Sous le h2 « Mes inscriptions », les cartes sont des h3
    expect(await screen.findByRole("heading", { level: 3, name: "Initiation à Git" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Se désinscrire de l'atelier Initiation à Git" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmer la désinscription" }));

    expect(await screen.findByText(/aucun atelier pour l'instant/, undefined, { timeout: 3000 })).toBeInTheDocument();
    // La modale rend le focus dans le nettoyage de son effet, juste APRÈS l'affichage : on l'attend
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Bonjour Léa" })).toHaveFocus());
  }, 10000);
});

describe("Côté formateur : CreerAtelier et MesAteliers", () => {
  test("un apprenant qui tape l'adresse de création lit que c'est réservé aux formateurs", async () => {
    catalogueOk();
    rendreA("/inscription");
    await creerUnCompte("Paul Simon", "paul@exemple.fr", "apprenant");
    expect(screen.queryByRole("link", { name: "Créer un atelier" })).toBeNull();
    // Le garde laisse passer la personne connectée, puis vérifie son profil
    await taperLAdresse("/mon-espace/creer-un-atelier");
    expect(screen.getByRole("heading", { level: 1, name: "Réservé aux formateurs" })).toBeInTheDocument();
    await taperLAdresse("/mon-espace/mes-ateliers");
    expect(screen.getByRole("heading", { level: 1, name: "Réservé aux formateurs" })).toBeInTheDocument();
  }, 10000);

  test("envoi vide : un message relié à chaque champ obligatoire, focus sur le titre", async () => {
    catalogueOk();
    rendreA("/inscription?profil=formateur");
    await creerUnCompte("Aïcha N'Diaye", "aicha@exemple.fr", "formateur");
    await userEvent.click(screen.getByRole("link", { name: "Créer un atelier" }));
    await userEvent.click(await screen.findByRole("button", { name: "Publier l'atelier" }));
    const titre = screen.getByLabelText("Titre de l'atelier");
    expect(titre).toHaveFocus();
    expect(titre).toHaveAccessibleDescription("Donnez un titre d'au moins 5 caractères.");
    expect(screen.getByLabelText("Date et heure")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Prérequis/)).toHaveAttribute("aria-invalid", "false");
  }, 10000);

  test("atelier publié : il arrive dans Mes ateliers, puis dans le catalogue, avec sa fiche", async () => {
    catalogueOk();
    rendreA("/inscription");
    await creerUnCompte("Thomas Martin", "thomas@exemple.fr", "formateur");
    await userEvent.click(screen.getByRole("link", { name: "Créer un atelier" }));
    await userEvent.type(await screen.findByLabelText("Titre de l'atelier"), "Docker sans douleur");
    await userEvent.type(screen.getByLabelText("Description"), "Construire, lancer et partager ses premiers conteneurs.");
    await userEvent.selectOptions(screen.getByLabelText("Catégorie"), "Développement");
    await userEvent.selectOptions(screen.getByLabelText("Niveau"), "intermediaire");
    fireEvent.change(screen.getByLabelText("Date et heure"), { target: { value: "2027-03-10T18:30" } });
    await userEvent.selectOptions(screen.getByLabelText("Durée"), "180");
    await userEvent.type(screen.getByLabelText("Places"), "8");
    await userEvent.type(screen.getByLabelText("Prix en euros"), "30");
    await userEvent.click(screen.getByRole("button", { name: "Publier l'atelier" }));
    expect(screen.getByRole("button", { name: "Publication en cours…" })).toHaveAttribute("aria-disabled", "true");

    expect(await screen.findByRole("heading", { level: 1, name: "Mes ateliers" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("« Docker sans douleur » est publié : il apparaît dans le catalogue.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Docker sans douleur" })).toBeInTheDocument();

    await userEvent.click(within(screen.getByRole("navigation")).getByRole("link", { name: "Ateliers" }));
    expect(await screen.findByText("15 ateliers · par date")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Docker sans douleur" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Docker sans douleur" })).toBeInTheDocument();
    expect(screen.getByText("Thomas Martin")).toBeInTheDocument();
  }, 10000);
});

describe("Navigation et hooks", () => {
  test("« Menu » : aria-expanded suit, et Échap referme en rendant le focus au bouton", async () => {
    catalogueOk();
    rendreA("/");
    const menu = screen.getByRole("button", { name: "Menu" });
    await userEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(menu).toHaveFocus();
  });

  test("un hook maison hors de son fournisseur le dit tout de suite", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Sonde() {
      useCompte();
      return null;
    }
    expect(() => render(<Sonde />)).toThrow("useCompte doit être appelé sous <FournisseurCompte>.");
  });
});
