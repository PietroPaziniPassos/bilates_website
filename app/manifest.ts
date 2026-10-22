import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · Fotos de treinos em Camburi`,
    short_name: SITE_NAME,
    description: "Ache suas fotos de treino e corrida na Praia de Camburi na Foco Radical.",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    background_color: "#ffffff",
    theme_color: "#fee900",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
