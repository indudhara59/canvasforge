import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthSessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelForge Studio — Design at the speed of thought",
  description:
    "A fast, focused canvas for turning ideas into pixel-perfect designs. Real-time collaboration, infinite canvas, and tools that get out of your way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
