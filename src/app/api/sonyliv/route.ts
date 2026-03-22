// src/app/api/sonyliv/route.ts
// Fetches live SonyLiv match stream URLs from auto-updated GitHub repo
// Source updates every 7 minutes with fresh hdnea tokens

import { NextResponse } from "next/server";

// Primary source — drmlive (original)
const PRIMARY_URL = "https://raw.githubusercontent.com/drmlive/sliv-live-events/refs/heads/main/sonyliv.json";
// Mirror — kajju027 (synced every 7 min)
const MIRROR_URL = "https://raw.githubusercontent.com/kajju027/SonyLiv-Events-Json/refs/heads/main/sonyliv.json";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

interface SonyMatch {
  event_category: string;
  isLive: boolean;
  contentId: string;
  src: string;
  broadcast_channel: string;
  audioLanguageName: string;
  event_name: string;
  match_name: string;
  dai_url: string;
  pub_url: string;
  video_url: string;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 120 }, // cache 2 min — tokens valid ~hours
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function GET() {
  let data;

  // Try primary, fall back to mirror
  try {
    data = await fetchJson(PRIMARY_URL);
  } catch {
    try {
      data = await fetchJson(MIRROR_URL);
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  const matches: SonyMatch[] = data.matches || [];
  const lastUpdated: string = data["last update time"] || "";

  // Only return matches that are live and have a valid stream URL
  const live = matches
    .filter(m => m.isLive && (m.video_url || m.pub_url || m.dai_url))
    .map(m => ({
      id: m.contentId,
      matchName: m.match_name,
      eventName: m.event_name,
      channel: m.broadcast_channel,
      category: m.event_category,
      language: m.audioLanguageName,
      thumbnail: m.src,
      streamUrl: m.video_url || m.pub_url || m.dai_url,
      isLive: m.isLive,
    }));

  // Also return upcoming (not live but have future match info)
  const upcoming = matches
    .filter(m => !m.isLive && m.match_name)
    .map(m => ({
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

  return NextResponse.json({
    lastUpdated,
    liveCount: live.length,
    live,
    upcoming,
  });
}
