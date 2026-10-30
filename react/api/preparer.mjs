// L'API locale du TP 3 : json-server sert un fichier { "ateliers": [...] }. On le fabrique à partir de
// src/donnees/ateliers.json (FM03), qui reste la SEULE source : une copie à la main finirait par diverger.
import { readFile, writeFile } from "node:fs/promises";

const ateliers = JSON.parse(await readFile(new URL("../src/donnees/ateliers.json", import.meta.url), "utf8"));
await writeFile(new URL("./db.json", import.meta.url), JSON.stringify({ ateliers }, null, 2));
console.log(`API prête : ${ateliers.length} ateliers sur http://localhost:3001/ateliers`);
