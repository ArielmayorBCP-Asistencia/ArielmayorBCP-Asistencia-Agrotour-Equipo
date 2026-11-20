/* Agrotour · Consulta de participantes — funciona sin conexión.
   Para forzar una actualización de la app: cambiá el número de VERSION. */
const VERSION='v13',CACHE='agrotour-consulta-'+VERSION;
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(SHELL);self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('agrotour-consulta-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  if(new URL(req.url).origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com$/.test(new URL(req.url).hostname))return;   /* nada de Supabase ni de otros sitios en la caché */
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(req,{ignoreSearch:true})||(req.mode==='navigate'?await c.match('index.html'):null);
    const red=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(red);return hit}
    return (await red)||new Response('Sin conexión',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })());
});
