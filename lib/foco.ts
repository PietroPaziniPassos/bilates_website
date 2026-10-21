import snapshot from "@/data/eventos.json";
import { type EventsFile, type FocoEvent, REQUEST_GAP_MS, fetchStorePage, mergeStoreItems, sleep, sortEvents } from "./foco-core";
import { STORES } from "./site";

export type { CoverKind, FocoEvent } from "./foco-core";

export const CATALOG_REVALIDATE_SECONDS = 1800;

/**
 * O arquivo data/eventos.json (gravado pelo cron do GitHub) é a base. Por cima, a página 1 de cada
 * loja cobre o evento publicado depois do último cron. Se a Foco falhar, fica só o arquivo: o site
 * nunca quebra nem deixa de publicar por causa dela.
 */
export async function getCatalog(): Promise<{ events: FocoEvent[] }> {
  const byId = new Map((snapshot as EventsFile).eventos.map((e) => [e.id, { ...e }]));

  for (const [i, store] of STORES.entries()) {
    if (i > 0) await sleep(REQUEST_GAP_MS);
    try {
      const page = await fetchStorePage(store.host, 1, {
        init: { next: { revalidate: CATALOG_REVALIDATE_SECONDS } } as RequestInit,
      });
      mergeStoreItems(byId, store.key, page.items);
    } catch (err) {
      console.warn(`[foco] página 1 de ${store.host} indisponível, usando só o arquivo:`, err);
    }
  }

  return { events: sortEvents(byId.values()) };
}
