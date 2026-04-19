import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="container-news animate-fade-in"
      style={{
        paddingTop: "6rem",
        paddingBottom: "6rem",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--accent-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <FileQuestion size={36} style={{ color: "var(--accent)" }} />
      </div>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "3rem",
          fontWeight: 900,
          marginBottom: "0.5rem",
          letterSpacing: "-0.02em",
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.25rem",
          fontWeight: 600,
          marginBottom: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: "0.9375rem",
          color: "var(--text-tertiary)",
          marginBottom: "2rem",
          maxWidth: 400,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
        <Link href="/explore" className="btn btn-secondary">
          Explore Posts
        </Link>
      </div>
    </div>
  );
}
