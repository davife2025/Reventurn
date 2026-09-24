/**
 * @reventurn/ui
 *
 * Deliberately minimal for Session 1. The ruleset's UI & Brand Design Rule
 * (shadcn/ui + Tailwind as the fixed component base, token system, etc.)
 * applies starting with the first session that does real design work — not
 * this infra session. Wiring shadcn/ui properly (components.json, CLI init,
 * Tailwind config) is logged as a TODO in SESSION_REPORT.md rather than
 * half-done here.
 */
import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      primary: "bg-slate-900 text-white hover:bg-slate-700",
      secondary:
        "bg-transparent text-slate-900 border border-slate-300 hover:bg-slate-50"
    };
    const classes = [base, variants[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
