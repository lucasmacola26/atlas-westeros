// Atlas de Westeros V7 — network-first app code, offline images preserved from previous versions.
const VERSION='v7-20261116';
const CACHE='atlas-westeros-'+VERSION;
const CORE=['./index.html?v='+VERSION,'./style.css?v='+VERSION,'./data.js?v='+VERSION,'./catalog.js?v='+VERSION,'./chapters.js?v='+VERSION,'./app.js?v='+VERSION,'./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const CORE_NAMES=new Set(['','index.html','style.css','data.js','catalog.js','chapters.js','app.js','sw.js','manifest.webmanifest','icon-192.png','icon-512.png']);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // A core file is essential: do not activate a half-published release.
 await cache.addAll(CORE.map(url=>new Request(url,{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const u=new URL(req.url), name=u.pathname.split('/').pop()||'';
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(req.mode==='navigate'||CORE_NAMES.has(name)){
   try{const fresh=await fetch(req,{cache:'no-cache'});if(fresh.ok){cache.put(req,fresh.clone());return fresh;}}catch(e){}
   const stored=(await cache.match(req))||(await cache.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?(await cache.match('./index.html?v='+VERSION)):null);
   return stored||new Response('Atlas indisponível. Verifique a conexão.',{status:503});
  }
  // Portraits may be in a cache from V3–V6: retain them instead of erasing the entire library.
  const stored=(await cache.match(req,{ignoreSearch:true}))||(await caches.match(req,{ignoreSearch:true}));
  if(stored)return stored;
  try{const fresh=await fetch(req);if(fresh.ok)cache.put(req,fresh.clone());return fresh;}
  catch(e){return new Response('Retrato indisponível offline',{status:503});}
 })());
});
