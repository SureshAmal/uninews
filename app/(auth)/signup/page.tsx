"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signup,
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
        Join UniNews
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
          marginBottom: "1.5rem",
        }}
      >
        Create your account and start posting
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
        <div style={{ display: "grid", gap: "0.875rem" }}>
          <div className="input-group">
            <label htmlFor="username" className="input-label">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`input ${state?.fieldErrors?.username ? "input-error" : ""}`}
              placeholder="choose_a_username"
              required
              autoComplete="username"
            />
            {state?.fieldErrors?.username && (
              <span className="error-text">
                {state.fieldErrors.username[0]}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="displayName" className="input-label">
              Display Name *
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className={`input ${state?.fieldErrors?.displayName ? "input-error" : ""}`}
              placeholder="Your Full Name"
              required
            />
            {state?.fieldErrors?.displayName && (
              <span className="error-text">
                {state.fieldErrors.displayName[0]}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`input ${state?.fieldErrors?.password ? "input-error" : ""}`}
              placeholder="Min 6 characters"
              required
              autoComplete="new-password"
            />
            {state?.fieldErrors?.password && (
              <span className="error-text">
                {state.fieldErrors.password[0]}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="collegeYears" className="input-label">
              Year of College *
            </label>
            <select
              id="collegeYears"
              name="collegeYears"
              className="input"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select year
              </option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
              <option value="6">6th Year</option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div className="input-group">
              <label htmlFor="registrationNo" className="input-label">
                Registration No.
              </label>
              <input
                id="registrationNo"
                name="registrationNo"
                type="text"
                className="input"
                placeholder="Optional"
              />
            </div>

            <div className="input-group">
              <label htmlFor="enrollmentNo" className="input-label">
                Enrollment No.
              </label>
              <input
                id="enrollmentNo"
                name="enrollmentNo"
                type="text"
                className="input"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isPending}
          style={{ width: "100%", marginTop: "1.5rem" }}
        >
          {isPending ? "Creating account..." : "Create Account"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "var(--accent-text)", fontWeight: 500 }}
        >
          Log in
        </Link>
      </p>
    </>
  );
}
