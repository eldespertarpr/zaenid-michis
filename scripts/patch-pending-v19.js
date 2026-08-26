const fs=require('fs');
const p='sw.js';
let s=fs.readFileSync(p,'utf8');
const changes=[
  ["const VERSION='zaenid-michis-v16';","const VERSION='zaenid-michis-v19';"],
  ["const needsPm=new Date().getHours()>=12;","const needsPm=new Date().getHours()>=15;"],
  ["const needsPm=state.date!==localDate()||new Date().getHours()>=12;","const needsPm=state.date!==localDate()||new Date().getHours()>=15;"]
];
for(const [from,to] of changes){
  const count=s.split(from).length-1;
  if(count!==1) throw new Error(`Expected exactly one match for ${from}, found ${count}`);
  s=s.replace(from,to);
}
fs.writeFileSync(p,s);
console.log('Patched sw.js pending threshold to 3 PM and cache version to v19');
