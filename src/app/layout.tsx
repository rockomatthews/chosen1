import type { Metadata } from "next";
import ThemeRegistry from "./theme-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentum Winner",
  description:
    "Shows the best-performing crypto (last 5 minutes) from a filterable list, updating every 5 seconds.",
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
