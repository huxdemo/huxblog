/* ===========================================================
 * sw.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0 
 * Register service worker.
 * ========================================================== */

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "huangxuan.me",
  "cdnjs.cloudflare.com",
  "ghbtns.com"
]
console.log(HOSTNAME_WHITELIST)

// ServiceWorkerGlobalScope
// console.log(self) 	

/**
 *  @Lifecycle Install
 *  Precache anything static to this version of your app.
 *  e.g. App Shell, 404, JS/CSS dependencies...
 *
 *  waitUntil() : installing ====> installed
 *  skipWaiting() : waiting(installed) ====> activating
 */
self.addEventListener('install', e => {
  // nothing need to be precached, skip precatch step.
  self.skipWaiting()

  // e.waitUntil(
  //   caches.open(PRECACHE).then(cache => {
  //     return cache.addAll([])
  //     .then(self.skipWaiting())
  //     .catch(err => console.log(err))
  //   })
  // )
});


/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate',  event => {
  console.log('service worker activated.')
  event.waitUntil(self.clients.claim());
});


/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 * 
 *  void respondWith(Promise<Response> r);
 */
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    // Stale-while-revalidate 
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    event.respondWith(
      caches.open(RUNTIME).then(cache => {
        return caches.match(event.request).then(cachedResponse => {
          var fetchPromise = fetch(`${event.request.url}?${Math.random()}`,  {cache: "no-store"})
            .then(networkResponse => {
              var resUrl = networkResponse.url
              cache.put(event.request, networkResponse.clone())
              return networkResponse;
            })
            .catch(error => console.log(error))
        
          // Return the response from cache or wait for network.
          return cachedResponse || fetchPromise;
        })
      })
    );
  }
});