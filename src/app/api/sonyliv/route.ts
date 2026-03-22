// src/app/api/sonyliv/route.ts
import { NextResponse } from "next/server";

const PRIMARY = "https://raw.githubusercontent.com/drmlive/sliv-live-events/refs/heads/main/sonyliv.json";
const MIRROR  = "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

// No caching — tokens expire, we need freshest data always
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function GET() {
  let data;
  try { data = await fetchJson(PRIMARY); }
  catch { 
    try { data = await fetchJson(MIRROR); }
    catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
  }

  const matches = data.matches || [];
  const lastUpdated = data["last update time"] || "";

  const live = matches
    .filter((m: Record<string, unknown>) => m.isLive && (m.video_url || m.pub_url || m.dai_url))
    .map((m: Record<string, unknown>) => ({
      id: m.contentId,
      matchName: m.match_name,
      eventName: m.event_name,
      channel: m.broadcast_channel,
      category: m.event_category,
      language: m.audioLanguageName,
      thumbnail: m.src,
      streamUrl: m.video_url || m.pub_url || m.dai_url,
      isLive: true,
    }));

  const upcoming = matches
    .filter((m: Record<string, unknown>) => !m.isLive && m.match_name)
    .map((m: Record<string, unknown>) => ({
      id: m.contentId,
      matchName: m.match_name,
      eventName: m.event_name,
      channel: m.broadcast_channel,
      category: m.event_category,
      language: m.audioLanguageName,
      thumbnail: m.src,
      streamUrl: null,
      isLive: false,
    }));

  return NextResponse.json({ lastUpdated, liveCount: live.length, live, upcoming },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
