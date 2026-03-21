import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stratospheric Signal Audit | The CX Evolutionist",
  description:
    "Audit whether your values are visible and verifiable to AI agents shopping on behalf of humans. A tool by Katja Forbes / The CX Evolutionist.",
  openGraph: {
    title: "Stratospheric Signal Audit",
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
      <body className="min-h-screen bg-navy-deep text-white font-body antialiased">
        {children}
      </body>
    </html>
  );
}
