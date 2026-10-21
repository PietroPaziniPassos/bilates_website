"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Eventos" },
  { href: "/como-comprar", label: "Como comprar" },
  { href: "/contato", label: "Contato" },
  { href: "/feedback", label: "Feedback" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1 text-sm sm:gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className="inline-flex h-10 items-center rounded-sm px-2 underline-offset-[6px] hover:text-yellow aria-[current=page]:text-yellow aria-[current=page]:underline aria-[current=page]:decoration-2"
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
