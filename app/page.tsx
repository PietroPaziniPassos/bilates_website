import { EventFinder } from "@/components/event-finder";
import { Hero } from "@/components/sections";
import { getCatalog } from "@/lib/foco";

export const revalidate = 1800;

export default async function EventsPage() {
  const catalog = await getCatalog();

  return (
    <>
      <Hero />
      <EventFinder events={catalog.events} />
    </>
  );
}
