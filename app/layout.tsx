import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
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
  metadataBase: new URL("https://bilates.vercel.app"),
  title: {
    default: "Bilates · Fotos dos seus eventos na Foco Radical",
    template: "%s · Bilates",
  },
  description:
    "Ache suas fotos de corrida, treino e triathlon por Marcos Bilate. Todos os eventos das lojas na Foco Radical, com busca por data e local.",
  openGraph: {
    title: "Marcos Bilate · Ache suas fotos",
    description: "Todos os eventos das lojas do Marcos Bilate na Foco Radical, com busca por data e local.",
    images: ["/orla-de-camburi.jpg"],
    locale: "pt_BR",
    type: "website",
  },
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
