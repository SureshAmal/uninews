"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    null
  );

  return (
    <>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.25rem",
        }}
      >
        Welcome back
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
          marginBottom: "1.5rem",
        }}
      >
        Log in to post news and connect
      </p>

      {state?.error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(196,30,58,0.08)",
            border: "1px solid rgba(196,30,58,0.2)",
            borderRadius: "var(--radius-sm)",
            color: "var(--error)",
            fontSize: "0.8125rem",
            marginBottom: "1rem",
          }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <div className="input-group" style={{ marginBottom: "1rem" }}>
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

        <div className="input-group" style={{ marginBottom: "1.5rem" }}>
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
          className="btn btn-primary btn-lg"
          disabled={isPending}
          style={{ width: "100%" }}
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--text-tertiary)",
          marginTop: "1.5rem",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          style={{ color: "var(--accent-text)", fontWeight: 500 }}
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
