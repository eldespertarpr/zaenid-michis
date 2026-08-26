importScripts('./sw.js');

// Restore the previously stable iPhone pointerdown behavior for task deletion.
REPLACEMENTS.push([
  "function bindClicks(){app.onclick=handleClick;const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;render()});const hd=document.getElementById('histDate');hd?.addEventListener('change',e=>{state.date=e.target.value;bindDaily();render()})}",
  "function bindClicks(){app.onclick=handleClick;app.querySelectorAll('[data-task-del]').forEach(btn=>{btn.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const key=btn.dataset.taskDel;if(!key||btn.dataset.busy==='1')return;btn.dataset.busy='1';btn.disabled=true;deleteTask(key)};btn.onclick=e=>{e.preventDefault();e.stopPropagation()}});const cs=document.getElementById('catSearch');cs?.addEventListener('input',e=>{state.search=e.target.value;render()});const hd=document.getElementById('histDate');hd?.addEventListener('change',e=>{state.date=e.target.value;bindDaily();render()})}"
]);
REPLACEMENTS.push([
  "touch-action:manipulation;-webkit-user-select:none;user-select:none}.task-x:active",
  "touch-action:none;-webkit-user-select:none;user-select:none}.task-x:active"
]);

// If iOS refuses to close the report after printing, always leave an obvious escape route.
REPLACEMENTS.push([
  "id=\"reportBack\" onclick=\"if(window.opener){window.opener.focus()}window.close()\" style=\"display:none;",
  "id=\"reportBack\" onclick=\"if(window.opener&&!window.opener.closed){window.opener.focus();window.close();return}else{location.href='./'}\" style=\"display:inline-block;"
]);
