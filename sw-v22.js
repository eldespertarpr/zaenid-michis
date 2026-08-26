importScripts('./sw.js');

// Daily Care uses #search and binds it in bindDailyControls(). Do not call
// render() on every keystroke because that replaces the focused input and
// closes the iPhone keyboard. Filter the already-rendered cat rows in place.
REPLACEMENTS.push([
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.catrow[data-cat]').forEach(row=>{const cat=CATS.find(c=>c.id===row.dataset.cat);const show=!q||(cat&&cat.name.toLowerCase().includes(q))||(cat&&String(cat.n).includes(q));row.style.display=show?'':'none'})});"
]);

// Cats tab uses #catSearch and binds it in bindClicks(). Keep that input alive too.
REPLACEMENTS.push([
  "cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.photo-item').forEach(row=>{const name=row.querySelector('b')?.textContent?.toLowerCase()||'';row.style.display=!q||name.includes(q)?'':'none'})});"
]);

REPLACEMENTS.push([
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.photo-item').forEach(row=>{const name=row.querySelector('b')?.textContent?.toLowerCase()||'';row.style.display=!q||name.includes(q)?'':'none'})});"
]);

// Keep both Safari and the installed PWA on this worker instead of letting
// index.html register the older sw.js again.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('./sw-v22.js')"
]);
