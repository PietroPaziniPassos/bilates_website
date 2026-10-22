"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { NEARBY_RADIUS_KM, cityCoords, distanceKm } from "@/lib/cidades";
import { addDays, dayParts, fullDateLabel, monthLabel, startOfMonth, todayInBrazil } from "@/lib/dates";
import type { FocoEvent } from "@/lib/foco";
import { EventCard } from "./event-card";

type Period = "any" | "today" | "yesterday" | "7d" | "30d" | "month" | "custom";

const PERIODS: { value: Period; label: string }[] = [
  { value: "any", label: "Qualquer data" },
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Escolher datas" },
];

const PAGE_SIZE = 24;
const STRIP_DAYS = 21;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const NEARBY = "perto";
const GEO_TIMEOUT_MS = 10_000;
const GEO_MAX_AGE_MS = 10 * 60_000;

const noopSubscribe = () => () => {};

function useToday() {
  return useSyncExternalStore(noopSubscribe, todayInBrazil, () => null);
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function resolveRange(period: Period, from: string, to: string, today: string | null) {
  if (period === "custom") return { from: from || null, to: to || null };
  if (period === "any" || !today) return { from: null, to: null };
  switch (period) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: y, to: y };
    }
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "month":
      return { from: startOfMonth(today), to: today };
  }
}

