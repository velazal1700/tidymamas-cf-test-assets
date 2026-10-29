// Owner push alerts only (no caching).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = { body: event.data && event.data.text() };
  }
  const tasks = [
    self.registration.showNotification(d.title || "TidyMamas", {
      body: d.body || "",
      icon: "/favicon.png",
      badge: "/favicon.png",
      data: { url: d.url || "/admin" },
    }),
  ];
  if (typeof d.badge === "number" && self.navigator.setAppBadge) {
    tasks.push(
      (d.badge > 0 ? self.navigator.setAppBadge(d.badge) : self.navigator.clearAppBadge()).catch(
        () => {},
      ),
    );
  }
  event.waitUntil(Promise.all(tasks));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) {
          await c.navigate(url).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
