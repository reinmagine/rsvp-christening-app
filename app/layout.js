import { Inter, Jua } from "next/font/google";
import "./globals.css";
import { eventConfig } from "@/lib/config";

const jua = Jua({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jua",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: eventConfig.siteTitle,
  description: eventConfig.siteDescription,
  openGraph: {
    title: eventConfig.siteTitle,
    description: eventConfig.siteDescription,
    images: [eventConfig.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: eventConfig.siteTitle,
    description: eventConfig.siteDescription,
    images: [eventConfig.ogImage],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F0A7AE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jua.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
