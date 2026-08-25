const VERSION='zaenid-michis-v4';
const STATIC=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const EXTERNAL=[
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'
];
const OLD_WRITE="async function durableWrite(op,path,value){localApply(path,op==='remove'?undefined:value,op==='patch');if(!navigator.onLine){queue(op,path,value);return}try{await Promise.race([netWrite(op,path,value),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),5000))])}catch{queue(op,path,value)}}";
const NEW_WRITE="function durableWrite(op,path,value){localApply(path,op==='remove'?undefined:value,op==='patch');if(!navigator.onLine){queue(op,path,value);return Promise.resolve()}Promise.race([netWrite(op,path,value),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),5000))]).catch(()=>queue(op,path,value));return Promise.resolve()}";
function patchedHtml(text){return text.includes(OLD_WRITE)?text.replace(OLD_WRITE,NEW_WRITE):text}
async function cachePatchedIndex(cache){
  try{
    const r=await fetch('./index.html',{cache:'reload'});
    const text=patchedHtml(await r.text());
    await cache.put('./index.html',new Response(text,{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}}));
    await cache.put('./',new Response(text,{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}}));
  }catch{}
}
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(VERSION);
    await Promise.allSettled(STATIC.filter(x=>x!=='./'&&x!=='./index.html').map(x=>cache.add(x)));
    await cachePatchedIndex(cache);
    await Promise.allSettled(EXTERNAL.map(async url=>{
      try{const response=await fetch(url,{mode:'no-cors',cache:'reload'});await cache.put(url,response)}catch{}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
    const wins=await self.clients.matchAll({type:'window'});
    await Promise.allSettled(wins.map(c=>c.navigate(c.url)));
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    event.respondWith((async()=>{
      const cache=await caches.open(VERSION);
      const isHtml=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
      try{
        const fresh=await fetch(req);
        if(isHtml){
          const text=patchedHtml(await fresh.text());
          const out=new Response(text,{status:fresh.status,statusText:fresh.statusText,headers:fresh.headers});
          await cache.put(req,out.clone());return out;
        }
        if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
        return fresh;
      }catch{
        const cached=(await cache.match(req))||(isHtml?await cache.match('./index.html'):null);
        if(!cached)return Response.error();
        if(!isHtml)return cached;
        const text=patchedHtml(await cached.text());
        return new Response(text,{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());return;
  }
  if(url.hostname==='www.gstatic.com'){
    event.respondWith((async()=>{
      const cached=await caches.match(req);if(cached)return cached;
      try{const fresh=await fetch(req);const cache=await caches.open(VERSION);await cache.put(req,fresh.clone());return fresh}catch{return Response.error()}
    })());
  }
});
