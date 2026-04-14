import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import DarkModeSync from "@/components/DarkModeSync";
import LangSync from "@/components/LangSync";
import AuthProvider from "@/components/AuthProvider";
import ToastContainer from "@/components/Toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const vietnam = Be_Vietnam_Pro({
  variable: "--font-vietnam",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nonogram Play",
  description: "카와이 스타일 노노그램 퍼즐 게임",
  other: {
    "google-adsense-account": "ca-pub-3518741028972783",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jakarta.variable} ${vietnam.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3518741028972783"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body">
        <DarkModeSync />
        <LangSync />
        <AuthProvider />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
