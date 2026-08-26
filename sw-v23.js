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

// Keep the page on v23 once it is controlling the scope.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw.js')",
  "navigator.serviceWorker.register('./sw-v23.js')"
]);
