/**
 * @reventurn/ui
 *
 * Session 4: real design tokens applied. Built with class-variance-
 * authority + tailwind-merge — the same foundation shadcn/ui itself uses.
 * We're not pulling in the full shadcn CLI scaffold (Radix primitives,
 * components.json) yet since Button and Wordmark are still the only two
 * components; that's worth doing once something needing Radix (a dialog,
 * a select) actually shows up, not preemptively. Logged as a deliberate
 * scope decision, not a silent deviation — see SESSION_REPORT.md.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-900 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-amber-500 text-graphite-950 hover:bg-amber-400",
        secondary:
          "bg-transparent text-graphite-50 border border-graphite-600 hover:bg-graphite-800"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface WordmarkProps {
  className?: string;
  /** Show the "precise · borderless" tagline next to the mark. */
  withTagline?: boolean;
  /** If set, wraps the mark in a link (typically "/" to act as a home button). */
  href?: string;
}

/**
 * The product wordmark: "reventurn" set in the heading font (Space
 * Grotesk, loaded via next/font in apps/web/app/layout.tsx — the CSS
 * variable --font-heading must be present on an ancestor element for this
 * to render correctly) plus a small amber chevron standing in for "money
 * in motion." Kept as styled text rather than a single flattened SVG so
 * it stays crisp and accessible at any size.
 */
export function Wordmark({ className, withTagline = false, href }: WordmarkProps) {
  const content = (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className="flex items-center gap-1.5 font-heading text-xl font-medium tracking-tight text-graphite-50">
        reventurn
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 9 L7 3 L12 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          />
        </svg>
      </span>
      {withTagline && (
        <span className="font-data text-xs text-graphite-400">
          precise &middot; borderless
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="w-fit no-underline">
        {content}
      </a>
    );
  }
  return content;
}

export * from "./cn";
