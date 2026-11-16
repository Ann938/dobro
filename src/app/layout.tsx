import type { Metadata, Viewport } from "next";
import { Golos_Text, Lora } from "next/font/google";
import "@/styles/globals.scss";

// Заголовки — тёплая антиква Lora, текст — Golos Text.
const display = Lora({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});
const sans = Golos_Text({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const title = "Добро — приют для собак и кошек";
const description = "Концепт сайта приюта: найдите друга, узнайте, как забрать его домой, или помогите тем, кто ждёт.";

export const metadata: Metadata = {
  // опубликованный концепт не должен попадать в поиск
  robots: process.env.PAGES_EXPORT === "1" ? { index: false, follow: false } : undefined,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN || "http://localhost:3600"),
  title,
  description,
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg` },
  openGraph: { title, description, type: "website", locale: "ru_RU" },
};

export const viewport: Viewport = {
  themeColor: "#ebe1ce",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
