// Auth layout: clean, no sidebar, focused on form UX
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {children}
    </div>
  );
}
