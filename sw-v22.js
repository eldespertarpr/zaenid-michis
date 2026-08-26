importScripts('./sw.js');

// Keep the Daily Care search input alive while typing. The old handler called
// render() on every keystroke, replacing the focused input and closing the
// iPhone keyboard. Filter the already-rendered cat rows in place instead.
REPLACEMENTS.push([
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;render()});",
  "document.getElementById('search')?.addEventListener('input',e=>{state.search=e.target.value;const q=state.search.trim().toLowerCase();document.querySelectorAll('.catrow[data-cat]').forEach(row=>{const cat=CATS.find(c=>c.id===row.dataset.cat);const show=!q||(cat&&cat.name.toLowerCase().includes(q))||(cat&&String(cat.n).includes(q));row.style.display=show?'':'none'})});"
]);

// Once v22 is controlling the app, keep both Safari and the installed PWA on
// the same worker instead of letting index.html register the older sw.js.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('./sw-v22.js')"
]);
