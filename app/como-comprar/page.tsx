import type { Metadata } from "next";
import { HowToBuy } from "@/components/sections";

export const metadata: Metadata = {
  title: "Como comprar",
  description: "Como achar, comprar e baixar suas fotos do Marcos Bilate na Foco Radical.",
};

export default function HowToBuyPage() {
  return <HowToBuy />;
}
