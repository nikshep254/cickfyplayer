// src/app/api/daddylive/route.ts
// Direct M3U sources — GitHub raw URLs work from Vercel server

import { NextResponse } from "next/server";

export const revalidate = 1800;

const PROVIDERS = [
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
    title: "Jio Cinema",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc3qZ1WgzPyFRX4cWIBJF0MSjWW3gZcLFycg&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jcinema.m3u",
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
    title: "Sony IN 2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxsCm4WKugE7ubLr2J3AP7s-hqHl0dh69ImA&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/ramnarayan01/data/refs/heads/main/s0nyind.m3u.html",
  },
  {
    title: "Sun Direct",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwc4OuqPmOP-Fi9dhfiDw_q-s3rOmgCPla_IaE76VD2KRQ7c4KHeI2zJY&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/suntv.m3u",
  },
  {
    title: "JioTV+",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh5KeAyYdOyxaCWDPbiUsJW7Oy4v_7uFqf06rIwGxaWc6nQuNVqZ2Q_Qej&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jtv.m3u",
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
    title: "Dish TV",
    image: "https://m.media-amazon.com/images/S/stores-image-uploads-eu-prod/1/AmazonStores/A21TJRUUN4KGV/d5086253b614724be106c06be13f7d54.w600.h600._RO299,1,0,0,0,0,0,0,0,0,15_FMpng_.jpg",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/dishtv.m3u",
  },
  {
    title: "Samsung TV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI9T5vcm8wU-dLuaK5vBfoHpz8KL9Ru0aU1eoVaKNcqauxGtRTfvI1rGTA&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/samsungtv.m3u",
  },
  {
    title: "Zee5 Live",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS0OT2NFe9Jb4ofg_DrXx42EKLgyGnSGwoLg&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/doctor-8trange/quarnex/refs/heads/main/data/zee5.m3u",
  },
  {
    title: "Zee5 IN 2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS0OT2NFe9Jb4ofg_DrXx42EKLgyGnSGwoLg&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/z5.m3u",
  },
  {
    title: "Airtel IND",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf7pkggfHJKj2R8O6ttuHxgv-vQVL03xUeAg&usqp=CAU",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/artl.m3u",
  },
  {
    title: "LG TV IND",
    image: "https://raw.githubusercontent.com/alex8875/img/refs/heads/main/LG_tv.png",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/lgtv.m3u",
  },
  {
    title: "Run TV",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7zqXTonSH_Xo--YxMlOacinf7mhLwuwSFFF1KJa8lGw&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/runn.m3u",
  },
  {
    title: "Waves OTT",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNyx_lxD3xXIB8jpFGnMnHZIziUo1vKW9sSS-7zP-h0vhZT4cPB6wly6o&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/waves.m3u",
  },
  {
    title: "Prime Channel",
    image: "https://static.vecteezy.com/system/resources/previews/046/437/251/non_2x/amazon-prime-logo-free-png.png",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/amzusa.m3u",
  },
  {
    title: "Shooq PK",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvSWLnpgyvbzV9rHkREzbsX1Rzh2IbEZBL8yPpSv8aCPmy1nVcv7BhIWQ&s=10",
    catLink: "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/shoq.m3u",
  },
];

export async function GET() {
  return NextResponse.json({
    total: PROVIDERS.length,
    providers: PROVIDERS,
  });
}
