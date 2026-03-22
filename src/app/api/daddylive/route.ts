// src/app/api/daddylive/route.ts
import { NextResponse } from "next/server";

export const revalidate = 1800;

const PROVIDERS = [
  // ✅ CONFIRMED WORKING
  {
    title: "Pirates TV 🏏",
    image: "https://raw.githubusercontent.com/FunctionError/Logos/main/Pirates-Tv.png",
    catLink: "https://raw.githubusercontent.com/FunctionError/PiratesTv/refs/heads/main/combined_playlist.m3u",
  },
  {
    title: "CricHD",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ08h1gOe7MPxwehZBrbYKAUtjv22B6rAJ1kMkN-cea64Ka49KUyGU2lpTz&s=10",
    catLink: "https://raw.githubusercontent.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/main/ALL.m3u",
  },
  // Sony & Zee HLS no-DRM (from JioHotstar repo — tataplay CDN)
  {
    title: "Sony Sports & Entertainment",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxsCm4WKugE7ubLr2J3AP7s-hqHl0dh69ImA&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/jiotv.json",
    isJson: true, // handled differently
  },
  // Other GitHub raw sources
  {
    title: "FanCode IND",
    image: "https://play-lh.googleusercontent.com/lp1Tdhp75MQyrHqrsyRBV74HxoL3Ko8KRAjOUI1wUHREAxuuVwKR6vnamgvMEn4C4Q",
    catLink: "https://raw.githubusercontent.com/Jitendra-unatti/fancode/refs/heads/main/data/fancode.m3u",
  },
  {
    title: "Free Sports",
    image: "https://media.unreel.me/prod/freelivesports/general/6496be67-a318-46c6-a25d-93c161f86845",
    catLink: "https://playlist-storage.pages.dev/PLAYLIST/freelivesports.m3u",
  },
  {
    title: "JioLive IND",
    image: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jio-logo-icon.png",
    catLink: "https://raw.githubusercontent.com/alex8875/jc_live/refs/heads/main/jevents_live.m3u",
  },
  {
    title: "JioHotstar",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPuz9ekmjh3vEpEc3lYL4nh6Gj7y2CQTswVG-ZCHnIS1foScuwPzuyxic&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jstar.m3u",
  },
  {
    title: "Sony LIV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzscCrHEfnHNeZdMO3haF1XSVgjskN4TNv0g&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/doctor-8trange/zyphora/refs/heads/main/data/sony.m3u",
  },
  {
    title: "Distro TV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYQjBTT5SL_kuJF7CbQtoSEA7PzyiH9RYIuDO9F1sx87CtiULDyiDf7ybt&s=10",
    catLink: "https://playlist-storage.pages.dev/PLAYLIST/DistroTV.m3u",
  },
  {
    title: "Free TV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS4HoWswvKYjnMyenamwz-xBJq0PLSyZYpo0kp3oN6gw&s=10",
    catLink: "https://playlist-storage.pages.dev/PLAYLIST/freetv.m3u",
  },
  {
    title: "Samsung TV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI9T5vcm8wU-dLuaK5vBfoHpz8KL9Ru0aU1eoVaKNcqauxGtRTfvI1rGTA&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/samsungtv.m3u",
  },
  {
    title: "Dish TV",
    image: "https://m.media-amazon.com/images/S/stores-image-uploads-eu-prod/1/AmazonStores/A21TJRUUN4KGV/d5086253b614724be106c06be13f7d54.w600.h600.png",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/dishtv.m3u",
  },
  {
    title: "Zee5 Live",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS0OT2NFe9Jb4ofg_DrXx42EKLgyGnSGwoLg&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/doctor-8trange/quarnex/refs/heads/main/data/zee5.m3u",
  },
  {
    title: "Sun Direct",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwc4OuqPmOP-Fi9dhfiDw_q-s3rOmgCPla_IaE76VD2KRQ7c4KHeI2zJY&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/suntv.m3u",
  },
];

// Also expose a /api/daddylive/jiotv endpoint via query param
export async function GET(req: Request) {
  const url = new URL(req.url);

  // Special: return JioTV HLS-only channels as M3U
  if (url.searchParams.get("type") === "jiotv") {
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/jiotv.json",
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        const channels = (data.channels || []).filter(
          (c: { stream_url?: string; license_url?: string }) =>
            c.stream_url?.includes(".m3u8") && !c.license_url
        );
        const m3u = ["#EXTM3U",
          ...channels.flatMap((c: {
            logo_url?: string;
            group_title?: string;
            title?: string;
            user_agent?: string;
            stream_url?: string;
          }) => {
            const lines = [`#EXTINF:-1 tvg-logo="${c.logo_url || ""}" group-title="${c.group_title || ""}",${c.title || ""}` ];
            if (c.user_agent) lines.push(`#EXTVLCOPT:http-user-agent=${c.user_agent}`);
            lines.push(c.stream_url || "");
            return lines;
          })
        ].join("\n");
        return new Response(m3u, { headers: { "Content-Type": "application/vnd.apple.mpegurl" } });
      }
    } catch {}
  }

  // Default: return provider list
  const providers = PROVIDERS.filter(p => !p.isJson).map(({ isJson: _, ...p }) => p);
  // Add JioTV as a provider using our own endpoint
  const allProviders = [
    {
      title: "Sony Ten 1 + Zee (HLS)",
      image: "https://i.postimg.cc/d00sTpK0/SONY-SPORTS-TEN-1-HD.png",
      catLink: `${url.origin}/api/daddylive?type=jiotv`,
    },
    ...providers,
  ];

  return NextResponse.json({ total: allProviders.length, providers: allProviders });
}
