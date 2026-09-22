import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Root Application Entry Point.
 * Default behavior:
 * - Unauthenticated users are routed to /login (Sign-In as default entry page)
 * - Authenticated users with an active session proceed directly to /dashboard
 * - The full public marketing showcase is preserved at /landing
 */
export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
