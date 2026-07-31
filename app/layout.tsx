import type { Metadata, Viewport } from "next";
import { Header } from "@/app/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pumblo - The home of AI video",
    template: "%s | Pumblo",
  },
  description:
    "Discover and share AI-generated films from accountable human creators.",
  openGraph: {
    type: "website",
    siteName: "Pumblo",
    title: "Pumblo - The home of AI video",
    description:
      "Every video AI-generated. Every creator human-accountable.",
    images: [
      {
        url: "https://raw.githubusercontent.com/IamOumarIbrahim/pumblo/main/public/pumblo-social.png",
        width: 1200,
        height: 630,
        alt: "Pumblo - The home of AI video",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pumblo - The home of AI video",
    description:
      "Every video AI-generated. Every creator human-accountable.",
    images: [
      "https://raw.githubusercontent.com/IamOumarIbrahim/pumblo/main/public/pumblo-social.png",
    ],
  },
};

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
            <p>AI-made stories. Human-made reputations.</p>
          </div>
          <div className="footer-links">
            <a href="https://github.com/IamOumarIbrahim/pumblo">
              Open source
            </a>
            <LinkLike href="/about">Trust & safety</LinkLike>
            <span>Closed beta · 10 creators</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

function LinkLike({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return <a href={href}>{children}</a>;
}
