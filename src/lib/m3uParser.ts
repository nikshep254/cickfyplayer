// src/lib/m3uParser.ts

export interface PlaylistItem {
  title: string;
  url: string;
  tvgLogo: string;
  groupTitle: string;
  userAgent: string;
  cookie: string;
  referer: string;
  licenseString: string;
  headers: Record<string, string>;
  isDrm: boolean;
}

export function parseM3U(content: string): PlaylistItem[] {
  const lines = content.split("\n");
  const items: PlaylistItem[] = [];

  let bufUserAgent: string | null = null;
  let bufCookie: string | null = null;
  let bufReferer: string | null = null;
  let bufLicenseString: string | null = null;
  let bufAttrs: Record<string, string> | null = null;
  let bufTitle: string | null = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      const matches = [...line.matchAll(/([a-zA-Z0-9_-]+)=("([^"]*)"|([^,]+))/g)];
      const attrs: Record<string, string> = {};
      for (const m of matches) {
        attrs[m[1]] = m[3] ?? m[4] ?? "";
      }
      bufAttrs = attrs;

      const parts = line.split(",");
      bufTitle = parts.length > 1 ? parts[parts.length - 1].trim() : "Unknown Channel";
    } else if (line.startsWith("#EXTVLCOPT")) {
      if (line.includes("http-user-agent=")) {
        bufUserAgent = line.split("http-user-agent=")[1];
      }
      if (line.includes("http-referrer=")) {
        bufReferer = line.split("http-referrer=")[1];
      }
    } else if (line.startsWith("#EXTHTTP")) {
      try {
        const jsonStr = line.replace("#EXTHTTP:", "");
        const data = JSON.parse(jsonStr);
        if (data.cookie) bufCookie = data.cookie;
        if (data["user-agent"]) bufUserAgent = data["user-agent"];
      } catch {}
    } else if (line.startsWith("#KODIPROP:inputstream.adaptive.license_key=")) {
      bufLicenseString = line.split("=").slice(1).join("=");
    } else if (!line.startsWith("#")) {
      const item: PlaylistItem = {
        title: bufTitle ?? "Unknown Channel",
        url: "",
        tvgLogo: bufAttrs?.["tvg-logo"] ?? "",
        groupTitle: bufAttrs?.["group-title"] ?? "",
        userAgent: bufUserAgent ?? "",
        cookie: bufCookie ?? "",
        referer: bufReferer ?? "",
        licenseString: bufLicenseString ?? "",
        headers: {},
        isDrm: !!bufLicenseString,
      };

      if (line.includes("|")) {
        const [baseUrl, paramStr] = line.split("|");
        item.url = baseUrl;
        for (const param of paramStr.split("&")) {
          if (!param.includes("=")) continue;
          const [k, ...vParts] = param.split("=");
          const v = vParts.join("=");
          const kl = k.toLowerCase();
          if (kl === "user-agent") item.userAgent = v;
          else if (kl === "referer") item.referer = v;
          else if (kl === "cookie") item.cookie = v;
          else item.headers[k] = v;
        }
      } else {
        item.url = line;
      }

      items.push(item);

      // Reset buffers
      bufUserAgent = null;
      bufCookie = null;
      bufReferer = null;
      bufLicenseString = null;
      bufAttrs = null;
      bufTitle = null;
    }
  }

  return items;
}
