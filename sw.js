const V="yiri-v137",LIB="yiri-lib";
const FILES=["./","index.html","manifest.webmanifest","ic192.png","ic512.png"];
const WAIT=2500; // si le réseau tarde plus de 2,5 s, on ouvre tout de suite la copie enregistrée
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));
 // modèle de détourage (4,5 Mo) : téléchargé une seule fois en arrière-plan, conservé entre les versions
 e.waitUntil(caches.open(LIB).then(c=>c.match("u2netp_256.bin").then(m=>m||c.add("u2netp_256.bin"))).catch(()=>{}));});
// le cache « yiri-lib » (bibliothèque d'images, modèle de détourage) n'est jamais effacé par une mise à jour
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==LIB).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
function fromCache(req){return caches.open(V).then(c=>c.match(req,{ignoreSearch:true}).then(m=>m||c.match("index.html").then(i=>i||c.match("./"))));}
function isLib(u){const p=new URL(u).pathname;return /\/(assets)\//.test(p)||/u2netp_256\.bin$/.test(p);}
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(new URL(e.request.url).origin!==self.location.origin)return;
 // images de la bibliothèque et modèle IA : copie enregistrée d'abord (gros fichiers, ils ne changent presque jamais)
 if(isLib(e.request.url)){
  e.respondWith(caches.open(LIB).then(c=>c.match(e.request.url).then(m=>m||fetch(e.request).then(r=>{if(r&&r.ok&&r.status===200){c.put(e.request.url,r.clone());}return r;}))));
  return;}
 const net=fetch(e.request).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(V).then(c=>c.put(e.request,k));}return r;});
 e.respondWith(new Promise(res=>{
  let done=false;
  const t=setTimeout(()=>{fromCache(e.request).then(m=>{if(m&&!done){done=true;res(m);}});},WAIT);
  net.then(r=>{if(!done){done=true;clearTimeout(t);res(r);}}).catch(()=>{clearTimeout(t);if(!done){fromCache(e.request).then(m=>{if(!done){done=true;res(m||Response.error());}});}});
 }));
 e.waitUntil(net.catch(()=>{}));});
