import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const candor = localFont({
  src: [
    {
      path: './fonts/TMCandor-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/TMCandor-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/TMCandor-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-candor',
});

export const metadata: Metadata = {
  title: "MindShare",
  description: "AI Agents for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={candor.variable} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
