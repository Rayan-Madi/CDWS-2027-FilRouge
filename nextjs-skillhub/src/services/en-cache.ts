/* Côté SERVEUR : le service du TP 3, mis en cache (diapo 5.5). Le navigateur, lui, ne charge plus rien :
   les pages serveur lui envoient les ateliers tout prêts. api.ts ne bouge pas. */
import { cacheLife } from "next/cache";
import ateliers from "../donnees/ateliers.json";
import type { Atelier } from "../types";
import { chargerAteliers, estAtelier } from "./api";
import { URL_CATALOGUE } from "./config";

/** Le catalogue, depuis l'API si NEXT_PUBLIC_API_URL est posée, sinon depuis le fichier de FM03. */
export async function catalogueEnCache(): Promise<Atelier[]> {
  "use cache";
  cacheLife("hours"); // profil hours : revalidé après 1 h, expiré après 1 jour sans visite
  if (URL_CATALOGUE) return chargerAteliers(undefined, { url: URL_CATALOGUE });
  // Sans API, le fichier : vérifié comme une réponse, un JSON importé n'est pas typé pour autant
  return ateliers.filter(estAtelier);
}

/** La fiche relit le catalogue en cache : aucun appel de plus à l'API. */
export async function ficheEnCache(id: string): Promise<Atelier | undefined> {
  const tous = await catalogueEnCache();
  return tous.find((a) => a.id === id);
}
