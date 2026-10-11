const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let ROOM = '';

const COL = ['#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#eab308'];
const col = id => COL[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % COL.length];

// Crest SVG for Zughi del KJB
const kjbCrestSvg = (size = 48) => `
<svg class="crest-icon" width="${size}" height="${size}" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 4L92 20V58C92 82 74 104 50 111C26 104 8 82 8 58V20L50 4Z" fill="#121927" stroke="#F59E0B" stroke-width="5" stroke-linejoin="round"/>
  <path d="M50 12L84 25V56C84 76 69 95 50 102C31 95 16 76 16 56V25L50 12Z" fill="#162032" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.4"/>
  <path d="M50 12V102" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3 3" stroke-opacity="0.5"/>
  <path d="M26 30L74 74" stroke="#F59E0B" stroke-width="1" stroke-opacity="0.25"/>
  <path d="M74 30L26 74" stroke="#F59E0B" stroke-width="1" stroke-opacity="0.25"/>
  <!-- Ball/Crown Motif -->
  <circle cx="50" cy="46" r="16" fill="#0B0F19" stroke="#F59E0B" stroke-width="3"/>
  <polygon points="50,33 54,42 63,42 56,48 58,57 50,52 42,57 44,48 37,42 46,42" fill="#F59E0B"/>
  <!-- Ribbon banner -->
  <path d="M20 78H80L75 90H25L20 78Z" fill="#F59E0B"/>
  <text x="50" y="87" fill="#090D16" font-family="'Bricolage Grotesque', sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="1">KJB</text>
  <text x="50" y="27" fill="#F8FAFC" font-family="'Bricolage Grotesque', sans-serif" font-weight="800" font-size="7" text-anchor="middle" letter-spacing="1">EST. 2026</text>
</svg>`;

// Complete Minigames Catalog (socialgamebox style)
const MINIGAMES = [
  {
    id: 'impostor',
    title: "L'Impostore",
    category: "Deduzione & Bluff",
    accent: '#f59e0b',
    icon: '🕵️',
    players: '3–12',
    duration: '5 min',
    isLive: true,
    desc: "Tutti ricevono la stessa domanda tranne uno. Chi è finito fuori tema prima che riesca a farla franca?",
    rulesHint: "Risposte brevi di 1–3 parole. Discutete a voce e votate l'infiltrato."
  },
  {
    id: 'best',
    title: 'Miglior Risposta',
    category: 'Creatività & Risate',
    accent: '#f43f5e',
    icon: '🏆',
    players: '3–16',
    duration: '5 min',
    isLive: true,
    desc: "Sfida aperta con risposte anonime alla battuta più assurda o geniale. Votate la migliore!",
    rulesHint: "L'IA inventa lo spunto o la situazione surreale. Votazione libera."
  },
  {
    id: 'likely',
    title: 'Chi è più probabile?',
    category: 'Social & Gossip',
    accent: '#3b82f6',
    icon: '👀',
    players: '3–20',
    duration: '4 min',
    isLive: true,
    desc: "Domande pungenti sul vostro gruppo. Chi è il più probabile a perdersi o fare una figuraccia?",
    rulesHint: "Votazione diretta tra i giocatori connessi alla partita."
  },
  {
    id: 'fantasy_team',
    title: 'Crea il tuo Team',
    category: 'Fantacalcio & Asta',
    accent: '#10b981',
    icon: '⚽',
    players: '3–16',
    duration: '10 min',
    isLive: false,
    badge: 'Speciale KJB',
    desc: "Asta lampo e squad builder: l'IA genera ruoli e vincoli folli. Votate l'undici più forte della lega!",
    rulesHint: "Personalizzabile via IA: rose Serie A, leggende o compagni di calcetto."
  },
  {
    id: 'truth_dare',
    title: 'Obbligo o Verità AI',
    category: 'Party Caos',
    accent: '#ec4899',
    icon: '🔥',
    players: '3–15',
    duration: '10 min',
    isLive: false,
    badge: 'In arrivo',
    desc: "Penitenze e confessioni graduate dall'IA senza filtri: prove fisiche, messaggi vocali e segreti.",
    rulesHint: "L'host imposta il livello di piccantezza o il tema del gruppo."
  },
  {
    id: 'trivia',
    title: 'Quiz a Squadre',
    category: 'Trivia & Derby',
    accent: '#8b5cf6',
    icon: '⚡',
    players: '4–20',
    duration: '12 min',
    isLive: false,
    badge: 'In arrivo',
    desc: "Derby a squadre su serie TV, calcio, meme e cultura pop, generati su misura dall'IA.",
    rulesHint: "Modalità a tempo con risposte simultanee dai telefoni."
  },
  {
    id: 'guess_media',
    title: 'Indovina Hit & Film',
    category: 'Pop Culture',
    accent: '#06b6d4',
    icon: '🎬',
    players: '3–15',
    duration: '8 min',
    isLive: false,
    badge: 'In arrivo',
    desc: "Rebus a emoji, citazioni recitate dall'IA e spezzoni sonori da decifrare prima degli altri.",
    rulesHint: "L'IA crea indizi sempre più facili ogni 10 secondi."
  },
  {
    id: 'pictionary',
    title: 'Disegna & Indovina',
    category: 'Disegno Rapido',
    accent: '#eab308',
    icon: '🎨',
    players: '3–12',
    duration: '8 min',
    isLive: false,
    badge: 'In arrivo',
    desc: "Uno disegna col dito dallo smartphone, gli altri indovinano in tempo reale sullo schermo TV.",
    rulesHint: "Parole e concetti assurdi generati dal prompt dell'host."
  }
];

