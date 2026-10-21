import { Plus_Jakarta_Sans, Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://forma.studio"),
  title: {
    default: "Forma — AI-Powered Landing Page Studio",
    template: "%s | Forma",
  },
  description:
    "Forma lets you build powerful, fully functional landing pages in minutes using only your words — no coding required. Complete with bespoke typography, curated colors, and motion choreography.",
  applicationName: "Forma Studio",
  keywords: [
    "AI landing page builder",
    "AI website generator",
    "landing page studio",
    "automated web design",
    "Next.js landing page builder",
    "Tailwind CSS landing page",
    "GSAP web design",
    "conversion-focused landing pages",
    "Forma Studio",
  ],
  authors: [{ name: "Forma Studio Inc.", url: "https://forma.studio" }],
  creator: "Forma Studio Inc.",
  publisher: "Forma Studio Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Forma — AI-Powered Landing Page Studio",
    description:
      "Build powerful, fully functional landing pages in minutes using only your words — no coding required.",
    url: "https://forma.studio",
    siteName: "Forma Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Forma — AI-Powered Landing Page Studio",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forma — AI-Powered Landing Page Studio",
    description:
      "Build powerful, fully functional landing pages in minutes using only your words — no coding required.",
    images: ["/og-image.png"],
    creator: "@formastudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#FAF7F0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Forma Studio",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "url": "https://forma.studio",
        "image": "https://forma.studio/forma-icon.png",
        "description":
          "AI-powered builder for high-converting, production-ready landing pages with visual inline editing and clean React/Tailwind source code export.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "publisher": {
          "@type": "Organization",
          "name": "Forma Studio Inc.",
          "logo": {
            "@type": "ImageObject",
            "url": "https://forma.studio/forma-logo.png",
          },
        },
      },
      {
        "@type": "WebSite",
        "name": "Forma",
        "url": "https://forma.studio",
        "description": "AI-Powered Landing Page Studio",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://forma.studio/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} ${serifFont.variable} ${monoFont.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F0] text-[#171717] antialiased selection:bg-[#FF5A1F] selection:text-white">
        {children}
      </body>
    </html>
  );
}
