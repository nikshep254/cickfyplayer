"use client";
import { useEffect, useRef, useState } from "react";
import type { PlaylistItem } from "@/lib/m3uParser";

interface PlayerProps {
  channel: PlaylistItem;
}

export function VideoPlayer({ channel }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<unknown>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!videoRef.current || !channel.url) return;

    const video = videoRef.current;
    setStatus("loading");
    setErrorMsg("");

    const buildHeaders = () => {
      const h: Record<string, string> = { ...channel.headers };
      if (channel.userAgent) h["User-Agent"] = channel.userAgent;
      if (channel.referer) h["Referer"] = channel.referer;
      if (channel.cookie) h["Cookie"] = channel.cookie;
      return h;
    };

    async function initPlayer() {
      const Hls = (await import("hls.js")).default;

      if (hlsRef.current) {
        (hlsRef.current as { destroy: () => void }).destroy();
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr: XMLHttpRequest) => {
            const headers = buildHeaders();
            Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
          },
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setStatus("playing");
        });

        hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal?: boolean; type?: string }) => {
          if (data.fatal) {
            setStatus("error");
            setErrorMsg(`Stream error: ${data.type ?? "unknown"}`);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = channel.url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
          setStatus("playing");
        });
        video.addEventListener("error", () => {
          setStatus("error");
          setErrorMsg("Stream failed to load");
        });
      } else {
        setStatus("error");
        setErrorMsg("HLS not supported in this browser");
      }
    }

    initPlayer();

    return () => {
      if (hlsRef.current) {
        (hlsRef.current as { destroy: () => void }).destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  return (
    <div style={{ position: "relative", background: "#000", borderRadius: "var(--radius)", overflow: "hidden" }}>
      {/* DRM Warning */}
      {channel.isDrm && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          background: "rgba(255,64,64,0.9)",
          color: "#fff",
          fontSize: "9px",
          letterSpacing: "0.15em",
          padding: "3px 8px",
          borderRadius: "var(--radius)",
          fontFamily: "var(--font)",
        }}>
          DRM — MAY NOT PLAY IN BROWSER
        </div>
      )}

      {/* Loading overlay */}
      {status === "loading" && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.8)",
          zIndex: 5,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "32px",
              height: "32px",
              border: "2px solid var(--border2)",
              borderTop: "2px solid var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.15em" }}>CONNECTING</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.9)",
          zIndex: 5,
        }}>
          <div style={{ textAlign: "center", padding: "24px" }}>
            <p style={{ fontSize: "11px", color: "var(--red)", letterSpacing: "0.1em", marginBottom: "8px" }}>STREAM UNAVAILABLE</p>
            <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.05em" }}>{errorMsg}</p>
            <p style={{ fontSize: "9px", color: "var(--text3)", marginTop: "12px" }}>Try another source below</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        style={{
          width: "100%",
          aspectRatio: "16/9",
          display: "block",
          background: "#000",
        }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
