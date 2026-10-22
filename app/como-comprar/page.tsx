import { HowToBuy } from "@/components/sections";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Como comprar suas fotos na Foco Radical",
  description:
    "Passo a passo para achar, comprar e baixar suas fotos de treino em Camburi na Foco Radical, e qual resolução escolher.",
  path: "/como-comprar",
});

export default function HowToBuyPage() {
  return <HowToBuy />;
}
