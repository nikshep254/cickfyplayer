"use client";
import { useEffect, useRef, useState } from "react";
import type { PlaylistItem } from "@/lib/m3uParser";

interface PlayerProps {
  channel: PlaylistItem;
}

function buildProxyUrl(channel: PlaylistItem): string {
  const params = new URLSearchParams({ url: channel.url });
  if (channel.userAgent) params.set("ua", channel.userAgent);
  if (channel.referer) params.set("ref", channel.referer);
  if (channel.cookie) params.set("cookie", channel.cookie);
  return `/api/proxy?${params}`;
}

export function VideoPlayer({ channel }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<unknown>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tryDirect, setTryDirect] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !channel.url) return;

    const video = videoRef.current;
    setStatus("loading");
    setErrorMsg("");

    const streamUrl = tryDirect ? channel.url : buildProxyUrl(channel);

    async function initPlayer() {
      const Hls = (await import("hls.js")).default;

      if (hlsRef.current) {
        (hlsRef.current as { destroy: () => void }).destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 15000,
          levelLoadingTimeOut: 15000,
        });

        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setStatus("playing");
        });

        hls.on(Hls.Events.ERROR, (_: unknown, data: {
          fatal?: boolean;
          type?: string;
          details?: string;
        }) => {
          if (data.fatal) {
            if (!tryDirect) {
              setTryDirect(true);
            } else {
              setStatus("error");
              setErrorMsg(data.details || data.type || "Stream failed");
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
          setStatus("playing");
        });
        video.addEventListener("error", () => {
          if (!tryDirect) {
            setTryDirect(true);
          } else {
            setStatus("error");
            setErrorMsg("Stream failed to load");
          }
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
  }, [channel, tryDirect]);

  return (
    <div style={{ position: "relative", background: "#000", borderRadius: "var(--radius)", overflow: "hidden" }}>

      {status === "playing" && (
        <div style={{
          position: "absolute", top: "10px", left: "10px", zIndex: 10,
          background: "rgba(34,197,94,0.9)", color: "#000",
          fontSize: "9px", letterSpacing: "0.15em", padding: "3px 8px",
          borderRadius: "var(--radius)", fontFamily: "var(--font)", fontWeight: 700,
        }}>● LIVE</div>
      )}

      {tryDirect && status !== "error" && (
        <div style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 10,
          background: "rgba(255,165,0,0.9)", color: "#000",
          fontSize: "9px", letterSpacing: "0.1em", padding: "3px 8px",
          borderRadius: "var(--radius)", fontFamily: "var(--font)",
        }}>DIRECT MODE</div>
      )}

      {status === "loading" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", zIndex: 5,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "2px solid var(--border2)",
              borderTop: "2px solid var(--accent)",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.2em" }}>
              {tryDirect ? "TRYING DIRECT..." : "CONNECTING VIA PROXY..."}
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.92)", zIndex: 5,
        }}>
          <div style={{ textAlign: "center", padding: "24px" }}>
            <p style={{ fontSize: "20px", marginBottom: "12px" }}>📡</p>
            <p style={{ fontSize: "11px", color: "var(--red)", letterSpacing: "0.1em", marginBottom: "8px" }}>
              STREAM UNAVAILABLE
            </p>
            <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "16px" }}>
              {errorMsg}
            </p>
            <button
              onClick={() => { setStatus("loading"); setTryDirect(false); }}
              style={{
                background: "var(--accent)", color: "#000", border: "none",
                padding: "7px 16px", fontSize: "10px", letterSpacing: "0.1em",
                fontFamily: "var(--font)", fontWeight: 700,
                borderRadius: "var(--radius)", cursor: "pointer",
              }}
            >↺ RETRY</button>
            <p style={{ fontSize: "9px", color: "var(--text3)", marginTop: "12px" }}>
              Try a different channel or provider
            </p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#000" }}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
