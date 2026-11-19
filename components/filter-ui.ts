import type { KeyboardEvent } from "react";

export const FILTER_TRIGGER =
  "group flex h-12 w-full min-w-0 items-center gap-1.5 rounded-md border-2 border-ink bg-paper px-2.5 text-left sm:gap-2 sm:px-3 text-sm text-ink transition-colors duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/25 data-[state=open]:bg-ink data-[state=open]:text-yellow";

export const FILTER_CHEVRON = "ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180";

export const FILTER_PANEL =
  "z-50 rounded-md border-2 border-ink bg-paper text-ink shadow-[4px_4px_0_var(--color-ink)] origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-[filter-in_180ms_cubic-bezier(0.25,1,0.5,1)] focus:outline-none";

export const FILTER_ROW =
  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-100 hover:bg-yellow focus-visible:bg-yellow focus-visible:outline-none disabled:cursor-default disabled:hover:bg-transparent";

export function moveFocus(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>("input, button:not(:disabled)")];
  const at = items.indexOf(document.activeElement as HTMLElement);
  const next = e.key === "ArrowDown" ? Math.min(at + 1, items.length - 1) : Math.max(at - 1, 0);
  items[next]?.focus();
}
