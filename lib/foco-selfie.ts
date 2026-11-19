import "server-only";
import { z } from "zod";
import { STORE_BY_KEY } from "./site";

// Contrato não documentado da busca rápida por rosto da Foco: wiki api-foco-busca-rapida.
const FOCO_ORIGIN = "https://www.focoradical.com.br";
const RESULT_HOST = STORE_BY_KEY.bilate.host;

const UploadResponse = z.object({ image_id: z.string().regex(/^[a-f0-9]{40}--\d+$/) });

const City = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  stateId: z.number().int().positive(),
  stateAbbr: z.string(),
});

export type FocoCity = z.infer<typeof City>;

export class FocoUnavailableError extends Error {}

export async function uploadSelfie(selfie: Blob) {
  const body = new FormData();
  body.append("selfie", selfie, "selfie.jpg");
  const res = await fetch(`${FOCO_ORIGIN}/competition/upload-selfie-busca-rapida`, {
    method: "POST",
    body,
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new FocoUnavailableError(`upload da selfie: HTTP ${res.status}`);
  return UploadResponse.parse(await res.json()).image_id;
}

export async function searchCities(query: string) {
  const res = await fetch(`${FOCO_ORIGIN}/next-api/home/search-cities?q=${encodeURIComponent(query)}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!res.ok) throw new FocoUnavailableError(`busca de cidades: HTTP ${res.status}`);
  const items = z.array(z.unknown()).parse(await res.json());
  return items.flatMap((item) => {
    const city = City.safeParse(item);
    return city.success ? [city.data] : [];
  });
}

export function quickSearchUrl(params: { stateId: number; cityId: number; date: string; imageId: string }) {
  const qs = new URLSearchParams({
    state_id: String(params.stateId),
    city_id: String(params.cityId),
    dates_multi: params.date,
    image_id: params.imageId,
  });
  return `https://${RESULT_HOST}/busca-rapida?${qs}`;
}
