// Núcleo sem dependência do Next: usado pelo site (lib/foco.ts) e pelo cron (scripts/sincronizar-eventos.ts).
import { z } from "zod";
import { EVENT_STORE_PRIORITY, type StoreKey } from "./site";

export type CoverKind = "photo" | "logo" | "icon";

export type FocoEvent = {
  id: number;
  name: string;
  path: string;
  date: string;
  city: string;
  uf: string;
  photos: number;
  cover: { url: string; kind: CoverKind } | null;
  store: StoreKey;
};

export type EventsFile = {
  geradoEm: string;
  eventos: FocoEvent[];
};

const Competition = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  place: z.string().nullish(),
  state: z.object({ abbreviation: z.string() }).nullish(),
  imageCount: z.number().nullish(),
  coverPhotoOrIcon: z.object({ image: z.string().nullish(), class: z.string().nullish() }).nullish(),
});

const CompetitionPage = z.object({
  items: z.array(z.unknown()),
  _meta: z.object({ pageCount: z.number().int().min(0), totalCount: z.number().int().min(0) }),
});

type Competition = z.infer<typeof Competition>;

const TEST_EVENT = /\bEVENTO TESTE\b/i;

// O Cloudflare da Foco devolve 429 a qualquer rajada vinda do mesmo IP. 1,2 s entre chamadas é o
// ritmo que o Radar já usa contra o mesmo portal, e o cooldown depois de um 429 passa de 15 s.
export const REQUEST_GAP_MS = 1_200;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchStorePage(
  host: string,
  page: number,
  { retryDelaysMs = [] as number[], init = {} as RequestInit } = {},
) {
  const url = `https://${host}/next-api/home/competitions?page=${page}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const data = CompetitionPage.parse(await res.json());
      return { items: parseItems(host, data.items), pageCount: data._meta.pageCount };
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retryDelaysMs.length) {
      throw new Error(`${host} página ${page}: HTTP ${res.status}`);
    }
    await sleep(retryDelaysMs[attempt]);
  }
}

function parseItems(host: string, items: unknown[]) {
  const parsed: Competition[] = [];
  for (const item of items) {
    const result = Competition.safeParse(item);
    if (result.success) parsed.push(result.data);
    else console.warn(`[foco] item ignorado em ${host}:`, result.error.issues[0]);
  }
  return parsed;
}

// A Foco marca o tipo pela classe CSS: foto de capa, logo PNG sem fundo do organizador, ou o
// ícone SVG do esporte quando o evento não tem imagem.
function toCover(cover: Competition["coverPhotoOrIcon"]): FocoEvent["cover"] {
  const url = cover?.image;
  if (!url) return null;
  const cls = cover.class ?? "";
  if (cls.includes("sport-icon") || url.toLowerCase().endsWith(".svg")) return { url, kind: "icon" };
  if (cls.includes("cover-photo")) return { url, kind: "photo" };
  return { url, kind: "logo" };
}

const rank = (store: StoreKey) => EVENT_STORE_PRIORITY.indexOf(store);

/**
 * Funde itens de uma loja no mapa de eventos. Evento novo entra; evento conhecido é atualizado
 * (nome, capa e contagem mudam nos primeiros dias) e fica com a loja de maior prioridade.
 */
export function mergeStoreItems(byId: Map<number, FocoEvent>, store: StoreKey, items: Competition[]) {
  for (const c of items) {
    if (TEST_EVENT.test(c.name)) continue;
    const existing = byId.get(c.id);
    byId.set(c.id, {
      id: c.id,
      name: c.name.trim(),
      path: c.path,
      date: c.date,
      city: c.place?.trim() ?? "",
      uf: c.state?.abbreviation ?? "",
      photos: c.imageCount ?? 0,
      cover: toCover(c.coverPhotoOrIcon),
      store: existing && rank(existing.store) < rank(store) ? existing.store : store,
    });
  }
}

export function sortEvents(events: Iterable<FocoEvent>) {
  return [...events].sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name, "pt-BR"));
}

const ORLA_TRAINING = /^TREINOS?\b.*ORLA DE CAMBURI/i;

// O treino da Orla costuma ser publicado com o ícone genérico e ganha o banner do dia só horas
// depois. Até lá, vale o banner do treino anterior no mesmo dia da semana e turno (manhã e noite
// têm banners diferentes). O nome varia ("TREINO NOTURNO", "TARDE E NOITE", "TARDE NOITE").
function trainingSlot(e: FocoEvent) {
  if (!ORLA_TRAINING.test(e.name)) return null;
  const weekday = new Date(`${e.date}T12:00:00Z`).getUTCDay();
  return `${weekday}:${/NOTURN|NOITE/i.test(e.name) ? "noite" : "manha"}`;
}

export function borrowTrainingCovers(events: FocoEvent[]) {
  const lastPhoto = new Map<string, NonNullable<FocoEvent["cover"]>>();
  const oldestFirst = [...events].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of oldestFirst) {
    const slot = trainingSlot(e);
    if (!slot) continue;
    if (e.cover?.kind === "photo") lastPhoto.set(slot, e.cover);
    else if (lastPhoto.has(slot)) e.cover = lastPhoto.get(slot)!;
  }
  return events;
}
