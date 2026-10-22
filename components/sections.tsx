import { ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import { CONTACT, PHOTOGRAPHER, STORES, storeUrl } from "@/lib/site";
import { InstagramIcon } from "./site-chrome";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <Image
        src="/orla-de-camburi.jpg"
        alt="Nascer do sol entre os coqueiros da Orla de Camburi, em Vitória"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_60%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20" aria-hidden />
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-4 pt-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-5 sm:pt-14 lg:px-10">
        <div>
          <p className="text-xs font-medium text-paper/85 sm:text-sm">
            {PHOTOGRAPHER.name} · {PHOTOGRAPHER.city}
          </p>
          <h1 className="mt-1 font-display text-[clamp(2.5rem,8vw,4.75rem)] font-black uppercase leading-[0.85] tracking-tight text-yellow">
            Ache suas fotos
          </h1>
        </div>
        <p className="text-sm text-paper/90 sm:pb-1 sm:text-base">
          Marque a gente no Instagram!{" "}
          <a
            href={`https://instagram.com/${CONTACT.instagram}`}
            target="_blank"
            rel="noopener"
            className="font-semibold text-yellow underline decoration-yellow/40 decoration-2 underline-offset-4 hover:decoration-yellow"
          >
            @{CONTACT.instagram}
          </a>
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Ache o evento aqui",
    body: "Na aba Eventos, filtre pelo dia em que você correu e toque no evento. Ele abre na loja do Marcos na Foco Radical, onde a compra acontece.",
  },
  {
    title: "Encontre suas fotos",
    body: "Envie uma selfie para a busca por rosto ou digite seu número de peito. Se não aparecer, procure na galeria de fotos não identificadas.",
  },
  {
    title: "Escolha e coloque no carrinho",
    body: "Selecione as fotos e a resolução. Quando o evento tem pacote, o botão de desconto aparece logo depois da busca.",
  },
  {
    title: "Finalize a compra",
    body: "Entre ou crie sua conta na Foco Radical, escolha a forma de pagamento e conclua o pedido.",
  },
  {
    title: "Baixe as fotos",
    body: "Use o botão Download do e-mail de confirmação ou o menu Baixar fotos no site da Foco. O download fica liberado por 90 dias.",
  },
];

const RESOLUTIONS = [
  { name: "Baixa", px: "1.500 px" },
  { name: "Média", px: "2.700 px" },
  { name: "Alta", px: "3.450 px" },
];

export function HowToBuy() {
  return (
    <section aria-labelledby="como-comprar-titulo" className="min-h-[calc(100dvh-10rem)] bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10">
        <div>
          <h1
            id="como-comprar-titulo"
            className="font-display text-[clamp(2.75rem,7vw,5rem)] font-black uppercase leading-[0.88] text-yellow"
          >
            Como comprar
          </h1>
          <p className="mt-4 max-w-md text-paper/80">
            A venda é feita pela Foco Radical, com pagamento e download por lá. As fotos ficam à venda em alta
            resolução por 6 meses depois do evento.
          </p>

          <div className="mt-10 max-w-md">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-paper">
              Resoluções
            </h2>
            <dl className="mt-3 divide-y divide-paper/15 border-y border-paper/15">
              {RESOLUTIONS.map((r) => (
                <div key={r.name} className="grid grid-cols-[5.5rem_1fr] items-baseline gap-2 py-2.5 text-sm">
                  <dt className="font-semibold text-paper">{r.name}</dt>
                  <dd className="tabular-nums text-paper/60">{r.px}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-paper/15 py-6 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr]"
            >
              <span
                className="font-display text-5xl font-black leading-none text-yellow tabular-nums sm:text-6xl"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h2 className="font-display text-2xl font-extrabold uppercase leading-tight">{step.title}</h2>
                <p className="mt-1.5 max-w-prose text-paper/80">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Stores() {
  return (
    <section aria-labelledby="lojas-titulo">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10">
        <h2 id="lojas-titulo" className="font-display text-4xl font-black uppercase leading-none md:text-5xl">
          As lojas na Foco Radical
        </h2>
        <p className="mt-3 max-w-xl text-graphite">
          A aba Eventos junta estas três lojas. Se preferir, navegue direto por elas.
        </p>
        <ul className="mt-8 border-t-2 border-ink">
          {STORES.map((store) => (
            <li key={store.key} className="border-b border-line">
              <a
                href={storeUrl(store.key)}
                target="_blank"
                rel="noopener"
                className="group flex items-center gap-4 py-5 outline-offset-4"
              >
                <span className="flex-1">
                  <span className="block font-display text-2xl font-extrabold uppercase leading-tight group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                    {store.label}
                  </span>
                  <span className="block text-sm text-graphite">{store.host}</span>
                </span>
                <ArrowUpRight
                  className="size-6 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section aria-labelledby="contato-titulo" className="bg-yellow text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-end md:py-20 lg:px-10">
        <div>
          <h1
            id="contato-titulo"
            className="font-display text-[clamp(2.75rem,7vw,5rem)] font-black uppercase leading-[0.88]"
          >
            Fale com o Marcos
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <Image
              src={PHOTOGRAPHER.photo}
              alt={`Retrato de ${PHOTOGRAPHER.name}`}
              width={88}
              height={88}
              className="size-22 rounded-full border-2 border-ink object-cover"
            />
            <div>
              <p className="font-display text-2xl font-extrabold uppercase leading-tight">{PHOTOGRAPHER.name}</p>
              <p className="text-sm">{PHOTOGRAPHER.bio}</p>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-4 md:items-end">
          <li>
            <a
              href={`https://instagram.com/${CONTACT.instagram}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 text-xl font-semibold underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink sm:text-2xl"
            >
              <InstagramIcon className="size-7" />@{CONTACT.instagram}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center gap-3 text-xl font-semibold underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink sm:text-2xl"
            >
              <Mail className="size-7" aria-hidden />
              {CONTACT.email}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
