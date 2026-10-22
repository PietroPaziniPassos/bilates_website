const TZ = "America/Sao_Paulo";

const isoInTz = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayInBrazil() {
  return isoInTz.format(new Date());
}

// Datas ISO (YYYY-MM-DD) são tratadas ao meio-dia UTC para que nenhum fuso mude o dia.
function toDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`);
}

export function addDays(iso: string, days: number) {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" });
const monthShortFmt = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
const monthLongFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const fullFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const shortFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function shortDateLabel(iso: string) {
  return shortFmt.format(toDate(iso)).replaceAll(".", "");
}

export function dayParts(iso: string) {
  const d = toDate(iso);
  return {
    day: String(d.getUTCDate()),
    month: monthShortFmt.format(d).replace(".", ""),
    weekday: weekdayFmt.format(d).replace(".", ""),
  };
}

export function monthLabel(iso: string) {
  const label = monthLongFmt.format(toDate(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function fullDateLabel(iso: string) {
  return fullFmt.format(toDate(iso));
}

export function startOfMonth(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}
