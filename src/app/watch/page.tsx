"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Footer } from "@/components/Footer";
import type { PlaylistItem } from "@/lib/m3uParser";

function WatchContent() {
  const params = useSearchParams();
  const providerUrl = params.get("url") ?? "";
  const providerName = params.get("name") ?? "Provider";

  const [channels, setChannels] = useState<PlaylistItem[]>([]);
  const [filtered, setFiltered] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PlaylistItem | null>(null);
  const [search, setSearch] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!providerUrl) return;
    fetch(`/api/channels?url=${encodeURIComponent(providerUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setChannels(d.channels);
          setFiltered(d.channels);
          if (d.channels.length > 0) setSelected(d.channels[0]);
        }
      })
      .catch(() => setError("Failed to load channels"))
      .finally(() => setLoading(false));
  }, [providerUrl]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      channels.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.groupTitle.toLowerCase().includes(q)
      )
    );
  }, [search, channels]);

  const handleSelect = (ch: PlaylistItem) => {
    setSelected(ch);
    // Scroll player into view on mobile
    if (window.innerWidth < 768) {
      playerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Group channels
  const groups = filtered.reduce((acc, ch) => {
    const g = ch.groupTitle || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(ch);
    return acc;
  }, {} as Record<string, PlaylistItem[]>);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Link href="/" style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.1em" }}>HOME</Link>
          <span style={{ fontSize: "10px", color: "var(--text3)" }}>→</span>
          <span style={{ fontSize: "10px", color: "var(--text)", letterSpacing: "0.1em" }}>
            {providerName.toUpperCase()}
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "16px",
          alignItems: "start",
        }}
          className="watch-grid"
        >
          {/* Player side */}
          <div ref={playerRef}>
            {selected ? (
              <>
                <VideoPlayer channel={selected} />
                <div style={{ marginTop: "12px", padding: "12px 16px", background: "var(--bg2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em" }}>
                    {selected.title}
                  </p>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                    {selected.groupTitle && (
                      <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.15em" }}>
                        {selected.groupTitle}
                      </span>
                    )}
                    {selected.isDrm && (
                      <span style={{ fontSize: "9px", color: "var(--red)", letterSpacing: "0.15em" }}>DRM</span>
                    )}
                    <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.1em" }}>
                      {selected.url.includes(".mpd") ? "DASH" : selected.url.includes(".m3u") ? "HLS" : "STREAM"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                aspectRatio: "16/9",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>
                  {loading ? "LOADING..." : "SELECT A CHANNEL"}
                </p>
              </div>
            )}
          </div>

          {/* Channel list */}
          <div style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            maxHeight: "calc(100vh - 120px)",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: "68px",
          }}>
            {/* List header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.15em" }}>CHANNELS</p>
                {!loading && (
                  <p style={{ fontSize: "10px", color: "var(--text3)" }}>{filtered.length}</p>
                )}
              </div>
              <input
                type="text"
                placeholder="search channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "7px 10px",
                  fontSize: "11px",
                  borderRadius: "var(--radius)",
                  outline: "none",
                  letterSpacing: "0.02em",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Scrollable list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading && (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{
                    width: "20px", height: "20px",
                    border: "2px solid var(--border2)",
                    borderTop: "2px solid var(--accent)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 12px",
                  }} />
                  <p style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.15em" }}>FETCHING CHANNELS</p>
                </div>
              )}

              {error && (
                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "10px", color: "var(--red)", letterSpacing: "0.1em" }}>ERROR</p>
                  <p style={{ fontSize: "10px", color: "var(--text3)", marginTop: "4px" }}>{error}</p>
                </div>
              )}

              {!loading && !error && Object.entries(groups).map(([group, chs]) => (
                <div key={group}>
                  <div style={{
                    padding: "7px 14px",
                    background: "var(--bg3)",
                    borderBottom: "1px solid var(--border)",
                    borderTop: "1px solid var(--border)",
                    position: "sticky",
                    top: 0,
                  }}>
                    <p style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      {group}
                    </p>
                  </div>
                  {chs.map((ch, i) => (
                    <ChannelRow
                      key={`${ch.url}-${i}`}
                      channel={ch}
                      isSelected={selected?.url === ch.url && selected?.title === ch.title}
                      onSelect={() => handleSelect(ch)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .watch-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <Footer />
    </>
  );
}

function ChannelRow({
  channel,
  isSelected,
  onSelect,
}: {
  channel: PlaylistItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        cursor: "pointer",
        background: isSelected ? "var(--bg3)" : hovered ? "var(--card-hover)" : "transparent",
        borderBottom: "1px solid var(--border)",
        borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "background 0.1s",
      }}
    >
      {/* Logo */}
      <div style={{
        width: "28px",
        height: "28px",
        flexShrink: 0,
        background: "var(--bg3)",
        borderRadius: "2px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {channel.tvgLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.tvgLogo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span style={{ fontSize: "10px", color: "var(--text3)" }}>▶</span>
        )}
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "11px",
          color: isSelected ? "var(--accent)" : "var(--text)",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: isSelected ? 600 : 400,
        }}>
          {channel.title}
        </p>
        {channel.isDrm && (
          <p style={{ fontSize: "8px", color: "var(--red)", letterSpacing: "0.1em", marginTop: "2px" }}>DRM</p>
        )}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchContent />
    </Suspense>
  );
}
