import Link from "next/link";
import { CONTACT } from "@/lib/site";
import { NavLinks } from "./nav-links";

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

const instagramLink = (
  <a
    href={`https://instagram.com/${CONTACT.instagram}`}
    target="_blank"
    rel="noopener"
    aria-label={`Instagram @${CONTACT.instagram}`}
    className="inline-flex size-10 items-center justify-center rounded-sm hover:text-yellow"
  >
    <InstagramIcon className="size-5" />
  </a>
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 px-4 sm:h-14 sm:flex-nowrap sm:px-6 lg:px-10">
        <Link href="/" className="flex h-12 items-baseline gap-2 rounded-sm pt-3 sm:h-auto sm:pt-0">
          <span className="font-display text-2xl font-black uppercase leading-none tracking-tight text-yellow">
            Bilates
          </span>
          <span className="hidden text-xs uppercase tracking-[0.16em] text-paper/70 md:inline">
            fotografia esportiva
          </span>
        </Link>
        <span className="sm:hidden">{instagramLink}</span>
        <nav
          aria-label="Principal"
          className="-mx-2 flex w-full items-center justify-between border-t border-paper/10 sm:mx-0 sm:w-auto sm:justify-end sm:gap-2 sm:border-0"
        >
          <NavLinks />
          <span className="hidden sm:inline">{instagramLink}</span>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm sm:px-6 lg:px-10">
        <p>
          <span className="font-display text-base font-black uppercase text-yellow">Bilates</span> · fotos vendidas
          pela Foco Radical
        </p>
      </div>
    </footer>
  );
}
