// src/app/api/proxy/route.ts
// Server-side HLS proxy — fetches streams with proper headers, rewrites manifest URLs

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const MOBILE_UA =
  "Dalvik/2.1.0 (Linux; U; Android 12; Pixel 6 Build/SQ3A.220705.004)";

// Headers that should never be forwarded to the upstream
const BLOCKED_REQ_HEADERS = new Set([
  "host", "connection", "transfer-encoding", "te",
  "trailer", "upgrade", "proxy-authorization", "proxy-connection",
]);

// Headers that should never be forwarded to the client
const BLOCKED_RES_HEADERS = new Set([
  "transfer-encoding", "connection", "keep-alive",
  "content-encoding", // we decode on the server
]);

function buildProxyUrl(targetUrl: string, extraParams: Record<string, string> = {}): string {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "";
  const params = new URLSearchParams({ url: targetUrl, ...extraParams });
  return `${base}/api/proxy?${params}`;
}

function rewriteM3U8(content: string, baseUrl: string, extraParams: Record<string, string>): string {
  const base = new URL(baseUrl);
  const lines = content.split("\n");

  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      // Rewrite URI= attributes inside tags like #EXT-X-KEY, #EXT-X-MAP etc.
      return line.replace(/URI="([^"]+)"/g, (_, uri) => {
        const abs = new URL(uri, base).toString();
        return `URI="${buildProxyUrl(abs, extraParams)}"`;
      });
    }

    // It's a segment/playlist URL
    try {
      const abs = new URL(trimmed, base).toString();
      return buildProxyUrl(abs, extraParams);
    } catch {
      return line;
    }
  }).join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Decode extra params to forward (headers etc.)
  const userAgent = searchParams.get("ua") || DEFAULT_UA;
  const referer = searchParams.get("ref") || "";
  const cookie = searchParams.get("cookie") || "";
  const origin = searchParams.get("origin") || "";

  // Extra params to carry through the proxy chain
  const extraParams: Record<string, string> = {};
  if (searchParams.get("ua")) extraParams.ua = searchParams.get("ua")!;
  if (searchParams.get("ref")) extraParams.ref = searchParams.get("ref")!;
  if (searchParams.get("cookie")) extraParams.cookie = searchParams.get("cookie")!;
  if (searchParams.get("origin")) extraParams.origin = searchParams.get("origin")!;

  // Build upstream request headers
  const upstreamHeaders: Record<string, string> = {
    "User-Agent": userAgent,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };

  if (referer) {
    upstreamHeaders["Referer"] = referer;
    upstreamHeaders["Origin"] = origin || new URL(referer).origin;
  }
  if (cookie) upstreamHeaders["Cookie"] = cookie;
  if (origin) upstreamHeaders["Origin"] = origin;

  // Forward safe headers from the original request
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!BLOCKED_REQ_HEADERS.has(lower) && !lower.startsWith(":")) {
      if (lower === "range") upstreamHeaders["Range"] = value;
    }
  });

  try {
    const upstream = await fetch(targetUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    const isM3U8 =
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegurl") ||
      targetUrl.includes(".m3u8") ||
      targetUrl.includes(".m3u");

    // Build response headers
    const resHeaders = new Headers();
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    resHeaders.set("Access-Control-Allow-Headers", "*");
    resHeaders.set("Cache-Control", "no-cache, no-store");

    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!BLOCKED_RES_HEADERS.has(lower)) {
        resHeaders.set(key, value);
      }
    });

    if (isM3U8) {
      // Rewrite manifest so all segment/key URLs go through our proxy
      const text = await upstream.text();
      const rewritten = rewriteM3U8(text, targetUrl, extraParams);
      resHeaders.set("Content-Type", "application/vnd.apple.mpegurl");
      resHeaders.set("Content-Length", Buffer.byteLength(rewritten).toString());
      return new NextResponse(rewritten, { status: 200, headers: resHeaders });
    }

    // For segments / key files / other — stream the bytes through
    resHeaders.set("Content-Type", contentType || "application/octet-stream");
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, { status: upstream.status, headers: resHeaders });

  } catch (e) {
    console.error("[proxy]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
