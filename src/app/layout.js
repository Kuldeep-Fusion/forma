import { Plus_Jakarta_Sans, Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PresenceHeartbeat from "../components/telemetry/PresenceHeartbeat.js";

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

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const raw = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (raw && !raw.startsWith("http://localhost") && !raw.startsWith("http://127.0.0.1")) {
      return raw.startsWith("http") ? raw : `https://${raw}`;
    }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "https://forma.studio";
}

const siteUrl = getBaseUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
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
  authors: [{ name: "Forma Studio Inc.", url: siteUrl }],
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
    url: siteUrl,
    siteName: "Forma Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 675,
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
        "alternateName": "Forma AI Landing Page Builder",
        "applicationCategory": "DesignApplication, DeveloperApplication",
        "operatingSystem": "All modern web browsers (Chrome, Safari, Firefox, Edge)",
        "url": siteUrl,
        "image": `${siteUrl}/og-image.png`,
        "screenshot": `${siteUrl}/og-image.png`,
        "description":
          "Forma is an autonomous AI-powered landing page studio that synthesizes complete, editable, production-ready landing pages from plain text prompts using Google Gemini and Next.js.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
        },
        "featureList": [
          "Autonomous text-to-landing-page AI synthesis",
          "Visual drag-and-free inline editor with live canvas preview",
          "Multimodal image reference styling and palette extraction",
          "Curated design systems with bespoke typography and colors",
          "Instant production-ready React 18 and Tailwind CSS 3.4 export",
          "Export complete runnable ZIP project bundles",
          "Real-time social telemetry and active builder counters",
        ],
        "publisher": {
          "@type": "Organization",
          "name": "Forma Studio Inc.",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/forma-logo.png`,
          },
        },
      },
      {
        "@type": "WebSite",
        "name": "Forma",
        "url": siteUrl,
        "description": "AI-Powered Landing Page Studio — Build powerful landing pages using only your words",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Forma and how does it generate landing pages?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Forma is an autonomous AI landing page studio. Users describe their product, business idea, or startup in plain natural language, and Forma's neural engine uses Google Gemini to architect complete, responsive landing pages with high-converting copy, bespoke color palettes, and interactive sections in under 15 seconds.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I customize the generated landing page in a visual editor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Forma includes an inline visual canvas editor where you can click and edit any text, swap images, modify section themes, adjust animations, reorder blocks, and configure lead generation forms with real-time responsive preview.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I export clean React and Tailwind CSS source code from Forma?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Forma provides zero vendor lock-in. You can copy clean, production-ready React 18 and Tailwind CSS source code with one click, or download a complete, runnable Next.js project archive as a ZIP file.",
            },
          },
          {
            "@type": "Question",
            "name": "What AI models power Forma Studio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Forma is powered by Google's state-of-the-art Gemini multimodal models (gemini-1.5-flash and gemini-2.0-flash), ensuring sub-second response times, persuasive marketing copywriting, and validated structured schema outputs.",
            },
          },
          {
            "@type": "Question",
            "name": "Is Forma free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Forma provides a generous free tier allowing anyone to generate, visually customize, preview, and export full React landing pages without upfront payment or credit card requirements.",
            },
          },
        ],
      },
      {
        "@type": "HowTo",
        "name": "How to Build a High-Converting Landing Page with Forma",
        "description": "Step-by-step guide to generating, refining, and exporting a custom landing page in minutes using Forma AI.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Enter your prompt or idea",
            "text": "Describe your product, audience, and value proposition into Forma's prompt composer or select from curated starter prompts.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Autonomous AI synthesis",
            "text": "Forma's engine generates layout sections, bespoke typography, conversion copy, and kinetic animations in seconds.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Inline visual customization",
            "text": "Use the visual editor to fine-tune copy, change color palettes, upload custom assets, or add lead capture forms.",
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Export clean code or publish",
            "text": "Export clean React + Tailwind CSS code or download a runnable ZIP archive ready for Vercel or Netlify deployment.",
          },
        ],
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
        <PresenceHeartbeat />
        {children}
      </body>
    </html>
  );
}
