import { Button } from "@reventurn/ui";
import { signUp } from "../actions";

export default function SignUpPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold">Sign up</h1>

      {searchParams.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      <form action={signUp} className="flex flex-col gap-3">
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
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="primary">
          Create account
        </Button>
      </form>

      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/sign-in" className="underline">
          Sign in
        </a>
      </p>
    </main>
  );
}
