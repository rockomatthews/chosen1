import type { Metadata } from "next";
import ThemeRegistry from "./theme-registry";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Chosen1";
  const description = "best crypto over the last 5 minutes";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim(); // set by Vercel at runtime/build
  const metadataBase = new URL(
    siteUrl
      ? siteUrl
      : vercelUrl
        ? `https://${vercelUrl}`
        : "http://localhost:3000",
  );

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "og-meta",
      hypothesisId: "J",
      location: "src/app/layout.tsx:generateMetadata",
      message: "Generating metadata (title/og image)",
      data: {
        title,
        description,
        metadataBase: metadataBase.toString(),
        ogImagePath: "/bestCoin.png",
        metadataBaseSource: siteUrl ? "NEXT_PUBLIC_SITE_URL" : vercelUrl ? "VERCEL_URL" : "localhost",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/bestCoin.png",
          width: 1024,
          height: 1024,
          alt: "Best Coin",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/bestCoin.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
