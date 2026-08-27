importScripts('./sw-v23.js');

// Cold offline start fallback: Firebase Auth can wait indefinitely on iOS when
// there is no network. Do not depend on onAuthStateChanged() to start the app.
// If a previously authorized offline session exists, open from local cache.
REPLACEMENTS.push([
  "AUTH.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});",
  "function bootSavedOffline(){if(navigator.onLine||state.authState!=='loading')return false;const saved=readOfflineSession();if(!saved||!saved.uid||!saved.person)return false;state.authState='in';state.online=false;state.user={uid:saved.uid,email:saved.email||'',offline:true};state.people=mergePeople(readCache('sag_people'));state.person={...saved.person,uid:saved.uid,email:saved.person.email||saved.email||''};state.catPhotos=readCache('sag_cat_photos')||{};state.tasks=normalizeTasks(readCache('sag_tasks'));state.daily=readCache(`sag_daily/${state.date}`)||{};const dn=readCache(`sag_daily_notes/${state.date}`);state.dailyNotes=dn?.notes||'';bindCore();bindDaily();render();return true}AUTH.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});if(!navigator.onLine)setTimeout(()=>bootSavedOffline(),900);"
]);

// Keep the page on v24 once it is controlling the scope.
REPLACEMENTS.push([
  "navigator.serviceWorker.register('./sw-v23.js')",
  "navigator.serviceWorker.register('./sw-v24.js')"
]);
