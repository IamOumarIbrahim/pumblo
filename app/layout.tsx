import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Header } from "@/app/components/Header";
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
      default: "Pumblo - Film pages for AI motion creators",
      template: "%s | Pumblo",
    },
    description:
      "Publish an AI film with its tools, workflow, license, creator profile, and feedback attached.",
    applicationName: "Pumblo",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "Pumblo",
      title: "Give the clip a home. Keep the process.",
      description:
        "Shareable film pages for AI motion creators, with the process and feedback attached.",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Pumblo - Give the clip a home. Keep the process.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Give the clip a home. Keep the process.",
      description:
        "Shareable film pages for AI motion creators, with the process and feedback attached.",
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
        {children}
        <footer className="site-footer">
          <div>
            <span className="brand footer-brand">
              <span className="brand-mark">P</span>
              <span>Pumblo</span>
            </span>
            <p>Film pages for AI motion creators.</p>
          </div>
          <div className="footer-links">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/about">Product philosophy</Link>
            <a
              href="https://github.com/IamOumarIbrahim/pumblo"
              rel="noreferrer"
              target="_blank"
            >
              Star on GitHub ↗
            </a>
            <span>Open beta · no follower minimum</span>
          </div>
        </footer>
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
