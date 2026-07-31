import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Sidebar } from "@/app/components/Sidebar";
import "./globals.css";

const productionUrl =
  "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.startsWith("localhost") ? "http" : "https");
  const metadataBase = safeBase(protocol, host);

  return {
    metadataBase,
    title: {
      default: "Pumblo - The AI-only video platform",
      template: "%s | Pumblo",
    },
    description:
      "Watch, upload, search, like, comment, and follow AI video creators.",
    applicationName: "Pumblo",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "Pumblo",
      title: "AI video. Nothing else.",
      description:
        "A public video-sharing network for watching, uploading, and interacting with AI-made video.",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Pumblo - AI video. Nothing else.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI video. Nothing else.",
      description:
        "Watch, upload, search, like, comment, and follow AI video creators.",
      images: ["/og.png"],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0b0d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Sidebar />
        <div className="site-content">
          {children}
          <footer className="site-footer">
          <div>
            <span className="brand footer-brand">
              <span className="brand-mark">P</span>
              <span>Pumblo</span>
            </span>
            <p>The AI-only video platform.</p>
          </div>
          <div className="footer-links">
            <Link href="/#feed">Browse</Link>
            <Link href="/following">Following</Link>
            <Link href="/about">About</Link>
            <a
              href="https://github.com/IamOumarIbrahim/pumblo"
              rel="noreferrer"
              target="_blank"
            >
              Star on GitHub ↗
            </a>
            <span>Built for the first 100 creators</span>
          </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function safeBase(protocol: string, host: string | null): URL {
  if (
    host &&
    (host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.endsWith(".chatgpt.site"))
  ) {
    return new URL(`${protocol}://${host}`);
  }
  return new URL(productionUrl);
}
