import type { ReactNode } from "react";

// ─── Call Layout ───────────────────────────────────────────────────
// Completely isolated from app/(main). No sidebar, no topbar.
// Full-screen dark canvas for video call interface.

export default function CallLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0f1a] text-white">
      {children}
    </div>
  );
}
