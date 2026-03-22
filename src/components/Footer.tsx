export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "20px 24px",
      marginTop: "60px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "8px",
    }}>
      <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.15em" }}>
        CRICFY WEB — UNOFFICIAL CLIENT
      </span>
      <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.1em" }}>
        STREAMS ARE THIRD-PARTY. USE AT YOUR OWN RISK.
      </span>
    </footer>
  );
}
