// Atualiza data/eventos.json a partir das lojas da Foco.
//   npx tsx scripts/sincronizar-eventos.ts             página 1 de cada loja, fundida no arquivo (cron diário)
//   npx tsx scripts/sincronizar-eventos.ts --completo  todas as páginas, arquivo refeito do zero (cron semanal)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type EventsFile,
  type FocoEvent,
  REQUEST_GAP_MS,
  fetchStorePage,
  mergeStoreItems,
  sleep,
  sortEvents,
} from "../lib/foco-core";
import { cityCoords } from "../lib/cidades";
import { STORES } from "../lib/site";

const FILE = path.join(process.cwd(), "data", "eventos.json");
const RETRY_DELAYS_MS = [8_000, 20_000, 45_000];
const completo = process.argv.includes("--completo");

async function readCurrent(): Promise<FocoEvent[]> {
  try {
    return (JSON.parse(await readFile(FILE, "utf8")) as EventsFile).eventos;
  } catch {
    return [];
  }
}

async function main() {
  const current = await readCurrent();
  // No modo completo o arquivo é refeito: some o evento que saiu da loja, entra o de data antiga
  // cadastrado tarde. No diário, a página 1 é fundida no que já existe.
  const byId = new Map<number, FocoEvent>(completo ? [] : current.map((e) => [e.id, e]));

  let first = true;
  for (const store of STORES) {
    let pageCount = 1;
    for (let page = 1; page <= (completo ? pageCount : 1); page++) {
      if (!first) await sleep(REQUEST_GAP_MS);
      first = false;
      const result = await fetchStorePage(store.host, page, { retryDelaysMs: RETRY_DELAYS_MS });
      pageCount = result.pageCount;
      mergeStoreItems(byId, store.key, result.items);
    }
    console.log(`${store.host}: ${completo ? `${pageCount} páginas` : "página 1"}`);
  }

  const eventos = sortEvents(byId.values());
  const semCoordenada = new Set(eventos.filter((e) => e.city && !cityCoords(e.city, e.uf)).map((e) => `${e.city}, ${e.uf}`));
  if (semCoordenada.size) {
    console.warn(`::warning::Cidade sem coordenada em lib/cidades.ts (fora do "Até 50 km de você"): ${[...semCoordenada].join("; ")}`);
  }
  const before = JSON.stringify(sortEvents(current));
  if (JSON.stringify(eventos) === before) {
    console.log(`Sem mudança (${eventos.length} eventos).`);
    return;
  }

  const file: EventsFile = { geradoEm: new Date().toISOString(), eventos };
  await writeFile(FILE, JSON.stringify(file, null, 1) + "\n");
  const novos = eventos.length - current.length;
  console.log(`Gravado: ${eventos.length} eventos (${novos >= 0 ? "+" : ""}${novos}).`);
}

// Qualquer falha encerra sem escrever: o arquivo anterior fica intacto e o Action aparece como falho.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
