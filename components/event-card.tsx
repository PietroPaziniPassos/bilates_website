import { ArrowUpRight, Camera } from "lucide-react";
import Image from "next/image";
import { dayParts } from "@/lib/dates";
import type { FocoEvent } from "@/lib/foco";
import { eventUrl } from "@/lib/site";

const photoCount = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

const COVER_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 560px) 45vw, 92vw";

function EventCover({ cover, priority }: { cover: FocoEvent["cover"]; priority?: boolean }) {
  if (cover?.kind === "photo") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink">
        <Image
          src={cover.url}
          alt=""
          fill
          priority={priority}
          sizes={COVER_SIZES}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  // Logo PNG e ícone do esporte vêm sem fundo: precisam de branco e de caber inteiros.
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm border border-line bg-white">
      {cover?.kind === "logo" ? (
        <Image
          src={cover.url}
          alt=""
          fill
          priority={priority}
          sizes={COVER_SIZES}
          className="object-contain p-[10%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : cover ? (
        // O otimizador do next/image não aceita SVG.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.url} alt="" className="h-2/5 w-auto" loading="lazy" />
      ) : (
        <Camera className="size-1/4 text-ink/30" aria-hidden />
      )}
    </div>
  );
}

export function EventCard({ event, priority }: { event: FocoEvent; priority?: boolean }) {
  const { day, month, weekday } = dayParts(event.date);
  const place = [event.city, event.uf].filter(Boolean).join(", ");
  const meta = [`${weekday}, ${day} ${month}`, place, event.photos > 0 ? `${photoCount.format(event.photos)} fotos` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group">
      <a href={eventUrl(event.store, event.path)} target="_blank" rel="noopener" className="flex flex-col rounded-sm outline-offset-4">
        <EventCover cover={event.cover} priority={priority} />
        <h4 className="mt-3 font-display text-xl font-extrabold uppercase leading-[1.05] text-ink text-balance group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
          {event.name}
          <ArrowUpRight className="ml-1 inline size-4 align-baseline opacity-50" aria-hidden />
          <span className="sr-only"> (abre a loja na Foco Radical)</span>
        </h4>
        <p className="mt-1.5 text-sm text-graphite first-letter:uppercase">{meta}</p>
      </a>
    </article>
  );
}
