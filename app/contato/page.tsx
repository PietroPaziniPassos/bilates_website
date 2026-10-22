import { Contact, Stores } from "@/components/sections";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato",
  description: "Instagram, e-mail e as lojas na Foco Radical do fotógrafo dos treinos na Praia de Camburi.",
  path: "/contato",
});

export default function ContactPage() {
  return (
    <>
      <Contact />
      <Stores />
    </>
  );
}
