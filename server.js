// Fuori Tema - sito web multi-stanza (nessuna dipendenza, Node 18+)
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=+process.env.PORT||3000,GKEY=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY,AKEY=process.env.ANTHROPIC_API_KEY,KEY=GKEY||AKEY,MODEL=process.env.MODEL||'claude-sonnet-5-5',GMODEL=process.env.GEMINI_MODEL||'gemini-3.6-flash';
const FB={
impostor:[["Qual è il tuo cibo preferito?","Qual è il cibo che odi di più?"],["Qual è il posto dove vorresti vivere?","Qual è il posto dove non vivresti mai?"],["Quale app usi di più sul telefono?","Quale app cancelleresti subito?"],["Qual è un film che hai visto più volte?","Qual è un film che ti ha annoiato?"],["Che lavoro vorresti fare da grande?","Che lavoro faresti solo per i soldi?"],["Quale superpotere vorresti?","Quale superpotere sarebbe inutile?"],["Dove andresti in vacanza adesso?","Dove non andresti nemmeno gratis?"],["Cosa ordini sempre in pizzeria?","Cosa non metteresti mai sulla pizza?"]],
best:["Inventa la scusa peggiore per arrivare in ritardo","Dai un nome a un gusto di gelato disgustoso","Inventa il titolo di un film che farebbe flop","Qual è la cosa più strana da dire al primo appuntamento?","Inventa uno slogan per una pizzeria aperta di notte"],
likely:["Chi è il più probabile a perdersi con Google Maps in mano?","Chi è il più probabile a diventare famoso?","Chi è il più probabile a dormire fino alle 3 del pomeriggio?","Chi è il più probabile a litigare con un arbitro?","Chi è il più probabile a dimenticare il compleanno di un amico?"]};
const MODES=['impostor','best','likely'],pick=a=>a[Math.floor(Math.random()*a.length)];
const rooms=new Map();
function mkRoom(){
  const L='ABCDEFGHJKLMNPQRSTUVWXYZ';let c;do{c=Array.from({length:4},()=>pick(L)).join('');}while(rooms.has(c));
  const R={code:c,token:crypto.randomUUID(),phase:'lobby',mode:'impostor',round:0,theme:'',players:{},part:[],q:'',qi:'',imp:null,answers:{},votes:{},order:[],result:null,used:[],clients:new Map(),seen:Date.now()};
  rooms.set(c,R);return R;
}
setInterval(()=>{for(const[c,R]of rooms)if(Date.now()-R.seen>6*3600e3)rooms.delete(c);},600e3);
const P=R=>Object.values(R.players);

