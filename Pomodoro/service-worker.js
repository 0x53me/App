const CACHE_NAME = `pomodoro-cache-${APP_VERSION}`; // version.jsを読み込む場合はimportScriptsを使う
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./beep.mp3",
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
];

// service worker 内で version.js を読み込む
importScripts('version.js');


self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});