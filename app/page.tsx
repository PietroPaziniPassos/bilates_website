import { EventFinder } from "@/components/event-finder";
import { Hero } from "@/components/sections";
import { getCatalog } from "@/lib/foco";
import { pageMetadata, siteJsonLd } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = pageMetadata({
  title: "Fotos de treinos em Camburi na Foco Radical · Bilates",
  description:
    "Ache suas fotos de treino e corrida na Praia de Camburi, em Vitória (ES). Todos os eventos na Foco Radical, com busca por dia e local.",
  path: "/",
});

export default async function EventsPage() {
  const catalog = await getCatalog();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <EventFinder events={catalog.events} />
    </>
  );
}
