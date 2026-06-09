import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bolalar Uchun Ertak — AI Ertak Yaratuvchi",
  description:
    "Bolalar uchun o'zbek tilida ta'limiy ertaklar yarating. Sun'iy intellekt yordamida original, axloqiy va qiziqarli ertaklar.",
  keywords: ["ertak", "bolalar", "o'zbek", "ta'lim", "AI", "sun'iy intellekt", "uzbek children stories"],
  authors: [{ name: "Bolalar Uchun Ertak" }],
  openGraph: {
    title: "Bolalar Uchun Ertak — AI Ertak Yaratuvchi",
    description: "O'zbek tilida ta'limiy ertaklar yarating",
    type: "website",
    locale: "uz_UZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bolalar Uchun Ertak",
    description: "O'zbek tilida ta'limiy ertaklar yarating",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${nunito.variable} ${baloo.variable}`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
