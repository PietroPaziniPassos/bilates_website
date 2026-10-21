import type { Metadata } from "next";
import { Contact, Stores } from "@/components/sections";

export const metadata: Metadata = {
  title: "Contato",
  description: "Instagram, e-mail e as lojas do Marcos Bilate na Foco Radical.",
};

export default function ContactPage() {
  return (
    <>
      <Contact />
      <Stores />
    </>
  );
}
