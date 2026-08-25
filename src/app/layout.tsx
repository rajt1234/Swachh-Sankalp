import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swachh Sankalp - Smart WasteWise Management System",
  description: "Building cleaner, greener communities through technology, citizen participation, and sustainable waste management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <LanguageProvider>
          <Header />
          <main className="flex-1" suppressHydrationWarning>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
