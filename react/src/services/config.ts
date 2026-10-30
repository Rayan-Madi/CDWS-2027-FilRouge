/* Où lire le catalogue (TP 3, point 1). La décision tient ici, en un seul endroit : api.ts, le module
   de FM03, reste TEL QUEL, il reçoit l'adresse par son option url. */
import { URL_ATELIERS } from "./api";

const API = import.meta.env.VITE_API_URL;

/** Avec VITE_API_URL : l'API (json-server en développement). Sans : le fichier livré avec le site (GitHub Pages n'a pas de serveur). */
export const URL_CATALOGUE: string | URL = API ? `${API.replace(/\/+$/, "")}/ateliers` : URL_ATELIERS;
