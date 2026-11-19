import { searchCities } from "@/lib/foco-selfie";

const MAX_RESULTS = 8;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 60) ?? "";
  if (query.length < 2) return Response.json({ cities: [] });

  try {
    const cities = await searchCities(query);
    return Response.json(
      { cities: cities.slice(0, MAX_RESULTS) },
      { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("[cidades] falha na busca da Foco:", error);
    return Response.json({ error: "Não conseguimos buscar cidades agora." }, { status: 502 });
  }
}
