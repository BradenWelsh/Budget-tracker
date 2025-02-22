const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;

const FILES_TO_CACHE = [
  "./css/styles.css",
  "./manifest.json",
  "./js/idb.js",
  "./js/index.js",
  "./index.html",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png"
];
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache: " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeepList.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeepList.indexOf(key) === -1) {
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});