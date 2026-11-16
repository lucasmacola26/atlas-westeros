// Atlas de Westeros v6 — atualização confiável, preservando progresso e retratos offline.
const CACHE = 'atlas-westeros-v6-chapter-cast';
const ASSETS = ["./","./index.html","./style.css","./app.js","./data.js","./catalog.js","./chapters.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./retratos/mini/aemon-targaryen.webp","./retratos/mini/arya-stark.webp","./retratos/mini/asha-greyjoy.webp","./retratos/mini/balon-greyjoy.webp","./retratos/mini/barristan-selmy.webp","./retratos/mini/benjen-stark.webp","./retratos/mini/bran-stark.webp","./retratos/mini/brienne-de-tarth.webp","./retratos/mini/bronn.webp","./retratos/mini/brynden-tully.webp","./retratos/mini/catelyn-stark.webp","./retratos/mini/cersei-lannister.webp","./retratos/mini/craster.webp","./retratos/mini/daenerys-targaryen.webp","./retratos/mini/davos-seaworth.webp","./retratos/mini/drogo.webp","./retratos/mini/edmure-tully.webp","./retratos/mini/gendry.webp","./retratos/mini/jeor-mormont.webp","./retratos/mini/gilly.webp","./retratos/mini/gregor-clegane.webp","./retratos/mini/hodor.webp","./retratos/mini/jaime-lannister.webp","./retratos/mini/jaqen-h-ghar.webp","./retratos/mini/joffrey-baratheon.webp","./retratos/mini/jojen-reed.webp","./retratos/mini/jon-snow.webp","./retratos/mini/jorah-mormont.webp","./retratos/mini/loras-tyrell.webp","./retratos/mini/luwin.webp","./retratos/mini/lysa-arryn.webp","./retratos/mini/margaery-tyrell.webp","./retratos/mini/meera-reed.webp","./retratos/mini/melisandre.webp","./retratos/mini/mirri-maz-duur.webp","./retratos/mini/myrcella-baratheon.webp","./retratos/mini/eddard-stark.webp","./retratos/mini/osha.webp","./retratos/mini/petyr-baelish.webp","./retratos/mini/podrick-payne.webp","./retratos/mini/pyat-pree.webp","./retratos/mini/pycelle.webp","./retratos/mini/qhorin.webp","./retratos/mini/quaithe.webp","./retratos/mini/ramsay-snow.webp","./retratos/mini/renly-baratheon.webp","./retratos/mini/rickon-stark.webp","./retratos/mini/robb-stark.webp","./retratos/mini/robert-baratheon.webp","./retratos/mini/rodrik-cassel.webp","./retratos/mini/roose-bolton.webp","./retratos/mini/samwell-tarly.webp","./retratos/mini/sandor-clegane.webp","./retratos/mini/sansa-stark.webp","./retratos/mini/shae.webp","./retratos/mini/stannis-baratheon.webp","./retratos/mini/syrio-forel.webp","./retratos/mini/theon-greyjoy.webp","./retratos/mini/tommen-baratheon.webp","./retratos/mini/tyrion-lannister.webp","./retratos/mini/tywin-lannister.webp","./retratos/mini/varys.webp","./retratos/mini/viserys-targaryen.webp","./retratos/mini/walder-frey.webp","./retratos/mini/xaro-xhoan-daxos.webp","./retratos/mini/ygritte.webp","./retratos/mini/yoren.webp","./retratos/grandes/aemon-targaryen.webp","./retratos/grandes/arya-stark.webp","./retratos/grandes/asha-greyjoy.webp","./retratos/grandes/balon-greyjoy.webp","./retratos/grandes/barristan-selmy.webp","./retratos/grandes/benjen-stark.webp","./retratos/grandes/bran-stark.webp","./retratos/grandes/brienne-de-tarth.webp","./retratos/grandes/bronn.webp","./retratos/grandes/brynden-tully.webp","./retratos/grandes/catelyn-stark.webp","./retratos/grandes/cersei-lannister.webp","./retratos/grandes/craster.webp","./retratos/grandes/daenerys-targaryen.webp","./retratos/grandes/davos-seaworth.webp","./retratos/grandes/drogo.webp","./retratos/grandes/edmure-tully.webp","./retratos/grandes/gendry.webp","./retratos/grandes/jeor-mormont.webp","./retratos/grandes/gilly.webp","./retratos/grandes/gregor-clegane.webp","./retratos/grandes/hodor.webp","./retratos/grandes/jaime-lannister.webp","./retratos/grandes/jaqen-h-ghar.webp","./retratos/grandes/joffrey-baratheon.webp","./retratos/grandes/jojen-reed.webp","./retratos/grandes/jon-snow.webp","./retratos/grandes/jorah-mormont.webp","./retratos/grandes/loras-tyrell.webp","./retratos/grandes/luwin.webp","./retratos/grandes/lysa-arryn.webp","./retratos/grandes/margaery-tyrell.webp","./retratos/grandes/meera-reed.webp","./retratos/grandes/melisandre.webp","./retratos/grandes/mirri-maz-duur.webp","./retratos/grandes/myrcella-baratheon.webp","./retratos/grandes/eddard-stark.webp","./retratos/grandes/osha.webp","./retratos/grandes/petyr-baelish.webp","./retratos/grandes/podrick-payne.webp","./retratos/grandes/pyat-pree.webp","./retratos/grandes/pycelle.webp","./retratos/grandes/qhorin.webp","./retratos/grandes/quaithe.webp","./retratos/grandes/ramsay-snow.webp","./retratos/grandes/renly-baratheon.webp","./retratos/grandes/rickon-stark.webp","./retratos/grandes/robb-stark.webp","./retratos/grandes/robert-baratheon.webp","./retratos/grandes/rodrik-cassel.webp","./retratos/grandes/roose-bolton.webp","./retratos/grandes/samwell-tarly.webp","./retratos/grandes/sandor-clegane.webp","./retratos/grandes/sansa-stark.webp","./retratos/grandes/shae.webp","./retratos/grandes/stannis-baratheon.webp","./retratos/grandes/syrio-forel.webp","./retratos/grandes/theon-greyjoy.webp","./retratos/grandes/tommen-baratheon.webp","./retratos/grandes/tyrion-lannister.webp","./retratos/grandes/tywin-lannister.webp","./retratos/grandes/varys.webp","./retratos/grandes/viserys-targaryen.webp","./retratos/grandes/walder-frey.webp","./retratos/grandes/xaro-xhoan-daxos.webp","./retratos/grandes/ygritte.webp","./retratos/grandes/yoren.webp"];
const CORE=new Set(['','index.html','style.css','app.js','data.js','catalog.js','chapters.js','sw.js','manifest.webmanifest']);
self.addEventListener('install', event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(let i=0;i<ASSETS.length;i+=12){
   await cache.addAll(ASSETS.slice(i,i+12));
  }
  await self.skipWaiting();
 })());
});
self.addEventListener('activate', event=>{
 event.waitUntil((async()=>{
  const all=await caches.keys();
  await Promise.all(all.filter(name=>name.startsWith('atlas-westeros-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url), filename=url.pathname.split('/').pop()||'';
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(req.mode==='navigate'||CORE.has(filename)){
   try{const response=await fetch(req,{cache:'no-cache'});if(response.ok)cache.put(req,response.clone());return response;}
   catch(e){const fallback=await cache.match(req,{ignoreSearch:true})||await cache.match('./index.html');return fallback||new Response('Atlas indisponível offline',{status:503});}
  }
  const stored=await cache.match(req,{ignoreSearch:true});if(stored)return stored;
  try{const fresh=await fetch(req);if(fresh.ok)cache.put(req,fresh.clone());return fresh;}
  catch(e){return new Response('Imagem não disponível offline',{status:503});}
 })());
});
