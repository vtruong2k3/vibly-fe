import { AppSidebar } from "@/components/layout/app-sidebar";

// Main layout: persistent sidebar + content area
// This is a Server Component — sidebar is rendered server-side
// Only interactive blocks within pages use "use client"
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
