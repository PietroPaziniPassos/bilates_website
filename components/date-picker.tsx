"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { fullDateLabel, shortDateLabel } from "@/lib/dates";
import { FILTER_CHEVRON, FILTER_PANEL, FILTER_TRIGGER } from "./filter-ui";

// O DayPicker trabalha com Date local; o resto do site com ISO. Converter pelos campos locais
// evita que o fuso desloque o dia na ida ou na volta.
function isoToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const NAV_BUTTON =
  "inline-flex size-10 items-center justify-center rounded-full transition-colors duration-100 hover:bg-yellow aria-disabled:cursor-default aria-disabled:opacity-25 aria-disabled:hover:bg-transparent";

type Props = {
  value: string;
  onChange: (day: string) => void;
  countByDate: Map<string, number>;
  firstDay: string | null;
  today: string | null;
};

export function DatePicker({ value, onChange, countByDate, firstDay, today }: Props) {
  const [open, setOpen] = useState(false);
  const selected = value ? isoToDate(value) : undefined;
  const hasEvents = (date: Date) => countByDate.has(dateToIso(date));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={FILTER_TRIGGER}
        aria-label={value ? `Data: ${fullDateLabel(value)}` : "Data: qualquer data"}
      >
        <CalendarDays className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{value ? shortDateLabel(value) : "Qualquer data"}</span>
        <ChevronDown className={FILTER_CHEVRON} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} collisionPadding={16} className={FILTER_PANEL}>
          <DayPicker
            mode="single"
            locale={ptBR}
            selected={selected}
            onSelect={(date) => {
              onChange(date ? dateToIso(date) : "");
              setOpen(false);
            }}
            defaultMonth={selected ?? (today ? isoToDate(today) : undefined)}
            startMonth={firstDay ? isoToDate(firstDay) : undefined}
            endMonth={today ? isoToDate(today) : undefined}
            disabled={(date) => !hasEvents(date)}
            modifiers={{ comEvento: hasEvents }}
            modifiersClassNames={{
              comEvento:
                "[&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:size-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-dawn",
            }}
            navLayout="around"
            showOutsideDays={false}
            fixedWeeks
            autoFocus
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft className="size-5" aria-hidden />
                ) : (
                  <ChevronRight className="size-5" aria-hidden />
                ),
            }}
            classNames={{
              root: "p-3 text-ink",
              months: "relative",
              month: "grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-y-2",
              month_caption: "flex justify-center",
              caption_label: "font-display text-xl font-extrabold uppercase tracking-wide",
              button_previous: NAV_BUTTON,
              button_next: NAV_BUTTON,
              month_grid: "col-span-3 border-collapse",
              weekdays: "",
              weekday: "pb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-graphite",
              week: "",
              day: "p-0.5 text-center",
              day_button:
                "relative mx-auto flex size-10 items-center justify-center rounded-full font-display text-lg font-bold tabular-nums transition-colors duration-100 hover:bg-yellow focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-default disabled:font-medium disabled:text-graphite/35 disabled:hover:bg-transparent",
              selected: "[&>button]:bg-ink [&>button]:text-yellow [&>button]:hover:bg-ink [&>button]:after:bg-yellow",
              today: "[&>button]:underline [&>button]:decoration-2 [&>button]:underline-offset-4",
              outside: "invisible",
              footer: "mt-2 border-t-2 border-ink/10 pt-2",
            }}
            footer={
              value ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="h-10 w-full rounded-md text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink"
                >
                  Ver qualquer data
                </button>
              ) : undefined
            }
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
