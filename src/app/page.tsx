"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Provider {
  title: string;
  image: string;
  catLink: string;
}

export default function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setProviders(d.providers.filter((p: Provider) => p.catLink?.startsWith("http")));
      })
      .catch(() => setError("Failed to load providers"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{
            fontSize: "10px",
            letterSpacing: "0.3em",
            color: "var(--text3)",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}>
            SELECT PROVIDER
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "var(--text)",
          }}>
            LIVE CRICKET<br />
            <span style={{ color: "var(--accent)" }}>STREAMS</span>
          </h1>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "32px", position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "10px",
            color: "var(--text3)",
            letterSpacing: "0.1em",
            pointerEvents: "none",
          }}>SEARCH</span>
          <input
            type="text"
            placeholder="filter providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "10px 12px 10px 72px",
              fontSize: "13px",
              borderRadius: "var(--radius)",
              outline: "none",
              letterSpacing: "0.03em",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* States */}
        {loading && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div style={{
              display: "inline-block",
              width: "24px", height: "24px",
              border: "2px solid var(--border2)",
              borderTop: "2px solid var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "16px",
            }} />
            <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>FETCHING PROVIDERS</p>
          </div>
        )}

        {error && (
          <div style={{
            border: "1px solid var(--red)",
            borderRadius: "var(--radius)",
            padding: "16px 20px",
            background: "rgba(255,64,64,0.05)",
          }}>
            <p style={{ fontSize: "11px", color: "var(--red)", letterSpacing: "0.1em" }}>ERROR — {error}</p>
            <p style={{ fontSize: "10px", color: "var(--text3)", marginTop: "6px" }}>
              Check that your environment variables are configured correctly.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "20px", letterSpacing: "0.1em" }}>
              {filtered.length} PROVIDER{filtered.length !== 1 ? "S" : ""}
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1px",
              background: "var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}>
              {filtered.map((p) => (
                <ProviderCard key={p.catLink} provider={p} />
              ))}
              {filtered.length === 0 && (
                <div style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--bg)",
                  gridColumn: "1 / -1",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "0.1em" }}>
                    NO PROVIDERS MATCH "{search}"
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Footer />
    </>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const [hovered, setHovered] = useState(false);
  const encoded = encodeURIComponent(provider.catLink);

  return (
    <Link href={`/watch?url=${encoded}&name=${encodeURIComponent(provider.title)}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "var(--card-hover)" : "var(--bg)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
          transition: "background 0.1s",
          minHeight: "72px",
        }}
      >
        {/* Logo */}
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius)",
          background: "var(--bg3)",
          border: "1px solid var(--border2)",
          flexShrink: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {provider.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.image}
              alt={provider.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span style={{ fontSize: "14px", color: "var(--text3)" }}>▶</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {provider.title}
          </p>
          <p style={{
            fontSize: "9px",
            color: "var(--text3)",
            letterSpacing: "0.1em",
            marginTop: "3px",
          }}>
            STREAM PROVIDER
          </p>
        </div>

        <span style={{
          fontSize: "16px",
          color: hovered ? "var(--accent)" : "var(--text3)",
          transition: "color 0.1s, transform 0.1s",
          transform: hovered ? "translateX(3px)" : "none",
        }}>→</span>
      </div>
    </Link>
  );
}
