export const STORES = [
  { key: "bilate", label: "Loja 1", host: "bilate.focoradical.com.br" },
  { key: "ppbi", label: "Loja 2", host: "ppbi.focoradical.com.br" },
  { key: "mblt", label: "Loja 3", host: "mblt.focoradical.com.br" },
] as const;

export type StoreKey = (typeof STORES)[number]["key"];

// Evento que aparece em mais de uma loja abre na primeira desta lista que o tiver.
export const EVENT_STORE_PRIORITY: StoreKey[] = ["ppbi", "mblt", "bilate"];

export const STORE_BY_KEY = Object.fromEntries(STORES.map((s) => [s.key, s])) as Record<
  StoreKey,
  (typeof STORES)[number]
>;

export function eventUrl(store: StoreKey, path: string) {
  return `https://${STORE_BY_KEY[store].host}/evento/${path}`;
}

export function storeUrl(store: StoreKey) {
  return `https://${STORE_BY_KEY[store].host}/`;
}

export const CONTACT = {
  instagram: "marcosbilate",
  email: "bilatefotografia@gmail.com",
};

// Só no JSON-LD: a interface não mostra o nome do fotógrafo (pedido do Pietro, 2026-11-19).
export const PHOTOGRAPHER = { name: "Marcos Bilate" };
