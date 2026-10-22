// Sede de cada município do catálogo. O evento da Foco só traz cidade e UF; cidade nova que o cron
// trouxer sem entrada aqui fica fora do filtro "Perto de você" (o script de eventos avisa no log).
const COORDS: Record<string, [number, number]> = {
  "vitoria|ES": [-20.3155, -40.3128],
  "vila velha|ES": [-20.3297, -40.2925],
  "serra|ES": [-20.1286, -40.3075],
  "cariacica|ES": [-20.2632, -40.4165],
  "guarapari|ES": [-20.6667, -40.4975],
  "domingos martins|ES": [-20.3631, -40.6594],
  "alfredo chaves|ES": [-20.6353, -40.7494],
  "marataizes|ES": [-21.0433, -40.8244],
  "piuma|ES": [-20.8375, -40.7289],
  "sooretama|ES": [-19.1897, -40.0975],
  "natal|RN": [-5.7945, -35.211],
  "rio de janeiro|RJ": [-22.9068, -43.1729],
  "sao paulo|SP": [-23.5505, -46.6333],
};

export const NEARBY_RADIUS_KM = 50;

function cityKey(city: string, uf: string) {
  return `${city.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()}|${uf.toUpperCase()}`;
}

export function cityCoords(city: string, uf: string) {
  return COORDS[cityKey(city, uf)] ?? null;
}

export function distanceKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}
