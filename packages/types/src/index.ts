/**
 * @reventurn/types
 *
 * Infra-level shared types only. Per the build ruleset, theme-specific
 * domain types (rate-differential data, asset positions, etc.) belong to
 * a Session 2+ feature session — do not add them here speculatively.
 */

/** Mirrors the subset of a Supabase auth user our apps actually read. */
export interface AppUser {
  id: string;
  email: string | null;
  createdAt: string;
}

/** Standard envelope every apps/api JSON route should return. */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Shape of the apps/api health-check endpoint. */
export interface HealthStatus {
  status: "ok";
  service: "reventurn-api";
  timestamp: string;
}

export * from "./rates";
export * from "./assets";
export * from "./chat";
export * from "./solana-assets";
export * from "./allocation";
