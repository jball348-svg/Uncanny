import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Uncanny — AI Detection for Fiction Writers',
  description: 'Find out where the machine crept into your prose. Uncanny analyses fiction and creative writing for AI influence with sentence-level precision.',
  openGraph: {
    title: 'Uncanny — AI Detection for Fiction Writers',
    description: 'Find out where the machine crept into your prose.',
    url: 'https://uncanny.vercel.app', // update when real URL known
    siteName: 'Uncanny',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uncanny — AI Detection for Fiction Writers',
    description: 'Find out where the machine crept into your prose.',
  },
};

import { AnalysisProvider } from "@/context/AnalysisContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalysisProvider>
          {children}
        </AnalysisProvider>
      </body>
    </html>
  );
}
