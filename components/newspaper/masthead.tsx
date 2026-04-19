export function Masthead() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const editionNo = Math.floor(
    (now.getTime() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <header className="masthead">
      <h1 className="masthead-title">UniNews</h1>
      <div className="masthead-meta" style={{ marginTop: "0.25rem" }}>
        <span>{dateStr}</span>
        <span>•</span>
        <span>Edition #{editionNo}</span>
      </div>
      <div className="masthead-rule" />
      {/* <div className="masthead-meta nav-scroll">
        <span>Campus</span>
        <span>•</span>
        <span>Academic</span>
        <span>•</span>
        <span>Sports</span>
        <span>•</span>
        <span>Events</span>
        <span>•</span>
        <span>Opinion</span>
        <span>•</span>
        <span>Clubs</span>
      </div> */}
    </header>
  );
}
