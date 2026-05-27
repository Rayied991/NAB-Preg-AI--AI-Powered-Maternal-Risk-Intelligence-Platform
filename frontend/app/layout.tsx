import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

/**
 * Root Layout Configuration
 * 
 * Group Project Documentation:
 * 1. Imported ThemeProvider to expose light/dark theme toggles to all children elements.
 * 2. Embedded a small blocking JS IIFE in the <head> to immediately read the theme key from localStorage
 *    or prefers-color-scheme. This prevents a "hydration flash" where the page loads light then changes to dark.
 * 3. Configured `suppressHydrationWarning` on the <html> tag to ignore mismatches caused by this pre-render script.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAB Preg AI:  AI-Powered Maternal Risk Intelligence Platform",
  description: "NAB Preg AI is an AI-powered maternal healthcare platform that uses OCR-extracted medical reports, health data, and AI analytics to enable early detection of anemia, hypertension, and other pregnancy complications — built for underserved and rural communities where continuous maternal care is out of reach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash inline script to run before React renders the page */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
