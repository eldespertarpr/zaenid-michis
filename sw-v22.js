importScripts('./sw.js');

// Keep the Daily Care search input alive while typing. sw.js first patches
// bindClicks(), so this replacement targets the final catSearch handler that
// would otherwise call render() on every keystroke and close the iPhone keyboard.
REPLACEMENTS.push([
  "cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.catrow[data-cat]').forEach(row=>{const cat=CATS.find(c=>c.id===row.dataset.cat);const show=!q||(cat&&cat.name.toLowerCase().includes(q))||(cat&&String(cat.n).includes(q));row.style.display=show?'':'none'})});"
]);

// Also cover the unpatched index handler in case the base worker changes.
REPLACEMENTS.push([
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.catrow[data-cat]').forEach(row=>{const cat=CATS.find(c=>c.id===row.dataset.cat);const show=!q||(cat&&cat.name.toLowerCase().includes(q))||(cat&&String(cat.n).includes(q));row.style.display=show?'':'none'})});"
]);

// Once v22 is controlling the app, keep both Safari and the installed PWA on
// the same worker instead of letting index.html register the older sw.js.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('./sw-v22.js')"
]);
