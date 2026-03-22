import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font)",
      background: "var(--bg)",
      flexDirection: "column",
      gap: "16px",
      textAlign: "center",
      padding: "24px",
    }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "var(--text3)" }}>404</p>
      <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
        PAGE NOT FOUND
      </p>
      <Link href="/" style={{
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "var(--accent)",
        borderBottom: "1px solid var(--accent)",
        paddingBottom: "2px",
      }}>
        ← BACK TO HOME
      </Link>
    </div>
  );
}
