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

  const ogVersion =
    process.env.NEXT_PUBLIC_OG_IMAGE_VERSION?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
    "v1";
  const ogImageUrl = `/bestCoin.png?v=${encodeURIComponent(ogVersion)}`;

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
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
