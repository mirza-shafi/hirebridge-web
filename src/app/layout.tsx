import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "HireBridge — AI-native hiring",
    template: "%s · HireBridge",
  },
  description:
    "A job-specific CV and a realistic mock interview for every application. A ranked, explained shortlist for every employer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.variable}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
