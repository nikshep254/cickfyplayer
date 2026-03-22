// src/lib/remoteConfig.ts
// Server-side only

const CRICFY_PACKAGE_NAME = process.env.CRICFY_PACKAGE_NAME!;
const CRICFY_FIREBASE_API_KEY = process.env.CRICFY_FIREBASE_API_KEY!;
const CRICFY_FIREBASE_APP_ID = process.env.CRICFY_FIREBASE_APP_ID!;

function getRandomInstanceId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function fetchRemoteConfig(): Promise<Record<string, string> | null> {
  if (!CRICFY_FIREBASE_API_KEY || !CRICFY_FIREBASE_APP_ID || !CRICFY_PACKAGE_NAME) {
    console.error("[remoteConfig] Missing Firebase credentials in env vars");
    return null;
  }

  const projectNumber = CRICFY_FIREBASE_APP_ID.split(":")[1];
  const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectNumber}/namespaces/firebase:fetch`;

  const payload = {
    appInstanceId: getRandomInstanceId(),
    appInstanceIdToken: "",
    appId: CRICFY_FIREBASE_APP_ID,
    countryCode: "US",
    languageCode: "en-US",
    platformVersion: "30",
    timeZone: "UTC",
    appVersion: "5.0",
    appBuild: "50",
    packageName: CRICFY_PACKAGE_NAME,
    sdkVersion: "22.1.0",
    analyticsUserProperties: {},
  };

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Android-Package": CRICFY_PACKAGE_NAME,
    "X-Goog-Api-Key": CRICFY_FIREBASE_API_KEY,
    "X-Google-GFE-Can-Retry": "yes",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      next: { revalidate: 3600 }, // cache 1hr in Next.js
    });

    if (!res.ok) {
      console.error(`[remoteConfig] Firebase error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    return data.entries ?? null;
  } catch (e) {
    console.error("[remoteConfig] Exception:", e);
    return null;
  }
}

export async function getProviderApiUrl(): Promise<string | null> {
  for (let i = 0; i < 3; i++) {
    const entries = await fetchRemoteConfig();
    if (entries) {
      return entries["cric_api2"] || entries["cric_api1"] || null;
    }
  }
  return null;
}
