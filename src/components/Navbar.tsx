"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "var(--bg)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: "52px",
      backdropFilter: "blur(12px)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontSize: "11px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--accent)",
          fontWeight: 700,
        }}>CRICFY</span>
        <span style={{
          fontSize: "10px",
          color: "var(--text3)",
          letterSpacing: "0.1em",
        }}>LIVE STREAMS</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{
          fontSize: "10px",
          color: "var(--text3)",
          letterSpacing: "0.15em",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
            boxShadow: "0 0 6px #22c55e",
            animation: "pulse 2s infinite",
          }} />
          LIVE
        </span>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              color: "var(--text2)",
              padding: "5px 10px",
              borderRadius: "var(--radius)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              transition: "all 0.15s",
            }}
          >
            {theme === "dark" ? "LIGHT" : "DARK"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </nav>
  );
}
