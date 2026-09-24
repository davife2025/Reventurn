import { Button, Wordmark } from "@reventurn/ui";
import { signUp } from "../actions";
import { Footer } from "../components/Footer";

export default function SignUpPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-16">
        <Wordmark href="/" />
        <h1 className="font-heading text-xl font-medium text-graphite-50">
          Sign up
        </h1>

        {searchParams.error && (
          <p className="rounded-md border border-rust-600 bg-graphite-800 p-3 text-sm text-rust-500">
            {searchParams.error}
          </p>
        )}

        <form action={signUp} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-md border border-graphite-600 bg-graphite-800 px-3 py-2 text-sm text-graphite-50 placeholder:text-graphite-500 focus:border-amber-500 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="rounded-md border border-graphite-600 bg-graphite-800 px-3 py-2 text-sm text-graphite-50 placeholder:text-graphite-500 focus:border-amber-500 focus:outline-none"
          />
          <Button type="submit" variant="primary">
            Create account
          </Button>
        </form>

        <p className="text-sm text-graphite-400">
          Already have an account?{" "}
          <a href="/sign-in" className="text-amber-400 underline">
            Sign in
          </a>
        </p>
      </main>
      <Footer health={null} />
    </div>
  );
}
