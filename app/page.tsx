import { EventFinder } from "@/components/event-finder";
import { SelfieBand } from "@/components/sections";
import { SelfieSearch } from "@/components/selfie-search";
import { getCatalog } from "@/lib/foco";
import { pageMetadata, siteJsonLd } from "@/lib/seo";

export const revalidate = 1800;

export const metadata = pageMetadata({
  title: "Fotos de treinos e corridas na Foco Radical",
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
      <h1 className="sr-only">Ache suas fotos</h1>
      <EventFinder events={catalog.events}>
        <SelfieBand>
          <SelfieSearch />
        </SelfieBand>
      </EventFinder>
    </>
  );
}
