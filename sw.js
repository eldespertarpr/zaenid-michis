const VERSION='zaenid-michis-v3';
const STATIC=[
  './','./index.html','./manifest.json','./icon-192.png','./icon-512.png'
];
const EXTERNAL=[
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(VERSION);
    await cache.addAll(STATIC);
    await Promise.allSettled(EXTERNAL.map(async url=>{
      try{
        const response=await fetch(url,{mode:'no-cors',cache:'reload'});
        await cache.put(url,response);
      }catch{}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    event.respondWith((async()=>{
      const cache=await caches.open(VERSION);
      try{
        const fresh=await fetch(req);
        if(fresh&&fresh.ok)cache.put(req,fresh.clone());
        return fresh;
      }catch{
        return (await cache.match(req)) || (req.mode==='navigate' ? await cache.match('./index.html') : Response.error());
      }
    })());
    return;
  }
  if(url.hostname==='www.gstatic.com'){
    event.respondWith((async()=>{
      const cached=await caches.match(req);
      if(cached)return cached;
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(VERSION);
        cache.put(req,fresh.clone());
        return fresh;
      }catch{return Response.error()}
    })());
  }
});
