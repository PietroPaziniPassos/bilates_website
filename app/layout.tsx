import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fotos de treinos em Camburi na Foco Radical · Bilates",
    template: "%s · Bilates",
  },
  description:
    "Ache suas fotos de treino e corrida na Praia de Camburi, em Vitória (ES). Todos os eventos na Foco Radical, com busca por dia e local.",
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fee900",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bigShoulders.variable} ${archivo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
