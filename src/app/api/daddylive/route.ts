// src/app/api/daddylive/route.ts
// Uses hardcoded fallback provider URLs from CNCVerse CloudStream extension
// These are direct M3U sources that bypass Firebase/encryption

import { NextResponse } from "next/server";

export const revalidate = 1800;

// Direct provider URLs extracted from CNCVerse ProviderManager.kt fallback list
// These are the same URLs used by the Cricfy CloudStream extension
const PROVIDERS = [
  // Cricket focused
  { id: 165, title: "ICC TV", image: "https://m.media-amazon.com/images/I/31F7ropt9OL.png", catLink: "https://icc.alpha-circuit.workers.dev/?token=42e4f5-2d863b-3c37d8-7f3f69" },
  { id: 146, title: "CRICHD", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ08h1gOe7MPxwehZBrbYKAUtjv22B6rAJ1kMkN-cea64Ka49KUyGU2lpTz&s=10", catLink: "https://github.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/raw/main/ALL.m3u" },
  { id: 150, title: "ZAP SPORTS", image: "https://i.ibb.co/dJfysm3V/zap-Sports.png", catLink: "https://tv.noobon.top/zapx/api.php?action=getIPTVPlaylist" },
  { id: 151, title: "Pirates TV", image: "https://raw.githubusercontent.com/FunctionError/Logos/main/Pirates-Tv.png", catLink: "https://raw.githubusercontent.com/FunctionError/PiratesTv/refs/heads/main/combined_playlist.m3u" },
  { id: 190, title: "FREE SPORTS", image: "https://media.unreel.me/prod/freelivesports/general/6496be67-a318-46c6-a25d-93c161f86845", catLink: "https://playlist-storage.pages.dev/PLAYLIST/freelivesports.m3u" },
  { id: 18,  title: "FANCODE IND", image: "https://play-lh.googleusercontent.com/lp1Tdhp75MQyrHqrsyRBV74HxoL3Ko8KRAjOUI1wUHREAxuuVwKR6vnamgvMEn4C4Q", catLink: "https://raw.githubusercontent.com/Jitendra-unatti/fancode/refs/heads/main/data/fancode.m3u" },
  // Jio
  { id: 22,  title: "JIO IND", image: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jio-logo-icon.png", catLink: "https://jiotv.byte-vault.workers.dev/?token=42e4f5-2d873b-3c37d8-7f3f50" },
  { id: 177, title: "JIO IND 2", image: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/jio-logo-icon.png", catLink: "https://playlist-cricfy.noobon.top/noob/jiotv.php" },
  { id: 106, title: "JIOTV+", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh5KeAyYdOyxaCWDPbiUsJW7Oy4v_7uFqf06rIwGxaWc6nQuNVqZ2Q_Qej&s=10", catLink: "https://jiotvplus.byte-vault.workers.dev/?token=42e4f5-2d863b-3c38d8-7f3f51" },
  { id: 110, title: "JIOLIVE IND", image: "https://lens-storage.storage.googleapis.com/png/bb364a303da24e5db23f01bac26949cf", catLink: "https://raw.githubusercontent.com/alex8875/jc_live/refs/heads/main/jevents_live.m3u" },
  { id: 130, title: "JIO CINEMA", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc3qZ1WgzPyFRX4cWIBJF0MSjWW3gZcLFycg&usqp=CAU", catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jcinema.m3u" },
  { id: 163, title: "JIOHOTSTAR", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPuz9ekmjh3vEpEc3lYL4nh6Gj7y2CQTswVG-ZCHnIS1foScuwPzuyxic&s=10", catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jstar.m3u" },
  // Sony
  { id: 19,  title: "SONYLIV", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzscCrHEfnHNeZdMO3haF1XSVgjskN4TNv0g&usqp=CAU", catLink: "https://raw.githubusercontent.com/doctor-8trange/zyphora/refs/heads/main/data/sony.m3u" },
  { id: 29,  title: "SONY IN", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxsCm4WKugE7ubLr2J3AP7s-hqHl0dh69ImA&usqp=CAU", catLink: "https://sonyliv.logic-lane.workers.dev?token=a14d9c-4b782a-6c90fd-9a1b84" },
  { id: 31,  title: "SONY IN 2", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxsCm4WKugE7ubLr2J3AP7s-hqHl0dh69ImA&usqp=CAU", catLink: "https://raw.githubusercontent.com/ramnarayan01/data/refs/heads/main/s0nyind.m3u.html" },
  // Hotstar / Tata
  { id: 13,  title: "TATA PLAY", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz_qYe3Y4S5bXXVlPtXQnqtAkLw1-no57QHhPyMgWE0SQmxujzHxZKiDs&s=10", catLink: "https://hotstarlive.delta-cloud.workers.dev/?token=240bb9-374e2e-3c13f0-4a7xz5" },
  { id: 14,  title: "HOTSTAR", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWwYjMvB58DMLsL9Ii2fhvw6NBYvD1iVCjOMU8TXBLJt0eibLGOjoRkLJP&s=10", catLink: "https://hotstar-live-event.alpha-circuit.workers.dev/?token=a13d9c-4b782a-6c90fd-9a1b84" },
  { id: 158, title: "DEKHO 24X7", image: "https://tstatic.videoready.tv/cms-ui/images/custom-content/1739684250358.png", catLink: "https://dehkho24h.alpha-circuit.workers.dev/?token=1b8j9b-796c8a-36e17f-8f83a5" },
  // Pakistan cricket
  { id: 114, title: "TAPMAD PK", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4X-7suwtvYWwoa6m0ngFTKZt5Hg5Z2kQF1g&usqp=CAU", catLink: "https://tv.noobon.top/playlist/tapmad.php" },
  // Other sports
  { id: 92,  title: "DISTRO TV", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYQjBTT5SL_kuJF7CbQtoSEA7PzyiH9RYIuDO9F1sx87CtiULDyiDf7ybt&s=10", catLink: "https://playlist-storage.pages.dev/PLAYLIST/DistroTV.m3u" },
  { id: 186, title: "FREE TV", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS4HoWswvKYjnMyenamwz-xBJq0PLSyZYpo0kp3oN6gw&s=10", catLink: "https://playlist-storage.pages.dev/PLAYLIST/freetv.m3u" },
  { id: 173, title: "WORLD SPORTS", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7iSlqAmYv4wa-7P9aRqiLVniqbUQUtVNmgsf4BxJJqpRKNJVhlVHvFKI&s=10", catLink: "https://tv.xmasterbd.sbs/dhd/playlist.php" },
  { id: 152, title: "YUPPTV", image: "https://d229kpbsb5jevy.cloudfront.net/bott/v2/networks/circularimages/yupptv.png", catLink: "https://tv.noobon.top/playlist/yapp.php" },
];

export async function GET() {
  return NextResponse.json({
    total: PROVIDERS.length,
    providers: PROVIDERS,
  });
}
