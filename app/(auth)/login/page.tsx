"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    null
  );
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";

  return (
    <>
      <h2 className="auth-header">
        Welcome back
      </h2>
      <p className="auth-subtext">
        Log in to post news and connect
      </p>

      {state?.error && (
        <div className="auth-error-banner">
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="input-group mb-4">
          <label htmlFor="username" className="input-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className={`input ${state?.fieldErrors?.username ? "input-error" : ""}`}
            placeholder="your_username"
            required
            autoComplete="username"
          />
          {state?.fieldErrors?.username && (
            <span className="error-text">{state.fieldErrors.username[0]}</span>
          )}
        </div>

        <div className="input-group mb-6">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={`input ${state?.fieldErrors?.password ? "input-error" : ""}`}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          {state?.fieldErrors?.password && (
            <span className="error-text">{state.fieldErrors.password[0]}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={isPending}
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="auth-footer-link"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
