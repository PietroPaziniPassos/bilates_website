// Posição aproximada do visitante pelo IP, nos headers que a Vercel injeta em toda requisição.
// Fica numa rota à parte para a página de eventos continuar estática (ISR).
// https://vercel.com/docs/headers/request-headers#x-vercel-ip-latitude
export function GET(request: Request) {
  const lat = Number(request.headers.get("x-vercel-ip-latitude"));
  const lon = Number(request.headers.get("x-vercel-ip-longitude"));
  const valid =
    request.headers.has("x-vercel-ip-latitude") &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;

  return Response.json(valid ? { lat, lon } : null, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
