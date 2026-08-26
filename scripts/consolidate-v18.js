const fs=require('fs');
const vm=require('vm');

const indexPath='index.html';
const swPath='sw.js';
const manifestPath='manifest.json';
let html=fs.readFileSync(indexPath,'utf8');
const oldSw=fs.readFileSync(swPath,'utf8');

// Reuse the already-tested runtime patches one final time, but bake them into index.html.
const marker='function patchedHtml';
const head=oldSw.slice(0,oldSw.indexOf(marker));
const box={};
vm.createContext(box);
vm.runInContext(head+'\nthis.__REPLACEMENTS=REPLACEMENTS;',box);
for(const [from,to] of box.__REPLACEMENTS){if(html.includes(from))html=html.replace(from,to)}

// Restore the previously stable iPhone task-X pointerdown behavior.
html=html.replace(/function bindClicks\(\)\{app\.onclick=handleClick;.*?const cs=document\.getElementById\('catSearch'\);/s,
"function bindClicks(){app.onclick=handleClick;app.querySelectorAll('[data-task-del]').forEach(btn=>{btn.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const key=btn.dataset.taskDel;if(!key||btn.dataset.busy==='1')return;btn.dataset.busy='1';btn.disabled=true;deleteTask(key)};btn.onclick=e=>{e.preventDefault();e.stopPropagation()}});const cs=document.getElementById('catSearch');");
html=html.replace('touch-action:manipulation;-webkit-user-select:none;user-select:none}.task-x:active','touch-action:none;-webkit-user-select:none;user-select:none}.task-x:active');

// Make the report safe on iOS: auto-close when supported, but ALWAYS provide a visible way back.
const p0=html.indexOf('function printReport(){');
const p1=html.indexOf('\nasync function login()',p0);
if(p0<0||p1<0)throw new Error('printReport not found');
const printFn=String.raw`function printReport(){const rows=CATS.map(c=>{const r=state.daily[c.id]||{};return \`<tr><td>\${c.n}</td><td>\${esc(c.name)}\${r.urgent?' ⚠️':''}</td><td>\${r.am?'✓':''}</td><td>\${r.pm?'✓':''}</td><td>\${r.ate?'✓':''}</td><td>\${r.water?'✓':''}</td><td>\${r.litter?'✓':''}</td><td>\${r.med?'✓':''}</td><td>\${esc(r.careNotes||'')}</td><td>\${esc(r.medNotes||'')}</td></tr>\`}).join('');const w=window.open('','_blank');if(!w)return;w.document.write(\`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zaenid Michis Report</title><style>body{font-family:Arial;padding:20px}.back{position:sticky;top:8px;z-index:5;display:inline-block;border:0;border-radius:10px;background:#0f172a;color:white;padding:10px 14px;font-weight:700;text-decoration:none;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border-bottom:1px solid #ddd;padding:5px;text-align:left}th{background:#0f172a;color:white}@media print{.back{display:none}}</style></head><body><a class="back" href="./" onclick="if(window.opener&&!window.opener.closed){window.opener.focus();window.close();return false}">← Back to Zaenid Michis</a><h2>Zaenid Michis — Care Report</h2><p>\${fmtD(state.date)}</p><table><thead><tr><th>#</th><th>Name</th><th>AM</th><th>PM</th><th>Food</th><th>Water</th><th>Litter</th><th>Med</th><th>Care Notes</th><th>Medical Notes</th></tr></thead><tbody>\${rows}</tbody></table>\${state.dailyNotes?\`<p><b>General notes:</b> \${esc(state.dailyNotes)}</p>\`:''}<script>window.onload=()=>setTimeout(()=>window.print(),100);window.onafterprint=()=>setTimeout(()=>{try{if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}}catch(e){}},150)<\\/script></body></html>\`);w.document.close()}`;
html=html.slice(0,p0)+printFn+html.slice(p1);

// Ask the browser to check sw.js itself rather than a cached copy; never force-navigate open windows.
html=html.replace("navigator.serviceWorker.register('./sw.js').catch(()=>{})","navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})");

// Sanity checks before writing.
for(const required of ['pendingCareAlert','💊 Meds','task-x','onpointerdown','deletingTasks','compressPhoto','Back to Zaenid Michis','clearModals']){
  if(!html.includes(required))throw new Error('Missing consolidated feature: '+required)
}
fs.writeFileSync(indexPath,html);

// From v18 onward the service worker ONLY caches/offlines; it no longer rewrites application code.
const simpleSw=`const VERSION='zaenid-michis-v18';
const STATIC=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const EXTERNAL=['https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js','https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(VERSION);await Promise.allSettled(STATIC.map(x=>cache.add(x)));await Promise.allSettled(EXTERNAL.map(async url=>{try{const r=await fetch(url,{mode:'no-cors',cache:'reload'});await cache.put(url,r)}catch{}}));await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin===location.origin){event.respondWith((async()=>{const cache=await caches.open(VERSION);const isHtml=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');if(isHtml){try{const fresh=await fetch(req,{cache:'no-store'});if(fresh&&fresh.ok)await cache.put(req,fresh.clone());return fresh}catch{return(await cache.match(req))||(await cache.match('./index.html'))||(await cache.match('./'))||Response.error()}}const cached=await cache.match(req);if(cached)return cached;try{const fresh=await fetch(req);if(fresh&&fresh.ok)await cache.put(req,fresh.clone());return fresh}catch{return Response.error()}})());return}if(url.hostname==='www.gstatic.com'){event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const fresh=await fetch(req);const cache=await caches.open(VERSION);await cache.put(req,fresh.clone());return fresh}catch{return Response.error()}})())}});`;
fs.writeFileSync(swPath,simpleSw);

const manifest={id:'./',name:'Zaenid Michis',short_name:'Michis',description:'Cat care and volunteer task manager with offline support.',start_url:'./',scope:'./',display:'standalone',display_override:['standalone','minimal-ui'],orientation:'portrait-primary',background_color:'#0f172a',theme_color:'#0f172a',categories:['productivity','utilities'],icons:[{src:'./icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'./icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');

console.log('v18 consolidated successfully');
