import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnyxRE Agent OS",
  description: "Elite Intelligence for the Modern Realtor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} ${playfair.variable} antialiased bg-onyx text-slate-100 font-sans min-h-screen flex`}
        suppressHydrationWarning
      >
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
