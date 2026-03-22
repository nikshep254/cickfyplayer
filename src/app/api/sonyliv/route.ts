// src/app/api/sonyliv/route.ts
// Aggregates ALL drmlive sources: SonyLiv, FanCode, Willow, TataPlay

import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

const SOURCES = [
  {
    name: "SonyLiv",
    url: "https://raw.githubusercontent.com/drmlive/sliv-live-events/refs/heads/main/sonyliv.json",
    color: "#0066cc",
  },
  {
    name: "FanCode",
    url: "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json",
    color: "#ff6b00",
  },
  {
    name: "Willow",
    url: "https://raw.githubusercontent.com/drmlive/willow-live-events/refs/heads/main/willow.json",
    color: "#00aa44",
  },
];

async function fetchSource(source: typeof SOURCES[0]) {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { data, source };
  } catch {
    return null;
  }
}

const FANCODE_WORKER = "https://fancode-india-sonu.pages.dev/api";

function extractMatches(data: Record<string, unknown>, sourceName: string) {
  const matches = (data.matches || data.channels || data.events || []) as Record<string, unknown>[];
  return matches.map((m: Record<string, unknown>) => {
    const matchId = m.match_id || m.contentId || m.id;
    const language = String(m.language || m.audioLanguageName || "ENGLISH").toUpperCase();
    const status = String(m.status || "").toUpperCase();
    const isLive = Boolean(m.isLive || m.is_live || status === "LIVE");

    // For FanCode: build stream URL from worker using match_id
    let streamUrl = String(m.video_url || m.adfree_url || m.pub_url || m.dai_url || m.stream_url || "");
    if (sourceName === "FanCode" && matchId && isLive) {
      streamUrl = `${FANCODE_WORKER}/${matchId}_${language}_sayan.m3u8`;
    }

    return {
      id: String(matchId || Math.random()),
      matchName: String(m.match_name || m.title || m.name || "Unknown Match"),
      eventName: String(m.event_name || m.tournament || ""),
      channel: String(m.broadcast_channel || m.channel || sourceName),
      category: String(m.event_category || m.sport || m.category || "Sports"),
      language,
      thumbnail: String(m.src || m.thumbnail || m.image || m.logo || ""),
      streamUrl,
      isLive,
      source: sourceName,
    };
  }).filter(m => m.streamUrl && m.streamUrl !== "null" && m.streamUrl !== "undefined" && m.isLive);
}

export async function GET() {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));

  const allLive: ReturnType<typeof extractMatches> = [];
  const allUpcoming: ReturnType<typeof extractMatches> = [];
  const sourceStatus: Record<string, string> = {};

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const { data, source } = result.value;
      const matches = extractMatches(data as Record<string, unknown>, source.name);
      const live = matches.filter(m => m.isLive);
      const upcoming = matches.filter(m => !m.isLive && m.matchName !== "Unknown Match");
      allLive.push(...live);
      allUpcoming.push(...upcoming);
      sourceStatus[source.name] = `✅ ${live.length} live`;
    } else {
      const sourceName = SOURCES[results.indexOf(result)]?.name || "Unknown";
      sourceStatus[sourceName] = "❌ failed";
    }
  }

  // Sort: cricket first, then other sports
  const cricketFirst = (a: typeof allLive[0], b: typeof allLive[0]) => {
    const ac = a.category.toLowerCase().includes("cricket") ? 0 : 1;
    const bc = b.category.toLowerCase().includes("cricket") ? 0 : 1;
    return ac - bc;
  };

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    liveCount: allLive.length,
    live: allLive.sort(cricketFirst),
    upcoming: allUpcoming.sort(cricketFirst).slice(0, 20),
    sources: sourceStatus,
  });
}
