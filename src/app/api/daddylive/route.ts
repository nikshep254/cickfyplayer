// src/app/api/daddylive/route.ts
import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1hr

const REFERER = "https://lewblivehdplay.ru/";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_0 like Mac OS X) AppleWebKit/605.2.10 (KHTML, like Gecko) Version/17.6.0 Mobile/16F152 Safari/605.2";
const BASE = "https://xyzdddd.mizhls.ru/lb";

// Hardcoded cricket/sports channels from DaddyLive
// Source: dlhd.so channel list — these IDs are stable
const CHANNELS = [
  // Cricket
  { name: "Willow Cricket HD", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Willow_TV_logo.svg/200px-Willow_TV_logo.svg.png", id: 215 },
  { name: "Star Sports 1 HD", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Star_Sports_1_logo.svg/200px-Star_Sports_1_logo.svg.png", id: 503 },
  { name: "Star Sports 2 HD", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Star_Sports_2_logo.svg/200px-Star_Sports_2_logo.svg.png", id: 504 },
  { name: "Star Sports 1 Hindi", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/3/3d/Star_Sports_1_logo.svg", id: 505 },
  { name: "Star Sports 3", group: "Cricket", logo: "", id: 506 },
  { name: "Sky Sports Cricket HD", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Sky_Sports_Cricket_2020.png/200px-Sky_Sports_Cricket_2020.png", id: 56 },
  { name: "Sky Sports Main Event", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Sky_Sports_Main_Event_2020.png/200px-Sky_Sports_Main_Event_2020.png", id: 55 },
  { name: "A Sports HD", group: "Cricket", logo: "", id: 519 },
  { name: "PTV Sports", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/PTV_Sports.png/200px-PTV_Sports.png", id: 388 },
  { name: "Geo Super", group: "Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Geo_Super.png/200px-Geo_Super.png", id: 389 },
  { name: "DSport", group: "Cricket", logo: "", id: 507 },
  { name: "Ten 1 HD", group: "Cricket", logo: "", id: 497 },
  { name: "Ten 2 HD", group: "Cricket", logo: "", id: 498 },
  { name: "Ten 3 HD", group: "Cricket", logo: "", id: 499 },
  { name: "Fancode", group: "Cricket", logo: "", id: 554 },
  // Football
  { name: "Sky Sports Football HD", group: "Football", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Sky_Sports_Football_2020.png/200px-Sky_Sports_Football_2020.png", id: 57 },
  { name: "Sky Sports Premier League HD", group: "Football", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Sky_Sports_Premier_League_2020.png/200px-Sky_Sports_Premier_League_2020.png", id: 60 },
  { name: "TNT Sports 1 HD", group: "Football", logo: "", id: 74 },
  { name: "TNT Sports 2 HD", group: "Football", logo: "", id: 75 },
  { name: "TNT Sports 3 HD", group: "Football", logo: "", id: 76 },
  { name: "TNT Sports 4 HD", group: "Football", logo: "", id: 77 },
  { name: "beIN Sports 1 HD", group: "Football", logo: "", id: 366 },
  { name: "beIN Sports 2 HD", group: "Football", logo: "", id: 367 },
  { name: "ESPN USA", group: "Football", logo: "", id: 151 },
  { name: "ESPN2 USA", group: "Football", logo: "", id: 152 },
  // Multi-sport
  { name: "Sky Sports Action HD", group: "Sports", logo: "", id: 58 },
  { name: "Sky Sports Arena HD", group: "Sports", logo: "", id: 59 },
  { name: "Eurosport 1 HD", group: "Sports", logo: "", id: 95 },
  { name: "Eurosport 2 HD", group: "Sports", logo: "", id: 96 },
  { name: "Fox Sports 1 USA", group: "Sports", logo: "", id: 156 },
  { name: "Fox Sports 2 USA", group: "Sports", logo: "", id: 157 },
  { name: "SuperSport Cricket", group: "Cricket", logo: "", id: 430 },
  { name: "SuperSport Rugby", group: "Sports", logo: "", id: 431 },
  { name: "DAZN 1 HD", group: "Sports", logo: "", id: 358 },
  { name: "DAZN 2 HD", group: "Sports", logo: "", id: 359 },
];

export async function GET() {
  const channels = CHANNELS.map(ch => ({
    name: ch.name,
    group: ch.group,
    logo: ch.logo,
    url: `${BASE}/premium${ch.id}/index.m3u8`,
    referer: REFERER,
    userAgent: UA,
  }));

  const groups = [...new Set(channels.map(c => c.group))];

  return NextResponse.json({ total: channels.length, channels, groups });
}
