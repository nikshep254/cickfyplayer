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
  const [cricfyProviders, setCricfyProviders] = useState<Provider[]>([]);
  const [sportsProviders, setSportsProviders] = useState<Provider[]>([]);
  const [loadingCricfy, setLoadingCricfy] = useState(true);
  const [loadingSports, setLoadingSports] = useState(true);
  const [cricfySearch, setCricfySearch] = useState("");
  const [sportsSearch, setSportsSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"sports" | "cricfy">("sports");

  useEffect(() => {
    // Fetch Cricfy providers (Firebase-based, encrypted)
    fetch("/api/providers")
      .then(r => r.json())
      .then(d => {
        if (!d.error) setCricfyProviders(d.providers.filter((p: Provider) => p.catLink?.startsWith("http")));
      })
      .finally(() => setLoadingCricfy(false));

    // Fetch sports providers (direct M3U, no encryption)
    fetch("/api/daddylive")
      .then(r => r.json())
      .then(d => {
        if (!d.error) setSportsProviders(d.providers);
      })
      .finally(() => setLoadingSports(false));
  }, []);

  const filteredCricfy = cricfyProviders.filter(p =>
    p.title.toLowerCase().includes(cricfySearch.toLowerCase())
  );
  const filteredSports = sportsProviders.filter(p =>
    p.title.toLowerCase().includes(sportsSearch.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "var(--text3)", marginBottom: "12px" }}>LIVE CRICKET & SPORTS</p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            WATCH LIVE<br /><span style={{ color: "var(--accent)" }}>STREAMS</span>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "32px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "3px", width: "fit-content" }}>
          {[
            { key: "sports", label: "⚡ SPORTS (RECOMMENDED)", sub: "Jio, Sony, Hotstar, Cricket HD" },
            { key: "cricfy", label: "📡 CRICFY PROVIDERS", sub: "62 encrypted providers" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as "sports" | "cricfy")}
              style={{
                background: activeTab === tab.key ? "var(--accent)" : "transparent",
                color: activeTab === tab.key ? "#000" : "var(--text2)",
                border: "none", padding: "8px 16px", fontSize: "10px",
                fontFamily: "var(--font)", fontWeight: activeTab === tab.key ? 700 : 400,
                letterSpacing: "0.1em", borderRadius: "3px", cursor: "pointer",
                transition: "all 0.15s", textAlign: "left",
              }}>
              <div>{tab.label}</div>
              <div style={{ fontSize: "8px", opacity: 0.7, marginTop: "2px" }}>{tab.sub}</div>
            </button>
          ))}
        </div>

        {/* Sports tab */}
        {activeTab === "sports" && (
          <div>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Direct Stream Providers</p>
                <p style={{ fontSize: "10px", color: "var(--text3)" }}>Jio, Sony, Hotstar, Cricket HD — same sources as the Cricfy app</p>
              </div>
              <input type="text" placeholder="search providers..." value={sportsSearch}
                onChange={e => setSportsSearch(e.target.value)}
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 12px", fontSize: "11px", fontFamily: "var(--font)", borderRadius: "4px", outline: "none", width: "220px" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>

            {loadingSports ? (
              <Spinner label="LOADING PROVIDERS" />
            ) : (
              <>
                <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "16px", letterSpacing: "0.1em" }}>
                  {filteredSports.length} PROVIDERS
                </p>
                <ProviderGrid providers={filteredSports} />
              </>
            )}
          </div>
        )}

        {/* Cricfy tab */}
        {activeTab === "cricfy" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <input type="text" placeholder="filter providers..." value={cricfySearch}
                onChange={e => setCricfySearch(e.target.value)}
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "var(--font)", borderRadius: "4px", outline: "none", width: "100%", maxWidth: "420px" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>

            {loadingCricfy ? (
              <Spinner label="FETCHING PROVIDERS" />
            ) : (
              <>
                <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "16px", letterSpacing: "0.1em" }}>
                  {filteredCricfy.length} PROVIDERS
                </p>
                <ProviderGrid providers={filteredCricfy} />
              </>
            )}
          </div>
        )}

      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid var(--border2)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>{label}</p>
    </div>
  );
}

function ProviderGrid({ providers }: { providers: Provider[] }) {
  if (providers.length === 0) return (
    <p style={{ fontSize: "11px", color: "var(--text3)", textAlign: "center", padding: "40px" }}>No providers found</p>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
      {providers.map(p => <ProviderCard key={p.catLink} provider={p} />)}
    </div>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const [hovered, setHovered] = useState(false);
  const url = `/watch?url=${encodeURIComponent(provider.catLink)}&name=${encodeURIComponent(provider.title)}`;
  return (
    <Link href={url}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? "var(--card-hover)" : "var(--bg)", padding: "18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "background 0.1s", minHeight: "68px" }}>
        <div style={{ width: "36px", height: "36px", flexShrink: 0, background: "var(--bg3)", borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {provider.image
            ? <img src={provider.image} alt={provider.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            : <span style={{ fontSize: "14px", color: "var(--text3)" }}>▶</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{provider.title}</p>
          <p style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.1em", marginTop: "3px" }}>STREAM PROVIDER</p>
        </div>
        <span style={{ fontSize: "16px", color: hovered ? "var(--accent)" : "var(--text3)", transition: "all 0.1s", transform: hovered ? "translateX(3px)" : "none" }}>→</span>
      </div>
    </Link>
  );
}
