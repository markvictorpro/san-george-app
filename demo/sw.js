// Offline service worker, filled in by scripts/build_web.sh. Every built file is cached under a
// cache named after the build (most up front, the large renderer files on first use), so the app
// opens without internet and never mixes two builds.
// Supabase and other network requests are never cached, except the barcode reader library that
// iPhone Safari loads from a CDN, which is kept after its first use.
const CACHE = "sg_san-george-app_demo_|57a13070fb124ff2";
const FILES = ["./", ".last_build_id", "assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/NOTICES", "assets/assets/demo/catalog.json", "assets/assets/fonts/IBMPlexSansArabic-Bold.ttf", "assets/assets/fonts/IBMPlexSansArabic-Light.ttf", "assets/assets/fonts/IBMPlexSansArabic-Medium.ttf", "assets/assets/fonts/IBMPlexSansArabic-Regular.ttf", "assets/assets/fonts/IBMPlexSansArabic-SemiBold.ttf", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf", "assets/packages/material_ui/shaders/ink_sparkle.frag", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "drift_worker.js", "favicon.png", "flutter.js", "flutter_bootstrap.js", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "index.html", "main.dart.js", "manifest.json", "sqlite3.wasm", "version.json"];
const LAZY = ["canvaskit/canvaskit.js", "canvaskit/canvaskit.js.symbols", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.js.symbols", "canvaskit/chromium/canvaskit.wasm", "canvaskit/skwasm.js", "canvaskit/skwasm.js.symbols", "canvaskit/skwasm.wasm", "canvaskit/skwasm_heavy.js", "canvaskit/skwasm_heavy.js.symbols", "canvaskit/skwasm_heavy.wasm", "canvaskit/webparagraph/canvaskit.js", "canvaskit/webparagraph/canvaskit.js.symbols", "canvaskit/webparagraph/canvaskit.wasm", "canvaskit/wimp.js", "canvaskit/wimp.js.symbols", "canvaskit/wimp.wasm", "vision/mobilenet_v3_large.tflite", "vision/sg_vision.js", "vision/vision_bundle.mjs", "vision/wasm/vision_wasm_internal.js", "vision/wasm/vision_wasm_internal.wasm", "vision/wasm/vision_wasm_nosimd_internal.js", "vision/wasm/vision_wasm_nosimd_internal.wasm"];
const RUNTIME = 'sg-runtime-v1';
const RUNTIME_HOSTS = ['cdn.jsdelivr.net', 'fastly.jsdelivr.net', 'unpkg.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        FILES.map((file) =>
          fetch(new Request(file, { cache: 'reload' })).then((response) => {
            if (!response.ok) throw new Error('precache ' + file + ' ' + response.status);
            return cache.put(file, response);
          }),
        ),
      ),
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && key !== RUNTIME && key.startsWith(CACHE.slice(0, -16)))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) {
    const rel = url.pathname.slice(scope.pathname.length);
    // Only this build's own page and files: a nested app (the demo under /demo/) has its own
    // worker, and this one must never answer for it.
    const key = rel === '' || rel === 'index.html' ? './' : rel;
    const lazy = LAZY.includes(key);
    if (key !== './' && !lazy && !FILES.includes(key)) return;
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(key).then(
          (hit) =>
            hit ||
            fetch(request).then((response) => {
              if (lazy && response.ok) cache.put(key, response.clone());
              return response;
            }),
        ),
      ),
    );
    return;
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(RUNTIME).then((cache) =>
        cache.match(request).then(
          (hit) =>
            hit ||
            fetch(request).then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            }),
        ),
      ),
    );
  }
});
