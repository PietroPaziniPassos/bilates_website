"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { FILTER_CHEVRON, FILTER_PANEL, FILTER_ROW, FILTER_TRIGGER, moveFocus } from "./filter-ui";

export type City = { id: number; stateId: number; name: string; stateAbbr: string };

type Lookup = { query: string; status: "loading" | "done" | "error"; cities: City[] };

const cityLabel = (city: City) => `${city.name}, ${city.stateAbbr}`;

export function CityPicker({ id, value, onChange }: { id: string; value: City; onChange: (city: City) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const term = query.trim();

  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      setLookup({ query: term, status: "loading", cities: [] });
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 8_000);
      try {
        const res = await fetch(`/api/cidades?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: { cities: City[] } = await res.json();
        setLookup({ query: term, status: "done", cities: data.cities });
      } catch {
        if (timedOut || !controller.signal.aborted) setLookup({ query: term, status: "error", cities: [] });
      } finally {
        clearTimeout(timeout);
      }
    }, 250);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [term]);

  function choose(city: City) {
    onChange(city);
    setOpen(false);
    setQuery("");
  }

  const current = lookup?.query === term ? lookup : null;
  const results = term.length < 2 ? [value] : (current?.cities ?? []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger id={id} className={FILTER_TRIGGER}>
        <MapPin className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{cityLabel(value)}</span>
        <ChevronDown className={FILTER_CHEVRON} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className={`${FILTER_PANEL} w-[max(var(--radix-popover-trigger-width),18rem)] max-w-[calc(100vw-2rem)] overflow-hidden`}
        >
          <div role="group" aria-label="Escolher cidade" onKeyDown={moveFocus}>
            <div className="relative border-b-2 border-ink/10">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite a cidade"
                aria-label="Buscar cidade"
                autoComplete="off"
                enterKeyHint="search"
                autoFocus
                className="h-12 w-full bg-transparent pl-9 pr-3 text-base text-ink placeholder:text-graphite/80 focus:outline-none"
              />
            </div>
            <div className="max-h-[min(20rem,calc(var(--radix-popover-content-available-height)-4rem))] overflow-y-auto overscroll-contain py-1">
              {current?.status === "loading" || (term.length >= 2 && !current) ? (
                <p className="flex items-center gap-2 px-3 py-2.5 text-sm text-graphite" role="status">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Buscando cidades
                </p>
              ) : current?.status === "error" ? (
                <p className="px-3 py-2.5 text-sm text-graphite" role="status">
                  Não conseguimos buscar cidades agora. Tente de novo.
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-graphite" role="status">
                  Nenhuma cidade com esse nome
                </p>
              ) : (
                results.map((city) => {
                  const selected = city.id === value.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(city)}
                      className={FILTER_ROW}
                    >
                      <span className={`truncate ${selected ? "font-semibold" : ""}`}>{cityLabel(city)}</span>
                      <Check className={`ml-auto size-4 shrink-0 ${selected ? "" : "invisible"}`} aria-hidden />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