async function ask(prompt){
  if(GKEY){
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+GMODEL+':generateContent',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'content-type':'application/json','x-goog-api-key':GKEY},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})});
    const d=await r.json();if(!d.candidates)throw new Error(d.error&&d.error.message||'risposta vuota da Gemini');
    return d.candidates[0].content.parts.map(p=>p.text||'').join('');
  }
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'content-type':'application/json','x-api-key':AKEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:MODEL,max_tokens:300,messages:[{role:'user',content:prompt}]})});
  return (await r.json()).content[0].text;
}
async function gen(R,mode,desc,useAi){
  if(KEY && useAi !== false){try{
    const prompt='Sei il conduttore di un party game tra amici di 18 anni, in italiano, tono leggero e divertente. '+(desc?'Richiesta del conduttore: "'+desc+'". ':'')+
      (mode==='auto'?'Scegli tu il tipo di gioco più adatto alla richiesta tra impostor, best, likely. ':'Tipo di gioco: '+mode+'. ')+
      'Tipi: "impostor" = tutti ricevono la stessa domanda tranne uno, che ne riceve una diversa ma simile (risposte brevi di 1-3 parole plausibili per entrambe); "best" = tutti ricevono la stessa sfida creativa, rispondono e poi votano la risposta migliore; "likely" = una domanda tipo "Chi è il più probabile a...?" a cui si risponde votando un giocatore. Non ripetere: '+R.used.slice(-10).join(' | ')+'. Rispondi SOLO con JSON: {"mode":"impostor|best|likely","normal":"...","impostor":"... (solo per impostor, altrimenti vuoto)"}';
    const j=JSON.parse((await ask(prompt)).match(/\{[\s\S]*\}/)[0]);
    const m=mode==='auto'?(MODES.includes(j.mode)?j.mode:'impostor'):mode;
    if(j.normal&&(m!=='impostor'||j.impostor)){R.used.push(j.normal);return{mode:m,q:j.normal,qi:m==='impostor'?j.impostor:''};}
  }catch(e){console.log('IA non disponibile, uso domande preimpostate:',e.message);}}
  const m=mode==='auto'?pick(MODES):mode,key=x=>m==='impostor'?x[0]:x,pool=FB[m].filter(x=>!R.used.includes(key(x)));
  const x=pick(pool.length?pool:FB[m]);R.used.push(key(x));
  return m==='impostor'?{mode:m,q:x[0],qi:x[1]}:{mode:m,q:x,qi:''};
}
function view(R,id){
  const v={code:R.code,phase:R.phase,mode:R.mode,round:R.round,ai:!!KEY&&(R.useAi!==false),theme:R.theme||'',
    players:P(R).map(p=>({id:p.id,name:p.name,score:p.score,online:p.online,ph:p.pv,in:R.part.includes(p.id),answered:p.id in R.answers,voted:p.id in R.votes}))};
  if(id!=='host'){const me=R.players[id];v.me=me?{id:me.id,name:me.name,score:me.score,in:R.part.includes(id)}:null;
    if(R.phase==='answering'&&me&&v.me.in){v.question=R.imp===id?R.qi:R.q;v.answered=id in R.answers;}
    v.voted=id in R.votes;}
  if(R.mode!=='impostor'&&['answering','discussion','voting','reveal'].includes(R.phase))v.q=R.q;
  if(['discussion','voting','reveal'].includes(R.phase))v.answers=R.order.filter(i=>R.players[i]).map(i=>({id:i,name:R.players[i].name,text:R.answers[i]}));
  if(R.phase==='reveal')v.result=R.result;
  return v;
}
const push=(R,id,res)=>res.write('data: '+JSON.stringify(view(R,id))+'\n\n');
const broadcast=R=>R.clients.forEach((res,id)=>push(R,id,res));
async function start(R,theme,mode,useAi){
  const part=P(R).filter(p=>p.online).map(p=>p.id);
  if(part.length<3||R.phase==='loading')return;
  if(typeof theme==='string')R.theme=theme.slice(0,500);
  if(typeof useAi==='boolean')R.useAi=useAi;
  R.phase='loading';R.round++;R.part=part;broadcast(R);
  const r=await gen(R,MODES.includes(mode)||mode==='auto'?mode:'impostor',R.theme,R.useAi);
  Object.assign(R,{mode:r.mode,q:r.q,qi:r.qi,imp:r.mode==='impostor'?pick(part):null,answers:{},votes:{},order:[],result:null,phase:r.mode==='likely'?'voting':'answering'});broadcast(R);
}
const discuss=R=>{R.order=R.part.filter(i=>i in R.answers).sort(()=>Math.random()-.5);R.phase='discussion';};
function reveal(R){
  const t={};Object.values(R.votes).forEach(x=>t[x]=(t[x]||0)+1);
  const tally=Object.entries(t).map(([i,n])=>({name:R.players[i]?R.players[i].name:'?',n})).sort((a,b)=>b.n-a.n);
  const X={mode:R.mode,q:R.q,qi:R.qi,tally,gain:{},winner:tally.filter(x=>x.n===tally[0].n).map(x=>x.name).join(' e ')};
  if(R.mode==='impostor'){
    const top=Object.keys(t).filter(k=>t[k]===(tally[0]?tally[0].n:0));
    X.caught=top.length===1&&top[0]===R.imp;X.impId=R.imp;X.impostor=R.players[R.imp].name;
    for(const[v,x]of Object.entries(R.votes))if(x===R.imp)X.gain[v]=1;
    if(!X.caught)X.gain[R.imp]=(X.gain[R.imp]||0)+2;
  }else if(R.mode==='best')for(const i in t)X.gain[i]=t[i];
  for(const i in X.gain)if(R.players[i])R.players[i].score+=X.gain[i];
  R.result=X;R.phase='reveal';
}
function setPhoto(p,d){const m=/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(d||'');if(m&&m[1].length<90000){p.photo=Buffer.from(m[1],'base64');p.pv++;}}
async function act(b){
  const R=rooms.get(String(b.room||'').toUpperCase());
  if(!R)return{error:'Stanza non trovata. Controlla il codice.'};
  R.seen=Date.now();
  const id=String(b.id||'').slice(0,24),t=b.type,host=id==='host'&&b.token===R.token;
  if(t==='join'){
    if(!id||id==='host')return{error:'Errore, riprova.'};
    let p=R.players[id];
    if(!p){let name=String(b.name||'').trim().slice(0,14)||'Giocatore',n=name,i=2;
      while(P(R).some(x=>x.name.toLowerCase()===n.toLowerCase()))n=name+i++;
      p=R.players[id]={id,name:n,score:0,online:false,photo:null,pv:0};}
    if(b.photo)setPhoto(p,b.photo);p.online=R.clients.has(id);
    broadcast(R);return{ok:true,name:p.name};
  }
  if(host){
    if(t==='start'||t==='next'){start(R,b.theme,b.mode,b.ai);return{};}
    if(t==='discuss'&&R.phase==='answering')discuss(R);
    if(t==='tovote'&&R.phase==='discussion')R.phase='voting';
    if(t==='reveal'&&R.phase==='voting')reveal(R);
    if(t==='lobby'&&R.phase!=='loading'){R.phase='lobby';R.part=[];}
  }else if(R.players[id]&&R.part.includes(id)){
    if(t==='answer'&&R.phase==='answering'){R.answers[id]=String(b.text||'').trim().slice(0,80)||'…';if(R.part.every(i=>i in R.answers))discuss(R);}
    if(t==='vote'&&R.phase==='voting'&&b.target!==id&&R.part.includes(b.target)){R.votes[id]=b.target;if(R.part.every(i=>i in R.votes))reveal(R);}
  }
  broadcast(R);return{};
}
const PAGES={'/':'index.html','/host':'host.html','/style.css':'style.css','/app.js':'app.js','/qr.js':'qr.js'};
const TYPE={html:'text/html',css:'text/css',js:'text/javascript'};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x'),q=u.searchParams;
  if(u.pathname==='/events'){
    const R=rooms.get((q.get('room')||'').toUpperCase()),id=q.get('id')||'';
    if(!R||(id==='host'&&q.get('token')!==R.token)){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive','X-Accel-Buffering':'no'});
    R.clients.set(id,res);if(R.players[id])R.players[id].online=true;
    push(R,id,res);broadcast(R);
    const hb=setInterval(()=>{R.seen=Date.now();res.write(': ♥\n\n');},15000);
    req.on('close',()=>{clearInterval(hb);if(R.clients.get(id)===res){R.clients.delete(id);if(R.players[id])R.players[id].online=false;broadcast(R);}});
  }else if(u.pathname==='/api/create'&&req.method==='POST'){
    const R=mkRoom();res.setHeader('Content-Type','application/json');res.end(JSON.stringify({room:R.code,token:R.token}));
  }else if(u.pathname==='/api'&&req.method==='POST'){
    let s='';req.on('data',c=>{s+=c;if(s.length>200000)req.destroy();});
    req.on('end',async()=>{let out={};try{out=await act(JSON.parse(s));}catch(e){console.log(e);out={error:'Errore'};}
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify(out));});
  }else if(u.pathname.startsWith('/p/')){
    const[,,c,id]=u.pathname.split('/'),R=rooms.get((c||'').toUpperCase()),p=R&&R.players[id];
    if(!p||!p.photo){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'public,max-age=86400'});res.end(p.photo);
  }else if(PAGES[u.pathname]){
    const f=PAGES[u.pathname];res.writeHead(200,{'Content-Type':TYPE[f.split('.')[1]]+'; charset=utf-8'});
    res.end(fs.readFileSync(path.join(__dirname,'public',f)));
  }else{res.writeHead(404);res.end('Pagina non trovata');}
}).listen(PORT,()=>{
  console.log('\n🎭 Fuori Tema pronto su http://localhost:'+PORT);
  console.log(GKEY?'IA Gemini attiva ('+GMODEL+')':AKEY?'IA Claude attiva ('+MODEL+')':'Nessuna chiave API: uso domande preimpostate');
});
