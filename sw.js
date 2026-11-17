// 내 마음의 법문 — 오프라인에서도 열리도록 앱 파일을 폰에 보관합니다.
// 화면(index.html)은 인터넷이 되면 늘 새로 받아 업데이트가 바로 반영되고, 안 되면 보관본으로 엽니다.
const VERSION = "beopmun-2026-11-18-2";
const SHELL = ["./", "index.html", "jeongjeon.js", "daejonggyeong.js", "config.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
const fresh = url => fetch(new Request(url, {cache:"no-cache", credentials:"same-origin"}));
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => fresh(u).then(r => { if (r.ok) return c.put(u, r); })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return; // 함께 읽기 서버 요청은 그대로 통과
  if (req.mode === "navigate"){
    e.respondWith(fresh(req.url).then(r => { if (r.ok){ const c = r.clone(); caches.open(VERSION).then(ca => ca.put("index.html", c)); } return r; })
      .catch(() => caches.match("index.html").then(hit => hit || caches.match("./"))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, {ignoreSearch:true});
    const net = fresh(req.url).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
