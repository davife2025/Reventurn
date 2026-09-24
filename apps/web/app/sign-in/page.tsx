import { Button } from "@reventurn/ui";
import { signIn } from "../actions";

export default function SignInPage({
  searchParams
}: {
  searchParams: { error?: string; notice?: string };
}) {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold">Sign in</h1>

      {searchParams.notice === "check-your-email" && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Account created — check your email to confirm before signing in.
        </p>
      )}
      {searchParams.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      <form action={signIn} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="primary">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-slate-500">
        No account?{" "}
        <a href="/sign-up" className="underline">
          Sign up
        </a>
      </p>
    </main>
  );
}
