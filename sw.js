const CACHE='strong-v18';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./images/index.json','./videos/index.json'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET') return;
  if(u.origin===location.origin){
    // network first for index.html (updates), cache first for the rest
    if(u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
      e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    } else {
      e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return res; })));
    }
  } else if(/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return res; }).catch(()=>r)));
  }
});
