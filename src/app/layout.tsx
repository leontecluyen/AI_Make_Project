import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "RCS Reader On WEB",
  description: `${process.env.NEXT_PUBLIC_APP_NAME} — Barcode & QR code scanner by ${process.env.NEXT_PUBLIC_COMPANY}`,
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                {process.env.NEXT_PUBLIC_APP_NAME ?? "RCS Reader On WEB"}
              </span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/history"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                履歴
              </Link>
              <span className="text-xs text-gray-400">
                {process.env.NEXT_PUBLIC_COMPANY ?? "Leontec co., LTD"}
              </span>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