// Presets for Host AI Customization
const AI_PRESETS = [
  {
    id: 'fanta',
    icon: '⚽',
    title: 'Asta & Fantacalcio',
    prompt: 'Tema Fantacalcio, Serie A, aste infinite alle 4 di notte, bidoni storici, rigori sbagliati e fantallenatori disperati.'
  },
  {
    id: 'bar',
    icon: '🍺',
    title: 'Bar Sport & Ignoranza',
    prompt: 'Tono da bar sport tra amici intimi: figuracce del sabato sera, scuse da calcetto del giovedì e aneddoti leggendari.'
  },
  {
    id: 'school',
    icon: '🎓',
    title: 'Scuola & Esami Rewind',
    prompt: 'Tema scuola, superiori, prof pazzi, verifiche a sorpresa, sessioni universitarie e ricordi di classe indimenticabili.'
  },
  {
    id: 'spicy',
    icon: '🔥',
    title: 'Spicy & Senza Filtri',
    prompt: 'Tono confidenziale e spicy per amici maggiorenni: segreti, flirt, figuracce memorabili e confessioni divertenti.'
  },
  {
    id: 'pop',
    icon: '🎬',
    title: 'Serie TV & Pop Culture',
    prompt: 'Tema cinema, serie TV cult, canzoni tormentone, meme di internet e personaggi dello spettacolo.'
  },
  {
    id: 'chaos',
    icon: '🎲',
    title: 'Caos Totale Imprevedibile',
    prompt: 'Massima creatività dell\'IA: situazioni surreali, domande completamente inaspettate e regole stravaganti.'
  }
];

const av = (p, s = 48) => `
<span class="av" style="--s:${s}px;--c:${col(p.id)}">
  ${p.ph ? `<img alt="${esc(p.name)}" src="/p/${ROOM}/${p.id}?v=${p.ph}">` : esc((p.name || '?')[0].toUpperCase())}
</span>`;

const api = b => fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.assign({ room: ROOM }, b))
}).then(r => r.json()).catch(() => ({ error: 'Connessione assente, riprova.' }));

const live = q => new EventSource('/events?room=' + ROOM + '&' + q);

const tiles = (list, key) => `
<div class="players">
  ${list.map(p => `
    <div class="pl ${p.online ? '' : 'off'}">
      ${av(p, 58)}
      ${key && p[key] ? '<i class="ok">✓</i>' : ''}
      <span>${esc(p.name)}</span>
      <small>${p.score} pt</small>
    </div>
  `).join('')}
</div>`;

const answers = v => `
<div class="answers-list">
  ${(v.answers || []).map(a => `
    <div class="answer-card pop">
      ${av({ id: a.id, name: a.name, ph: (v.players.find(p => p.id === a.id) || {}).ph }, 50)}
      <div>
        <small style="color:var(--gold);font-weight:700">${esc(a.name)}</small>
        <div class="answer-text">${esc(a.text)}</div>
      </div>
    </div>
  `).join('')}
</div>`;

const qcard = v => v.q ? `
<div class="q-box pop">
  <small style="color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;font-weight:800">Domanda del Round</small>
  <div class="q-text">${esc(v.q)}</div>
</div>` : '';

const shrink = f => new Promise(res => {
  const i = new Image();
  i.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const m = Math.min(i.width, i.height);
    c.getContext('2d').drawImage(i, (i.width - m) / 2, (i.height - m) / 2, m, m, 0, 0, 160, 160);
    res(c.toDataURL('image/jpeg', 0.72));
  };
  i.onerror = () => res(null);
  i.src = URL.createObjectURL(f);
});
