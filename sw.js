/* 星星罐罐 · 离线缓存 / 自动更新
   策略：network-first（每次都先联网拿最新，失败才回落缓存）→ 保证发新版后手机立刻可见，
   不会再出现"改了但手机上没变化"。 */
const V = "sj-v3";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const cache = await caches.open(V);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cache = await caches.open(V);
      const hit = await cache.match(req);
      if (hit) return hit;
      throw err;
    }
  })());
});
