import { ArrowLeft, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InstagramIcon } from "@/components/site-chrome";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Feedback das fotos",
  robots: { index: false },
};

export default function FeedbackPage() {
  return (
    <div className="bg-yellow text-ink">
      <div className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Página em construção</p>
        <h1 className="mt-3 font-display text-[clamp(3rem,10vw,6rem)] font-black uppercase leading-[0.85]">
          Feedback das fotos
        </h1>
        <p className="mt-6 max-w-prose text-lg">
          O formulário ainda está sendo preparado. Enquanto isso, mande sua opinião sobre as fotos direto para o
          Marcos.
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          <li>
            <a
              href={`https://instagram.com/${CONTACT.instagram}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 text-lg font-semibold underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink"
            >
              <InstagramIcon className="size-6" />@{CONTACT.instagram}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Feedback das fotos")}`}
              className="inline-flex items-center gap-3 text-lg font-semibold underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink"
            >
              <Mail className="size-6" aria-hidden />
              {CONTACT.email}
            </a>
          </li>
        </ul>
        <Link
          href="/"
          className="mt-12 inline-flex h-12 w-fit items-center gap-2 rounded-md border-2 border-ink px-5 font-display text-lg font-extrabold uppercase tracking-wide hover:bg-ink hover:text-yellow"
        >
          <ArrowLeft className="size-5" aria-hidden />
          Voltar aos eventos
        </Link>
      </div>
  </div>
);
}
