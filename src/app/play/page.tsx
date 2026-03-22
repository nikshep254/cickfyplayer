"use client";
import { useSearchParams, Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface DaddyChannel {
  url: string;
  name: string;
  referer: string;
  userAgent: string;
  logo: string;
  group: string;
}

// Convert DaddyChannel to PlaylistItem-compatible shape for VideoPlayer
import { VideoPlayer } from "@/components/VideoPlayer";
import type { PlaylistItem } from "@/lib/m3uParser";

function PlayContent() {
  const params = useSearchParams();
  const [channel, setChannel] = useState<PlaylistItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ch = params.get("ch");
    if (!ch) { setError("No channel specified"); return; }
    try {
      const parsed: DaddyChannel = JSON.parse(decodeURIComponent(ch));
      setChannel({
        title: parsed.name,
        url: parsed.url,
        tvgLogo: parsed.logo,
        groupTitle: parsed.group,
        userAgent: parsed.userAgent,
        referer: parsed.referer,
        cookie: "",
        licenseString: "",
        headers: {},
        isDrm: false,
      });
    } catch {
      setError("Invalid channel data");
    }
  }, [params]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Link href="/" style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.1em" }}>HOME</Link>
          <span style={{ fontSize: "10px", color: "var(--text3)" }}>→</span>
          <span style={{ fontSize: "10px", color: "var(--text)", letterSpacing: "0.1em" }}>
            {channel?.title?.toUpperCase() || "CHANNEL"}
          </span>
        </div>

        {error && (
          <p style={{ color: "var(--red)", fontSize: "11px" }}>{error}</p>
        )}

        {channel && (
          <>
            <VideoPlayer channel={channel} />
            <div style={{ marginTop: "12px", padding: "12px 16px", background: "var(--bg2)", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{channel.title}</p>
              <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                {channel.groupTitle && (
                  <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.15em" }}>{channel.groupTitle}</span>
                )}
                <span style={{ fontSize: "9px", color: "var(--green, #22c55e)", letterSpacing: "0.15em" }}>✓ NO DRM</span>
                <span style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "0.1em" }}>HLS</span>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayContent />
    </Suspense>
  );
}
