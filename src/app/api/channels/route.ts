// src/app/api/channels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decryptContent } from "@/lib/crypto";
import { parseM3U } from "@/lib/m3uParser";

const CUSTOM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
  Accept: "*/*",
  "Cache-Control": "no-cache, no-store",
};

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Invalid or missing url param" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: CUSTOM_HEADERS,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch M3U: HTTP ${res.status}`,
        url 
      }, { status: 502 });
    }

    const raw = await res.text();
    const decrypted = decryptContent(raw);
    const channels = parseM3U(decrypted);

    if (debug) {
      return NextResponse.json({
        channels,
        raw_preview: raw.slice(0, 800),
        decrypted_preview: decrypted.slice(0, 800),
        channel_count: channels.length,
      });
    }

    return NextResponse.json({ channels });
  } catch (e) {
    console.error("[api/channels]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
