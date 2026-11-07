const V="yiri-v38";
const FILES=["./","index.html","manifest.webmanifest","ic192.png","ic512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
// Réseau d'abord (mise à jour dès la 1re ouverture quand il y a internet), sinon copie hors connexion
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(V).then(c=>c.put(e.request,k));}return r;})
  .catch(()=>caches.open(V).then(c=>c.match(e.request,{ignoreSearch:true}).then(m=>m||c.match("index.html")))));});
