export const STORES = [
  { key: "bilate", label: "Marcos Bilate", host: "bilate.focoradical.com.br" },
  { key: "mblt", label: "Marcos Bilate 2", host: "mblt.focoradical.com.br" },
  { key: "ppbi", label: "Pietro Bilate", host: "ppbi.focoradical.com.br" },
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

export const PHOTOGRAPHER = {
  name: "Marcos Bilate",
  city: "Vitória, ES",
  bio: "Fotógrafo, biólogo e herpetólogo. Nove prêmios internacionais.",
  photo:
    "https://cdn.focoradical.com.br/newfoco/user-store-photos/2026-04-29-20b46c4130d69f8ef873ec4a02a3baecb5623c92.jpg",
};
