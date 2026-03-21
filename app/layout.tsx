import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Values Signal Audit | The CX Evolutionist",
  description:
    "Audit whether your values are visible and verifiable to AI agents shopping on behalf of humans. A tool by Katja Forbes / The CX Evolutionist.",
  openGraph: {
    title: "Values Signal Audit",
    description:
      "Can a machine customer read who you are — and find independent evidence you actually live those values?",
    siteName: "The CX Evolutionist",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-navy-deep text-white font-body antialiased">
        {children}
      </body>
    </html>
  );
}
