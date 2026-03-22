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

interface DaddyChannel {
  name: string;
  logo: string;
  group: string;
  url: string;
  referer: string;
  userAgent: string;
}

export default function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providerError, setProviderError] = useState("");
  const [providerSearch, setProviderSearch] = useState("");

  const [daddyChannels, setDaddyChannels] = useState<DaddyChannel[]>([]);
  const [loadingDaddy, setLoadingDaddy] = useState(true);
  const [daddyError, setDaddyError] = useState("");
  const [daddySearch, setDaddySearch] = useState("");

  const [activeTab, setActiveTab] = useState<"daddy" | "cricfy">("daddy");

  useEffect(() => {
    fetch("/api/providers")
      .then(r => r.json())
      .then(d => {
        if (d.error) setProviderError(d.error);
        else setProviders(d.providers.filter((p: Provider) => p.catLink?.startsWith("http")));
      })
      .catch(() => setProviderError("Failed to load"))
      .finally(() => setLoadingProviders(false));

    fetch("/api/daddylive")
      .then(r => r.json())
      .then(d => {
        if (d.error) setDaddyError(d.error);
        else setDaddyChannels(d.channels);
      })
      .catch(() => setDaddyError("Failed to load DaddyLive"))
      .finally(() => setLoadingDaddy(false));
  }, []);

  const filteredProviders = providers.filter(p =>
    p.title.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filteredDaddy = daddyChannels.filter(ch =>
    ch.name.toLowerCase().includes(daddySearch.toLowerCase()) ||
    ch.group.toLowerCase().includes(daddySearch.toLowerCase())
  );

  // Group daddy channels
  const daddyGroups = filteredDaddy.reduce((acc, ch) => {
    const g = ch.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(ch);
    return acc;
  }, {} as Record<string, DaddyChannel[]>);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "var(--text3)", marginBottom: "12px" }}>
            LIVE CRICKET & SPORTS
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            WATCH LIVE<br /><span style={{ color: "var(--accent)" }}>STREAMS</span>
          </h1>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "32px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "3px", width: "fit-content" }}>
          {[
            { key: "daddy", label: "⚡ SPORTS (WORKS NOW)", desc: "Star Sports, Willow, Sky Sports" },
            { key: "cricfy", label: "📡 CRICFY PROVIDERS", desc: "62 providers" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "daddy" | "cricfy")}
              style={{
                background: activeTab === tab.key ? "var(--accent)" : "transparent",
                color: activeTab === tab.key ? "#000" : "var(--text2)",
                border: "none",
                padding: "8px 16px",
                fontSize: "10px",
                fontFamily: "var(--font)",
                fontWeight: activeTab === tab.key ? 700 : 400,
                letterSpacing: "0.1em",
                borderRadius: "3px",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <div>{tab.label}</div>
              <div style={{ fontSize: "8px", opacity: 0.7, marginTop: "2px" }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* DADDYLIVE TAB */}
        {activeTab === "daddy" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
                  Live Sports Channels
                </p>
                <p style={{ fontSize: "10px", color: "var(--text3)" }}>
                  Direct HLS streams — no DRM, plays in browser
                </p>
              </div>
              <input
                type="text"
                placeholder="search channels..."
                value={daddySearch}
                onChange={e => setDaddySearch(e.target.value)}
                style={{
                  background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)",
                  padding: "8px 12px", fontSize: "11px", fontFamily: "var(--font)",
                  borderRadius: "4px", outline: "none", width: "220px",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {loadingDaddy && (
              <div style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ width: "24px", height: "24px", border: "2px solid var(--border2)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>LOADING CHANNELS</p>
              </div>
            )}

            {daddyError && (
              <div style={{ border: "1px solid var(--red)", borderRadius: "4px", padding: "16px", background: "rgba(255,64,64,0.05)" }}>
                <p style={{ fontSize: "11px", color: "var(--red)" }}>ERROR — {daddyError}</p>
              </div>
            )}

            {!loadingDaddy && !daddyError && (
              <div>
                {Object.entries(daddyGroups).sort().map(([group, channels]) => (
                  <div key={group} style={{ marginBottom: "32px" }}>
                    <p style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.25em", marginBottom: "10px", textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                      {group} <span style={{ color: "var(--text3)", fontWeight: 400 }}>({channels.length})</span>
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
                      {channels.map((ch, i) => (
                        <DaddyChannelCard key={i} channel={ch} />
                      ))}
                    </div>
                  </div>
                ))}
                {filteredDaddy.length === 0 && (
                  <p style={{ fontSize: "11px", color: "var(--text3)", textAlign: "center", padding: "40px" }}>
                    No channels match "{daddySearch}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CRICFY TAB */}
        {activeTab === "cricfy" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="filter providers..."
                value={providerSearch}
                onChange={e => setProviderSearch(e.target.value)}
                style={{
                  background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)",
                  padding: "9px 12px 9px 12px", fontSize: "13px", fontFamily: "var(--font)",
                  borderRadius: "4px", outline: "none", width: "100%", maxWidth: "420px",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {loadingProviders && (
              <div style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ width: "24px", height: "24px", border: "2px solid var(--border2)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>FETCHING PROVIDERS</p>
              </div>
            )}

            {providerError && (
              <div style={{ border: "1px solid var(--red)", borderRadius: "4px", padding: "16px", background: "rgba(255,64,64,0.05)" }}>
                <p style={{ fontSize: "11px", color: "var(--red)" }}>ERROR — {providerError}</p>
              </div>
            )}

            {!loadingProviders && !providerError && (
              <>
                <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "16px", letterSpacing: "0.1em" }}>
                  {filteredProviders.length} PROVIDERS
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  {filteredProviders.map(p => (
                    <ProviderCard key={p.catLink} provider={p} />
                  ))}
                </div>
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

function DaddyChannelCard({ channel }: { channel: DaddyChannel }) {
  const [hovered, setHovered] = useState(false);
  const encoded = encodeURIComponent(JSON.stringify({
    url: channel.url,
    name: channel.name,
    referer: channel.referer,
    userAgent: channel.userAgent,
    logo: channel.logo,
    group: channel.group,
  }));

  return (
    <Link href={`/play?ch=${encoded}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "var(--card-hover)" : "var(--bg)",
          padding: "14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          transition: "background 0.1s",
          minHeight: "60px",
        }}
      >
        <div style={{ width: "32px", height: "32px", flexShrink: 0, background: "var(--bg3)", borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {channel.logo
            ? <img src={channel.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            : <span style={{ fontSize: "12px" }}>📺</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: hovered ? "var(--accent)" : "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {channel.name}
          </p>
          <p style={{ fontSize: "8px", color: "var(--text3)", letterSpacing: "0.1em", marginTop: "2px" }}>
            HLS · NO DRM
          </p>
        </div>
        <span style={{ fontSize: "14px", color: hovered ? "var(--accent)" : "var(--text3)", transition: "all 0.1s" }}>▶</span>
      </div>
    </Link>
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
          padding: "18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
          transition: "background 0.1s",
          minHeight: "68px",
        }}
      >
        <div style={{ width: "36px", height: "36px", flexShrink: 0, background: "var(--bg3)", borderRadius: "3px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {provider.image
            ? <img src={provider.image} alt={provider.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            : <span style={{ fontSize: "14px", color: "var(--text3)" }}>▶</span>
          }
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
