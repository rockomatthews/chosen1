import type { Metadata } from "next";
import ThemeRegistry from "./theme-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEST CRYPTO ATM",
  description:
    "Best crypto over the last 5 minutes from a filterable list.",
};

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
