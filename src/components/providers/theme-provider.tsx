"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Workaround for React 19 warning: "Encountered a script tag while rendering React component"
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string") {
      if (args[0].includes("Encountered a script tag")) return;
      if (
        args[0].includes("A tree hydrated but some attributes of the server rendered HTML didn't match") ||
        args[0].includes("bis_skin_checked")
      ) return;
    }
    // Handle React 19's specific error object format or different args structure if necessary
    const isHydrationMismatch = args.some(
      (arg) => typeof arg === "string" && (arg.includes("bis_skin_checked") || arg.includes("A tree hydrated but some attributes"))
    );
    if (isHydrationMismatch) return;

    orig.apply(console, args);
  };
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
