const V="yiri-v71";
const FILES=["./","index.html","manifest.webmanifest","ic192.png","ic512.png"];
const WAIT=2500; // si le réseau tarde plus de 2,5 s, on ouvre tout de suite la copie enregistrée
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
function fromCache(req){return caches.open(V).then(c=>c.match(req,{ignoreSearch:true}).then(m=>m||c.match("index.html").then(i=>i||c.match("./"))));}
// Réseau d'abord (mise à jour dès qu'il y a internet), mais sans attendre indéfiniment : copie hors connexion si le réseau est lent ou absent
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(new URL(e.request.url).origin!==self.location.origin)return;
 const net=fetch(e.request).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(V).then(c=>c.put(e.request,k));}return r;});
 e.respondWith(new Promise(res=>{
  let done=false;
  const t=setTimeout(()=>{fromCache(e.request).then(m=>{if(m&&!done){done=true;res(m);}});},WAIT);
  net.then(r=>{if(!done){done=true;clearTimeout(t);res(r);}}).catch(()=>{clearTimeout(t);if(!done){fromCache(e.request).then(m=>{if(!done){done=true;res(m||Response.error());}});}});
 }));
 e.waitUntil(net.catch(()=>{}));});
