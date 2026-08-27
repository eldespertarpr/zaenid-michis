importScripts('./sw.js');

// Daily Care search (#search): keep focus/keyboard open by filtering rows
// in place instead of calling render() on every keystroke.
REPLACEMENTS.push([
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.catrow[data-cat]').forEach(row=>{const cat=CATS.find(c=>c.id===row.dataset.cat);const show=!q||(cat&&cat.name.toLowerCase().includes(q))||(cat&&String(cat.n).includes(q));row.style.display=show?'':'none'})});"
]);

// Cats tab search (#catSearch): same no-rerender behavior.
REPLACEMENTS.push([
  "cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.photo-item').forEach(row=>{const name=row.querySelector('b')?.textContent?.toLowerCase()||'';row.style.display=!q||name.includes(q)?'':'none'})});"
]);
REPLACEMENTS.push([
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.photo-item').forEach(row=>{const name=row.querySelector('b')?.textContent?.toLowerCase()||'';row.style.display=!q||name.includes(q)?'':'none'})});"
]);

// Persist only the last successfully authorized user/profile for offline reopen.
// Passwords are never stored here. Explicit sign-out clears this record.
REPLACEMENTS.push([
  "const CACHE='zm_cache:',QUEUE='zm_queue_v2';",
  "const CACHE='zm_cache:',QUEUE='zm_queue_v2',OFFLINE_SESSION='zm_offline_session_v1';function readOfflineSession(){try{return JSON.parse(localStorage.getItem(OFFLINE_SESSION)||'null')}catch{return null}}function saveOfflineSession(v){try{localStorage.setItem(OFFLINE_SESSION,JSON.stringify(v))}catch{}}function clearOfflineSession(){try{localStorage.removeItem(OFFLINE_SESSION)}catch{}}"
]);

REPLACEMENTS.push([
  "if(a==='logout')AUTH.signOut();",
  "if(a==='logout'){clearOfflineSession();AUTH.signOut();state.authState='out';state.user=null;state.person=null;render();}"
]);

REPLACEMENTS.push([
  "AUTH.onAuthStateChanged(async user=>{cleanup(state.unsubs);cleanup(state.viewUnsubs);state.user=user;if(!user){state.authState='out';state.person=null;render();return}state.authState='in';const raw=await db.get('sag_people');state.people=mergePeople(raw);const p=state.people[user.uid];if(!p)state.person={notReg:true,email:user.email};else if(p.active===false)state.person={deact:true,email:user.email};else state.person={...p,uid:user.uid,email:p.email||user.email};bindCore();bindDaily();render();if(navigator.onLine)flushQueue()});",
  "AUTH.onAuthStateChanged(async user=>{cleanup(state.unsubs);cleanup(state.viewUnsubs);state.user=user;if(!user){if(!navigator.onLine){const saved=readOfflineSession();if(saved&&saved.uid&&saved.person){state.authState='in';state.user={uid:saved.uid,email:saved.email||'',offline:true};state.people=mergePeople(readCache('sag_people'));state.person={...saved.person,uid:saved.uid,email:saved.person.email||saved.email||''};state.catPhotos=readCache('sag_cat_photos')||{};state.tasks=normalizeTasks(readCache('sag_tasks'));state.daily=readCache(`sag_daily/${state.date}`)||{};const dn=readCache(`sag_daily_notes/${state.date}`);state.dailyNotes=dn?.notes||'';bindCore();bindDaily();render();return}}state.authState='out';state.person=null;render();return}state.authState='in';const raw=await db.get('sag_people');state.people=mergePeople(raw);const p=state.people[user.uid];if(!p)state.person={notReg:true,email:user.email};else if(p.active===false)state.person={deact:true,email:user.email};else state.person={...p,uid:user.uid,email:p.email||user.email};if(state.person&&!state.person.notReg&&!state.person.deact)saveOfflineSession({uid:user.uid,email:user.email||'',person:state.person,at:Date.now()});bindCore();bindDaily();render();if(navigator.onLine)flushQueue()});"
]);

// Keep the page on v23 once it is controlling the scope.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('./sw-v23.js')"
]);
