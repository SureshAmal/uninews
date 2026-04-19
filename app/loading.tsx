export default function Loading() {
  return (
    <div
      className="container-news animate-fade-in"
      style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
    >
      {/* Masthead skeleton */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          className="skeleton"
          style={{ width: 200, height: 36, margin: "0 auto 0.5rem" }}
        />
        <div
          className="skeleton"
          style={{ width: 300, height: 14, margin: "0 auto" }}
        />
      </div>

      {/* Grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              overflow: "hidden",
            }}
          >
            <div
              className="skeleton"
              style={{ width: "100%", height: 180, borderRadius: 0 }}
            />
            <div style={{ padding: "1rem" }}>
              <div
                className="skeleton"
                style={{ width: 60, height: 12, marginBottom: "0.75rem" }}
              />
              <div
                className="skeleton"
                style={{ width: "90%", height: 20, marginBottom: "0.5rem" }}
              />
              <div
                className="skeleton"
                style={{ width: "70%", height: 14, marginBottom: "1rem" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div
                  className="skeleton"
                  style={{ width: 24, height: 24, borderRadius: "50%" }}
                />
                <div className="skeleton" style={{ width: 100, height: 14 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
