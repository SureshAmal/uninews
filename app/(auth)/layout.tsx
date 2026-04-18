export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background:
          "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)",
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.5rem",
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
            }}
          >
            Uni<span style={{ color: "var(--accent)" }}>News</span>
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              marginTop: "0.25rem",
            }}
          >
            Your university&apos;s pulse
          </p>
        </div>

        {/* Card */}
        <div
          className="card-glass"
          style={{
            padding: "2rem",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
