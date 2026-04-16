import type { ReactNode } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { CallSocketListener } from "@/features/calls/components/call-socket-listener";

// ─── Call Layout ───────────────────────────────────────────────────
// Completely isolated from app/(main). No sidebar, no topbar.
// Full-screen dark canvas for video call interface.
//
// SocketProvider is mounted at root layout (app/layout.tsx), so
// CallSocketListener can use useSocket() to receive call:ended events
// and auto-redirect the user when the other party hangs up.

export default function CallLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {/* Listen for call termination events so we can redirect away */}
      <CallSocketListener />
      <div className="h-screen w-screen overflow-hidden bg-[#0a0f1a] text-white">
        {children}
      </div>
    </AuthGuard>
  );
}
