/// <reference types="vite/client" />

/** Les variables d'environnement lues par l'application : typées, une faute de nom ne compile pas. */
interface ImportMetaEnv {
  /** L'adresse de l'API (sans « / » final). Absente : le catalogue est lu dans le fichier livré avec le site. */
  readonly VITE_API_URL?: string;
}
