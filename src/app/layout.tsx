import type { Metadata } from "next";
import { Geist_Mono, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Fonts ───────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// ─── Metadata ────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Vibly — Your Digital Sanctuary",
    template: "%s | Vibly",
  },
  description:
    "Experience a social space designed for clarity, intentionality, and your cognitive ease.",
  metadataBase: new URL("https://vibly.app"),
  openGraph: {
    type: "website",
    siteName: "Vibly",
  },
};

// ─── Root Layout ─────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        inter.variable,
        geistSans.variable,
        geistMono.variable,
        "h-full",
      )}
    >
      <body className="h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
