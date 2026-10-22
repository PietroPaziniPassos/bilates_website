import type { Metadata } from "next";
import { CONTACT, PHOTOGRAPHER, STORES, storeUrl } from "./site";

export const SITE_URL = "https://www.bilates.com.br";
export const SITE_NAME = "Bilates";

export const KEYWORDS = [
  "fotos Camburi",
  "fotos praia de Camburi",
  "fotos treino Camburi",
  "fotos treino orla de Camburi",
  "treino orla de Camburi",
  "fotos corrida Camburi",
  "fotos corrida Vitória ES",
  "Foco Radical",
  "Foco Radical Camburi",
  "fotos Foco Radical",
];

const OG_IMAGE_ALT = "Nascer do sol entre os coqueiros da Praia de Camburi, em Vitória";

type PageSeo = { title: string; description: string; path: string };

// O openGraph de uma página substitui o do layout inteiro, inclusive o app/opengraph-image.jpg, então cada rota
// monta o seu a partir daqui e aponta a imagem de novo.
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: OG_IMAGE_ALT }],
    },
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#negocio` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#negocio`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Fotos de treinos e corridas na Praia de Camburi, em Vitória (ES), à venda na Foco Radical.",
        image: `${SITE_URL}/orla-de-camburi.jpg`,
        email: CONTACT.email,
        address: { "@type": "PostalAddress", addressLocality: "Vitória", addressRegion: "ES", addressCountry: "BR" },
        areaServed: [
          { "@type": "Place", name: "Praia de Camburi, Vitória, ES" },
          { "@type": "City", name: "Vitória" },
        ],
        knowsAbout: ["fotografia esportiva", "fotos de treino em Camburi", "fotos de corrida", "Foco Radical"],
        founder: { "@type": "Person", name: PHOTOGRAPHER.name, jobTitle: "Fotógrafo" },
        sameAs: [`https://instagram.com/${CONTACT.instagram}`, ...STORES.map((s) => storeUrl(s.key))],
      },
    ],
  };
}
