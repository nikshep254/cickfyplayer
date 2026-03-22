"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "monospace", background: "#0a0a0a", color: "#f0f0f0" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          textAlign: "center",
          padding: "24px",
        }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#555" }}>ERROR</p>
          <p style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            SOMETHING WENT WRONG
          </p>
          <button
            onClick={reset}
            style={{
              background: "#e8ff47",
              color: "#000",
              border: "none",
              padding: "8px 20px",
              fontSize: "10px",
              letterSpacing: "0.15em",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </body>
    </html>
  );
}
