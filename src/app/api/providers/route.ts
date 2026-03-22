// src/app/api/providers/route.ts
import { NextResponse } from "next/server";
import { getProviderApiUrl } from "@/lib/remoteConfig";
import { decryptData } from "@/lib/crypto";

const CUSTOM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
  Accept: "*/*",
  "Cache-Control": "no-cache, no-store",
};

export async function GET() {
  try {
    const apiUrl = await getProviderApiUrl();
    if (!apiUrl) {
      return NextResponse.json({ error: "Could not fetch provider API URL" }, { status: 502 });
    }

    const res = await fetch(`${apiUrl}/cats.txt`, {
      headers: CUSTOM_HEADERS,
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch providers" }, { status: 502 });
    }

    const raw = await res.text();
    const decrypted = decryptData(raw);

    if (!decrypted) {
      return NextResponse.json({ error: "Failed to decrypt providers" }, { status: 500 });
    }

    const providers = JSON.parse(decrypted);
    if (!Array.isArray(providers)) {
      return NextResponse.json({ error: "Invalid provider data" }, { status: 500 });
    }

    return NextResponse.json({ providers });
  } catch (e) {
    console.error("[api/providers]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
