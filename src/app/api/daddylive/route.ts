// src/app/api/daddylive/route.ts
import { NextResponse } from "next/server";

const PLAYLIST_URL = "https://bit.ly/ddy-m3u1";
const REFERER = "https://lewblivehdplay.ru/";
const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_0 like Mac OS X) AppleWebKit/605.2.10 (KHTML, like Gecko) Version/17.6.0 Mobile/16F152 Safari/605.2";

// Keywords to filter sports/cricket channels
const SPORTS_KEYWORDS = [
  "cricket", "star sports", "willow", "sky sports", "espn", "sony",
  "ten ", "ten1", "ten2", "ten3", "fox sports", "bt sport", "tnt sports",
  "eurosport", "dazn", "supersport", "sport", "ptv sports", "geo super",
  "a sports", "dsport", "fancode", "jio", "sonyliv"
];

function isSportsChannel(name: string, group: string): boolean {
  const lower = (name + " " + group).toLowerCase();
  return SPORTS_KEYWORDS.some(k => lower.includes(k));
}

function parseM3UPlaylist(content: string) {
  const lines = content.split("\n");
  const channels: {
    name: string;
    logo: string;
    group: string;
    url: string;
    referer: string;
    userAgent: string;
  }[] = [];

  let currentInfo: { name: string; logo: string; group: string } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      // Extract attributes
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const nameMatch = line.split(",").pop()?.trim() || "Unknown";

      currentInfo = {
        name: nameMatch,
        logo: logoMatch?.[1] || "",
        group: groupMatch?.[1] || "",
      };
    } else if (!line.startsWith("#") && currentInfo) {
      channels.push({
        name: currentInfo.name,
        logo: currentInfo.logo,
        group: currentInfo.group,
        url: line,
        referer: REFERER,
        userAgent: USER_AGENT,
      });
      currentInfo = null;
    }
  }

  return channels;
}

export async function GET() {
  try {
    const res = await fetch(PLAYLIST_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        "Referer": REFERER,
      },
      next: { revalidate: 1800 }, // cache 30 min
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch DaddyLive playlist" }, { status: 502 });
    }

    const text = await res.text();
    const allChannels = parseM3UPlaylist(text);

    // Filter to sports only
    const sportsChannels = allChannels.filter(ch =>
      isSportsChannel(ch.name, ch.group)
    );

    // Group them
    const grouped: Record<string, typeof sportsChannels> = {};
    for (const ch of sportsChannels) {
      const g = ch.group || "Other";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(ch);
    }

    return NextResponse.json({
      total: sportsChannels.length,
      channels: sportsChannels,
      groups: Object.keys(grouped),
    });
  } catch (e) {
    console.error("[api/daddylive]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
