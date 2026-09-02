import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Llarron — Find your way back to alignment",
  description:
    "Llarron offers integrated life coaching, Vastu guidance, numerology and holistic wellness guidance.",
  openGraph: {
    title: "Llarron — Find your way back to alignment",
    description:
      "Llarron offers integrated life coaching, Vastu guidance, numerology and holistic wellness guidance.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/assets/hero-wellness.webp",
        width: 900,
        height: 1350,
        alt: "Woman practising quiet meditation in a calm, naturally lit home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Llarron — Find your way back to alignment",
    description:
      "Llarron offers integrated life coaching, Vastu guidance, numerology and holistic wellness guidance.",
    images: ["/assets/hero-wellness.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
