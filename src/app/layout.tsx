import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const headline = Playfair_Display({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Parasit[e] // Containment Protocol",
  description: "Secure collaborative channel for neutralizing biological and system infections.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { AudioProvider } from "@/contexts/AudioContext";
import AudioController from "@/components/ui/AudioController";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${headline.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <AudioProvider>
          <AudioController />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}

