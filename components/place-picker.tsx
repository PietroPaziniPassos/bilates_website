"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, LoaderCircle, LocateFixed, MapPin } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { NEARBY_RADIUS_KM } from "@/lib/cidades";
import { FILTER_CHEVRON, FILTER_PANEL, FILTER_TRIGGER } from "./filter-ui";
import type { NearbyStatus } from "./use-nearby";

export const NEARBY = "perto";

const ROW =
  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-100 hover:bg-yellow focus-visible:bg-yellow focus-visible:outline-none disabled:cursor-default disabled:hover:bg-transparent";

function plural(n: number) {
  return `${n} ${n === 1 ? "evento" : "eventos"}`;
}

function placeLabel(key: string) {
  const [city, uf] = key.split("|");
  return uf ? `${city}, ${uf}` : city;
}

const NEARBY_DETAIL: Record<Exclude<NearbyStatus, "unsupported">, (count: number) => string> = {
  asking: () => "Procurando sua localização",
  on: (count) => `Até ${NEARBY_RADIUS_KM} km · ${plural(count)}`,
  empty: () => `Nenhum evento a até ${NEARBY_RADIUS_KM} km de você`,
  denied: () => "Localização bloqueada. Libere no ícone ao lado do endereço do site",
  unavailable: () => "Não achamos sua localização. Toque para tentar de novo",
};

function moveFocus(e: KeyboardEvent<HTMLDivElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
  const at = items.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === "ArrowDown" ? Math.min(at + 1, items.length - 1) : Math.max(at - 1, 0);
  items[next]?.focus();
}

type Props = {
  value: string;
  places: [string, number][];
  total: number;
  nearby: { status: NearbyStatus; count: number; locate: () => void };
  onChange: (value: string) => void;
};

export function PlacePicker({ value, places, total, nearby, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  const label = value === NEARBY ? "Perto de mim" : value ? placeLabel(value) : "Qualquer local";
  const nearbyActionable = nearby.status === "on" || nearby.status === "unavailable";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={FILTER_TRIGGER} aria-label={`Local: ${label}`}>
        {value === NEARBY ? (
          <LocateFixed className="size-4 shrink-0" aria-hidden />
        ) : (
          <MapPin className="size-4 shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
        <ChevronDown className={FILTER_CHEVRON} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className={`${FILTER_PANEL} w-[max(var(--radix-popover-trigger-width),18rem)] max-w-[calc(100vw-2rem)] overflow-hidden`}
        >
          <div
            role="group"
            aria-label="Escolher local"
            onKeyDown={moveFocus}
            className="max-h-[min(26rem,calc(var(--radix-popover-content-available-height)-1rem))] overflow-y-auto overscroll-contain py-1"
          >
            {nearby.status !== "unsupported" ? (
              <>
                <button
                  type="button"
                  disabled={!nearbyActionable}
                  aria-pressed={value === NEARBY}
                  onClick={() => (nearby.status === "on" ? choose(NEARBY) : nearby.locate())}
                  className={`${ROW} items-start py-3`}
                >
                  {nearby.status === "asking" ? (
                    <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <LocateFixed className="mt-0.5 size-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold">Perto de mim</span>
                    <span
                      className="mt-0.5 block text-[0.8rem] text-graphite"
                    >
                      {NEARBY_DETAIL[nearby.status](nearby.count)}
                    </span>
                  </span>
                  {value === NEARBY ? <Check className="ml-auto mt-0.5 size-4 shrink-0" aria-hidden /> : null}
                </button>
                <div className="mx-3 my-1 h-0.5 bg-ink/10" aria-hidden />
              </>
            ) : null}
            <button type="button" aria-pressed={value === ""} onClick={() => choose("")} className={ROW}>
              <span className={value === "" ? "font-semibold" : undefined}>Todos os locais</span>
              <span className="ml-auto tabular-nums text-graphite">{total}</span>
              <Check className={`size-4 shrink-0 ${value === "" ? "" : "invisible"}`} aria-hidden />
            </button>
            {places.map(([key, count]) => (
              <button
                key={key}
                type="button"
                aria-pressed={value === key}
                onClick={() => choose(key)}
                className={ROW}
              >
                <span className={`truncate ${value === key ? "font-semibold" : ""}`}>{placeLabel(key)}</span>
                <span className="ml-auto tabular-nums text-graphite">{count}</span>
                <Check className={`size-4 shrink-0 ${value === key ? "" : "invisible"}`} aria-hidden />
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
