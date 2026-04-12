// Root page: redirect to /feed for authenticated users
// In production, middleware will handle auth-based redirects
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/feed");
}