export function EventFinder({ events }: { events: FocoEvent[] }) {
  const today = useToday();
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState("");
  const [period, setPeriod] = useState<Period>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const hydratedFromUrl = useRef(false);

  const deferredQuery = useDeferredValue(query);

  // O filtro vive na URL para o atleta poder mandar o link do dia para o grupo de corrida.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("periodo") as Period | null;
    const de = params.get("de") ?? "";
    const ate = params.get("ate") ?? "";
    /* eslint-disable react-hooks/set-state-in-effect -- leitura única da URL após hidratar */
    if (params.get("q")) setQuery(params.get("q")!);
    if (params.get("local")) setPlace(params.get("local")!);
    if (p && PERIODS.some((x) => x.value === p)) setPeriod(p);
    if (ISO_DATE.test(de)) setFrom(de);
    if (ISO_DATE.test(ate)) setTo(ate);
    /* eslint-enable react-hooks/set-state-in-effect */
    hydratedFromUrl.current = true;
  }, []);

  const places = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      if (!e.city) continue;
      const key = `${e.city}|${e.uf}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  }, [events]);

  const nearbyPlaces = useMemo(() => {
    if (!origin) return null;
    const keys = new Set<string>();
    for (const [key] of places) {
      const [city, uf] = key.split("|");
      const coords = cityCoords(city, uf);
      if (coords && distanceKm(origin, coords) <= NEARBY_RADIUS_KM) keys.add(key);
    }
    return keys;
  }, [origin, places]);

  const nearbyCount = nearbyPlaces
    ? places.reduce((sum, [key, count]) => sum + (nearbyPlaces.has(key) ? count : 0), 0)
    : 0;

  // O navegador pede a permissão ao abrir. O filtro só liga sozinho se houver evento no raio e o
  // atleta não tiver chegado por um link com local escolhido.
  useEffect(() => {
    let active = true;
    const dropNearby = () => {
      if (active) setPlace((p) => (p === NEARBY ? "" : p));
    };
    if (!("geolocation" in navigator)) {
      dropNearby();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!active) return;
        const here: [number, number] = [coords.latitude, coords.longitude];
        const hasNearby = events.some((e) => {
          const c = cityCoords(e.city, e.uf);
          return c !== null && distanceKm(here, c) <= NEARBY_RADIUS_KM;
        });
        if (!hasNearby) return dropNearby();
        setOrigin(here);
        setPlace((p) => (p === "" ? NEARBY : p));
      },
      dropNearby,
      { enableHighAccuracy: false, maximumAge: GEO_MAX_AGE_MS, timeout: GEO_TIMEOUT_MS },
    );
    return () => {
      active = false;
    };
  }, [events]);

  useEffect(() => {
    if (!hydratedFromUrl.current) return;
    const params = new URLSearchParams();
    if (deferredQuery) params.set("q", deferredQuery);
    if (place) params.set("local", place);
    if (period !== "any") params.set("periodo", period);
    if (period === "custom" && from) params.set("de", from);
    if (period === "custom" && to) params.set("ate", to);
    const qs = params.toString();
    if (!qs && !window.location.search) return;
    window.history.replaceState(null, "", qs ? `?${qs}#eventos` : window.location.pathname);
  }, [deferredQuery, place, period, from, to]);

  const searchIndex = useMemo(
    () => new Map(events.map((e) => [e.id, normalize(`${e.name} ${e.city} ${e.uf}`)])),
    [events],
  );

  const countByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.date, (m.get(e.date) ?? 0) + 1);
    return m;
  }, [events]);

  const range = resolveRange(period, from, to, today);

  const filtered = useMemo(() => {
    const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean);
    return events.filter((e) => {
      if (range.from && e.date < range.from) return false;
      if (range.to && e.date > range.to) return false;
      if (place === NEARBY) {
        if (nearbyPlaces && !nearbyPlaces.has(`${e.city}|${e.uf}`)) return false;
      } else if (place && `${e.city}|${e.uf}` !== place) return false;
      if (terms.length) {
        const haystack = searchIndex.get(e.id)!;
        if (!terms.every((t) => haystack.includes(t))) return false;
      }
      return true;
    });
  }, [events, searchIndex, deferredQuery, place, nearbyPlaces, range.from, range.to]);

  const shown = filtered.slice(0, visible);
  const groups: { month: string; events: FocoEvent[] }[] = [];
  for (const e of shown) {
    const month = e.date.slice(0, 7);
    const last = groups.at(-1);
    if (last?.month === month) last.events.push(e);
    else groups.push({ month, events: [e] });
  }

  const hasFilters = Boolean(query || place || period !== "any");
  const selectedDay = period === "custom" && from && from === to ? from : null;

  function resetPaging() {
    setVisible(PAGE_SIZE);
  }

  function pickDay(day: string) {
    resetPaging();
    if (selectedDay === day) {
      setPeriod("any");
      setFrom("");
      setTo("");
      return;
    }
    setPeriod("custom");
    setFrom(day);
    setTo(day);
  }

  function clearAll() {
    resetPaging();
    setQuery("");
    setPlace("");
    setPeriod("any");
    setFrom("");
    setTo("");
  }

  const stripDays = today ? Array.from({ length: STRIP_DAYS }, (_, i) => addDays(today, -i)) : null;

  const countLabel = `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`;

  return (
    <section id="eventos" aria-labelledby="eventos-titulo">
      <div className="bg-yellow text-ink">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
          <h2 id="eventos-titulo" className="sr-only">
            Eventos
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1fr)_15rem_12rem]">
            <div className="relative col-span-2 md:col-span-1">
              <label htmlFor="busca" className="sr-only">
                Buscar evento
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/60"
                aria-hidden
              />
              <input
                id="busca"
                type="search"
                value={query}
                onChange={(e) => {
                  resetPaging();
                  setQuery(e.target.value);
                }}
                placeholder="Buscar evento ou cidade"
                autoComplete="off"
                enterKeyHint="search"
                className="h-12 w-full rounded-md border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25 pl-11 text-base placeholder:text-graphite/80"
              />
            </div>
            <label htmlFor="local" className="sr-only">
              Local
            </label>
            <select
              id="local"
              value={place}
              onChange={(e) => {
                resetPaging();
                setPlace(e.target.value);
              }}
              className="h-12 w-full rounded-md border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
            >
              <option value="">Todos os locais</option>
              {nearbyPlaces ? (
                <option value={NEARBY}>
                  Até {NEARBY_RADIUS_KM} km de você ({nearbyCount})
                </option>
              ) : null}
              {places.map(([key, count]) => {
                const [city, uf] = key.split("|");
                return (
                  <option key={key} value={key}>
                    {city}
                    {uf ? `, ${uf}` : ""} ({count})
                  </option>
                );
              })}
            </select>
            <label htmlFor="periodo" className="sr-only">
              Data
            </label>
            <select
              id="periodo"
              value={period}
              onChange={(e) => {
                resetPaging();
                const next = e.target.value as Period;
                if (next === "custom" && period !== "custom" && today) {
                  setFrom(range.from ?? addDays(today, -6));
                  setTo(range.to ?? today);
                }
                setPeriod(next);
              }}
              className="h-12 w-full rounded-md border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {period === "custom" ? (
            <div className="mt-2 grid grid-cols-2 gap-2 md:ml-auto md:max-w-[27.5rem]">
              <label className="flex items-center gap-2 text-sm font-medium">
                De
                <input
                  type="date"
                  value={from}
                  max={to || today || undefined}
                  onChange={(e) => {
                    resetPaging();
                    setFrom(e.target.value);
                  }}
                  className="h-12 w-full rounded-md border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                Até
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => {
                    resetPaging();
                    setTo(e.target.value);
                  }}
                  className="h-12 w-full rounded-md border-2 border-ink bg-paper px-3 text-sm text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
                />
              </label>
            </div>
          ) : null}

          <div
            role="group"
            aria-label="Escolher um dia"
            className="-mx-4 mt-3 flex snap-x scroll-px-4 gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10"
          >
            {stripDays
              ? stripDays.map((day, i) => {
                  const count = countByDate.get(day) ?? 0;
                  const parts = dayParts(day);
                  const label = i === 0 ? "hoje" : i === 1 ? "ontem" : parts.weekday;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={count === 0}
                      aria-pressed={selectedDay === day}
                      aria-label={`${fullDateLabel(day)}: ${count === 0 ? "sem eventos" : count === 1 ? "1 evento" : `${count} eventos`}`}
                      onClick={() => pickDay(day)}
                      className="flex h-10 shrink-0 snap-start items-baseline gap-1.5 rounded-full border-2 border-ink/15 px-3 pt-1.5 transition-colors duration-150 hover:border-ink disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-35 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-yellow"
                    >
                      <span className="text-[0.7rem] font-semibold uppercase tracking-wide">{label}</span>
                      <span className="font-display text-xl font-black leading-none tabular-nums">{parts.day}</span>
                    </button>
                  );
                })
              : Array.from({ length: STRIP_DAYS }, (_, i) => (
                  <div key={i} className="h-10 w-20 shrink-0 rounded-full bg-ink/5" aria-hidden />
                ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <p className="sr-only" aria-live="polite">
          {countLabel}
        </p>
        {filtered.length === 0 ? (
          <div className="py-12">
            <p className="font-display text-3xl font-extrabold uppercase">Nenhum evento com esses filtros</p>
            <p className="mt-2 max-w-prose text-graphite">
              Tente os dias vizinhos, outro local ou busque só pelo nome do evento.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink/85"
            >
              Ver todos os eventos
            </button>
          </div>
        ) : (
          <div className="pb-16">
            {groups.map((group, gi) => (
              <section key={group.month} aria-label={monthLabel(`${group.month}-01`)} className={gi === 0 ? "pt-5" : "pt-10"}>
                <div className="flex min-h-9 items-center justify-between gap-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-graphite">
                    {monthLabel(`${group.month}-01`)}
                  </h3>
                  {gi === 0 ? (
                    <p className="flex items-center gap-3 text-sm text-graphite">
                      <span className="tabular-nums">{countLabel}</span>
                      {hasFilters ? (
                        <button
                          type="button"
                          onClick={clearAll}
                          className="inline-flex h-9 items-center gap-1 rounded-md px-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                        >
                          <X className="size-4" aria-hidden />
                          Limpar filtros
                        </button>
                      ) : null}
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-10 min-[560px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {group.events.map((event, i) => (
                    <EventCard key={event.id} event={event} priority={gi === 0 && i < 2} />
                  ))}
                </div>
              </section>
            ))}

            {filtered.length > visible ? (
              <div className="mt-12 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex h-12 items-center rounded-md border-2 border-ink px-6 font-display text-lg font-extrabold uppercase tracking-wide text-ink hover:bg-ink hover:text-yellow"
                >
                  Mostrar mais eventos
                </button>
                <p className="text-sm text-graphite tabular-nums">
                  Mostrando {shown.length} de {filtered.length}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
