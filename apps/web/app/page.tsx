import { Button } from "@reventurn/ui";
import type { ApiResponse, HealthStatus } from "@reventurn/types";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

async function getApiHealth(): Promise<ApiResponse<HealthStatus> | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<HealthStatus>;
  } catch {
    // apps/api may not be running yet — this is infra scaffolding, not a
    // hard dependency for the web app to render.
    return null;
  }
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const health = await getApiHealth();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Reventurn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Core infra scaffold — Session 1. No product features live yet.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-700">Auth status</h2>
        {user ? (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-slate-600">Signed in as {user.email}</p>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-2 flex gap-3">
            <a href="/sign-in">
              <Button variant="primary">Sign in</Button>
            </a>
            <a href="/sign-up">
              <Button variant="secondary">Sign up</Button>
            </a>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-700">apps/api health</h2>
        <p className="mt-2 text-sm text-slate-600">
          {health?.ok
            ? `ok — ${health.data.timestamp}`
            : "unreachable (start apps/api with `pnpm dev`)"}
        </p>
      </section>
    </main>
  );
}
