import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/layout/Navbar";
import Providers from "@/app/components/others/Providers";
import ParticlesBackground from "@/app/components/ParticlesBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataMarket - Buy & Sell Data",
  description: "A decentralized data marketplace powered by Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <ParticlesBackground />
            <div className="relative z-10">
              <Navbar />
              <div className="relative">
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
