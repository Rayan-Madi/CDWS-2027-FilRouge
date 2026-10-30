import { NextResponse, type NextRequest } from "next/server";

/**
 * Le garde du TP 2 (ExigeConnexion), côté SERVEUR : proxy.ts s'exécute avant le rendu, pour chaque chemin
 * du matcher. Vérification « optimiste » : le cookie existe, rien de plus. Le front cache, le serveur refuse :
 * la vraie vérification se fera près des données (le back-end, BC02). proxy.ts est l'ancien middleware.ts.
 */
export function proxy(requete: NextRequest) {
  if (!requete.cookies.has("session")) {
    const inscription = new URL("/inscription", requete.url);
    inscription.searchParams.set("depuis", requete.nextUrl.pathname);
    return NextResponse.redirect(inscription);
  }
  return NextResponse.next();
}

// Les chemins gardés, et seulement eux
export const config = { matcher: ["/mon-espace/:path*"] };
