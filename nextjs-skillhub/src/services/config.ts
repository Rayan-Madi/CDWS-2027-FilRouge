/* Où lire le catalogue. En Next.js, import.meta.env.VITE_API_URL devient process.env.NEXT_PUBLIC_API_URL :
   une adresse inscrite au build, lisible par le navigateur comme par le serveur. Jamais un secret. */
const API = process.env.NEXT_PUBLIC_API_URL;

/** L'adresse du catalogue sur l'API, ou undefined : le catalogue est alors lu dans src/donnees/ateliers.json. */
export const URL_CATALOGUE: string | undefined = API ? `${API.replace(/\/+$/, "")}/ateliers` : undefined;
