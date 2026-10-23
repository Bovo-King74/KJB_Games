// Fuori Tema - sito web multi-stanza (nessuna dipendenza, Node 18+)
// ─────────────────────────────────────────────────────────────────
// SECURITY HARDENING (Round 1):
//   1. Input validation & sanitization in act()
//   2. Race-condition guard in start() with R.starting flag + try/finally
//   3. Per-IP rate limiting (30 req/min) with periodic cleanup
//   4. Security headers on every response (nosniff, DENY frame, XSS)
// ─────────────────────────────────────────────────────────────────

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const PORT   = +process.env.PORT  || 3000;
const GKEY   = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const AKEY   = process.env.ANTHROPIC_API_KEY;
const KEY    = GKEY || AKEY;
const MODEL  = process.env.MODEL        || 'claude-sonnet-5-5';
const GMODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// ─── Structured Logging (Round 3) ─────────────────────────────────────────────
function log(level, msg, ctx = {}) {
  const ts = new Date().toISOString();
  const ctxStr = Object.keys(ctx).length ? ' ' + JSON.stringify(ctx) : '';
  console.log(`[${ts}] [${level}] ${msg}${ctxStr}`);
}
const info  = (msg, ctx) => log('INFO ', msg, ctx);
const warn  = (msg, ctx) => log('WARN ', msg, ctx);
const error = (msg, ctx) => log('ERROR', msg, ctx);

// ─── Fallback question banks ──────────────────────────────────────────────────
const FB = {
  impostor: [
    ["Qual è il tuo cibo preferito?","Qual è il cibo che odi di più?"],
    ["Qual è il posto dove vorresti vivere?","Qual è il posto dove non vivresti mai?"],
    ["Quale app usi di più sul telefono?","Quale app cancelleresti subito?"],
    ["Qual è un film che hai visto più volte?","Qual è un film che ti ha annoiato?"],
    ["Che lavoro vorresti fare da grande?","Che lavoro faresti solo per i soldi?"],
    ["Quale superpotere vorresti?","Quale superpotere sarebbe inutile?"],
    ["Dove andresti in vacanza adesso?","Dove non andresti nemmeno gratis?"],
    ["Cosa ordini sempre in pizzeria?","Cosa non metteresti mai sulla pizza?"],
  ],
  best: [
    "Inventa la scusa peggiore per arrivare in ritardo",
    "Dai un nome a un gusto di gelato disgustoso",
    "Inventa il titolo di un film che farebbe flop",
    "Qual è la cosa più strana da dire al primo appuntamento?",
    "Inventa uno slogan per una pizzeria aperta di notte",
  ],
  likely: [
    "Chi è il più probabile a perdersi con Google Maps in mano?",
    "Chi è il più probabile a diventare famoso?",
    "Chi è il più probabile a dormire fino alle 3 del pomeriggio?",
    "Chi è il più probabile a litigare con un arbitro?",
    "Chi è il più probabile a dimenticare il compleanno di un amico?",
  ],
};

const MODES = ['impostor', 'best', 'likely'];
const pick  = a => a[Math.floor(Math.random() * a.length)];

// ─── Room storage ─────────────────────────────────────────────────────────────
const rooms = new Map();

function mkRoom() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c;
  do { c = Array.from({length: 4}, () => pick(L)).join(''); } while (rooms.has(c));
  const R = {
    code: c, token: crypto.randomUUID(),
    phase: 'lobby', mode: 'impostor', round: 0, theme: '',
    players: {}, part: [], q: '', qi: '', imp: null,
    answers: {}, votes: {}, order: [], result: null, used: [],
    clients: new Map(), seen: Date.now(),
    starting: false,   // FIX #2: race-condition guard
  };
  rooms.set(c, R);
  info('Stanza creata', { code: c });
  return R;
}

// Expire rooms older than 6 hours (checked every 10 min)
setInterval(() => {
  for (const [c, R] of rooms) {
    if (Date.now() - R.seen > 6 * 3600e3) {
      rooms.delete(c);
      info('Stanza scaduta e rimossa per inattività', { code: c });
    }
  }
}, 600e3);

const P = R => Object.values(R.players);

// ─── FIX #1: Input sanitization helpers ───────────────────────────────────────

/**
 * Trims a string and cuts it to maxLen characters.
 * Returns '' if the value is not a string.
 */
function sanitize(s, maxLen) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, maxLen);
}

/** UUID v4 pattern — exactly 36 chars with hyphens in the right places */
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** 4 uppercase letters (room code) */
const ROOM_RE  = /^[A-Z]{4}$/;
/** Alphanumeric, up to 24 chars (player/session id) */
const ID_RE    = /^[A-Za-z0-9_-]{1,24}$/;
/** Alphanumeric vote target — same rules as id */
const TGT_RE   = /^[A-Za-z0-9_-]{1,24}$/;
/** Player display name: letters (incl. accented), digits, spaces, common punctuation.
 *  Emoji are allowed because their code-points pass \p{L} / \p{N} in Unicode mode. */
const NAME_RE  = /^[\p{L}\p{N}\p{Emoji_Presentation}\p{Emoji_Modifier}\s._'-]{1,14}$/u;

// ─── FIX #3: Per-IP rate limiting ─────────────────────────────────────────────
// Key: IP string  →  Value: { count: number, windowStart: number }
const rateMap = new Map();

const RATE_LIMIT   = 30;    // max requests per window
const RATE_WINDOW  = 60e3;  // 1 minute in ms
const MAX_BODY_BYTES = 128 * 1024;
const MAX_ROOMS = 100;
const MAX_PLAYERS_PER_ROOM = 24;

function isRateLimited(ip) {
  const now  = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    // Start fresh window
    rateMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.windowStart > RATE_WINDOW) rateMap.delete(ip);
  }
}, 5 * 60e3);

// ─── FIX #4: Security headers helper ──────────────────────────────────────────
function setSecurityHeaders(req, res) {
  const nonce = crypto.randomBytes(18).toString('base64');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options',        'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
  if (req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  return nonce;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients do not send Origin
  try { return new URL(origin).host === req.headers.host; }
  catch { return false; }
}

function rateLimited(req, res) {
  if (!isRateLimited(req.socket.remoteAddress || 'unknown')) return false;
  res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: 'Troppe richieste, riprova tra poco.' }));
  return true;
}

// ─── AI helpers ───────────────────────────────────────────────────────────────
async function ask(prompt) {
  if (GKEY) {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + GMODEL + ':generateContent',
      {
        method: 'POST', signal: AbortSignal.timeout(20000),
        headers: { 'content-type': 'application/json', 'x-goog-api-key': GKEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
      }
    );
    const d = await r.json();
    if (!d.candidates) throw new Error(d.error && d.error.message || 'risposta vuota da Gemini');
    return d.candidates[0].content.parts.map(p => p.text || '').join('');
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { 'content-type': 'application/json', 'x-api-key': AKEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
  });
  return (await r.json()).content[0].text;
}

async function gen(R, mode, desc, useAi) {
  if (KEY && useAi !== false) {
    try {
      const prompt =
        'Sei il conduttore di un party game tra amici di 18 anni, in italiano, tono leggero e divertente. ' +
        (desc ? 'Richiesta del conduttore: "' + desc + '". ' : '') +
        (mode === 'auto'
          ? 'Scegli tu il tipo di gioco più adatto alla richiesta tra impostor, best, likely. '
          : 'Tipo di gioco: ' + mode + '. ') +
        'Tipi: "impostor" = tutti ricevono la stessa domanda tranne uno, che ne riceve una diversa ma simile ' +
        '(risposte brevi di 1-3 parole plausibili per entrambe); "best" = tutti ricevono la stessa sfida creativa, ' +
        'rispondono e poi votano la risposta migliore; "likely" = una domanda tipo "Chi è il più probabile a...?" ' +
        'a cui si risponde votando un giocatore. Non ripetere: ' + R.used.slice(-10).join(' | ') +
        '. Rispondi SOLO con JSON: {"mode":"impostor|best|likely","normal":"...","impostor":"... (solo per impostor, altrimenti vuoto)"}';
      const j = JSON.parse((await ask(prompt)).match(/\{[\s\S]*\}/)[0]);
      const m = mode === 'auto' ? (MODES.includes(j.mode) ? j.mode : 'impostor') : mode;
      if (j.normal && (m !== 'impostor' || j.impostor)) {
        R.used.push(j.normal);
        return { mode: m, q: j.normal, qi: m === 'impostor' ? j.impostor : '' };
      }
    } catch (e) {
      warn('IA non disponibile, uso domande preimpostate', { room: R.code, error: e.message });
    }
  }
  const m     = mode === 'auto' ? pick(MODES) : mode;
  const key   = x => m === 'impostor' ? x[0] : x;
  const pool  = FB[m].filter(x => !R.used.includes(key(x)));
  const x     = pick(pool.length ? pool : FB[m]);
  R.used.push(key(x));
  return m === 'impostor' ? { mode: m, q: x[0], qi: x[1] } : { mode: m, q: x, qi: '' };
}

// ─── Game state helpers ───────────────────────────────────────────────────────
function view(R, id) {
  const v = {
    code: R.code, phase: R.phase, mode: R.mode, round: R.round,
    ai: !!KEY && (R.useAi !== false), theme: R.theme || '',
    players: P(R).map(p => ({
      id: p.id, name: p.name, score: p.score, online: p.online,
      ph: p.pv, in: R.part.includes(p.id),
      answered: p.id in R.answers, voted: p.id in R.votes,
    })),
  };
  if (id !== 'host') {
    const me = R.players[id];
    v.me = me ? { id: me.id, name: me.name, score: me.score, in: R.part.includes(id) } : null;
    if (R.phase === 'answering' && me && v.me.in) {
      v.question = R.imp === id ? R.qi : R.q;
      v.answered = id in R.answers;
    }
    v.voted = id in R.votes;
  }
  if (R.mode !== 'impostor' && ['answering','discussion','voting','reveal'].includes(R.phase)) v.q = R.q;
  if (['discussion','voting','reveal'].includes(R.phase))
    v.answers = R.order.filter(i => R.players[i]).map(i => ({ id: i, name: R.players[i].name, text: R.answers[i] }));
  if (R.phase === 'reveal') v.result = R.result;
  return v;
}

const push      = (R, id, res) => res.write('data: ' + JSON.stringify(view(R, id)) + '\n\n');
const broadcast = R => R.clients.forEach((res, id) => push(R, id, res));

// ─── start() — FIX #2: race-condition guard via R.starting + try/finally ──────
async function start(R, theme, mode, useAi) {
  const part = P(R).filter(p => p.online).map(p => p.id);

  // Guard: do not start if already loading OR if another start() is in-flight
  if (part.length < 3 || R.phase === 'loading' || R.starting) return;

  R.starting = true;                                     // lock acquired
  if (typeof theme === 'string') R.theme = theme.slice(0, 500);
  if (typeof useAi === 'boolean') R.useAi = useAi;
  R.phase = 'loading'; R.round++; R.part = part;
  broadcast(R);

  try {
    const r = await gen(R, MODES.includes(mode) || mode === 'auto' ? mode : 'impostor', R.theme, R.useAi);
    Object.assign(R, {
      mode: r.mode, q: r.q, qi: r.qi,
      imp: r.mode === 'impostor' ? pick(part) : null,
      answers: {}, votes: {}, order: [], result: null,
      phase: r.mode === 'likely' ? 'voting' : 'answering',
    });
    broadcast(R);
    info('Round avviato', { room: R.code, round: R.round, mode: r.mode, participants: part.length });
  } finally {
    R.starting = false;                                  // lock released (always)
  }
}

const discuss = R => {
  R.order = R.part.filter(i => i in R.answers).sort(() => Math.random() - .5);
  R.phase = 'discussion';
};

function reveal(R) {
  const t = {};
  Object.values(R.votes).forEach(x => t[x] = (t[x] || 0) + 1);
  const tally = Object.entries(t)
    .map(([i, n]) => ({ name: R.players[i] ? R.players[i].name : '?', n }))
    .sort((a, b) => b.n - a.n);
  const X = {
    mode: R.mode, q: R.q, qi: R.qi, tally,
    gain: {},
    winner: tally.filter(x => x.n === tally[0].n).map(x => x.name).join(' e '),
  };
  if (R.mode === 'impostor') {
    const top = Object.keys(t).filter(k => t[k] === (tally[0] ? tally[0].n : 0));
    X.caught    = top.length === 1 && top[0] === R.imp;
    X.impId     = R.imp;
    X.impostor  = R.players[R.imp].name;
    for (const [v, x] of Object.entries(R.votes)) if (x === R.imp) X.gain[v] = 1;
    if (!X.caught) X.gain[R.imp] = (X.gain[R.imp] || 0) + 2;
  } else if (R.mode === 'best') {
    for (const i in t) X.gain[i] = t[i];
  }
  for (const i in X.gain) if (R.players[i]) R.players[i].score += X.gain[i];
  R.result = X; R.phase = 'reveal';
  info('Risultati rivelati', { room: R.code, round: R.round, mode: R.mode, winner: X.winner });
}

function setPhoto(p, d) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(d || '');
  if (!m || m[1].length > 43692 || m[1].length % 4 !== 0) return false;
  const bytes = Buffer.from(m[1], 'base64');
  if (!bytes.length || bytes.length > 32768 || bytes.toString('base64') !== m[1]) return false;
  p.photo = bytes;
  p.pv++;
  return true;
}

// ─── act() — FIX #1: full input validation & sanitization ─────────────────────
async function act(b) {
  // ── Validate room code ─────────────────────────────────────────────────────
  const rawRoom = sanitize(String(b.room || ''), 10).toUpperCase();
  if (!ROOM_RE.test(rawRoom)) return { error: 'Input non valido' };

  const R = rooms.get(rawRoom);
  if (!R) return { error: 'Stanza non trovata. Controlla il codice.' };
  R.seen = Date.now();

  // ── Validate player id ─────────────────────────────────────────────────────
  const rawId = sanitize(String(b.id || ''), 24);
  if (rawId !== 'host' && !ID_RE.test(rawId)) return { error: 'Input non valido' };
  const id = rawId;

  const t = b.type;

  // ── Validate host token (must be UUID, exactly 36 chars) ───────────────────
  const rawToken = sanitize(String(b.token || ''), 36);
  const host     = id === 'host' && rawToken.length === 36 && UUID_RE.test(rawToken) && rawToken === R.token;

  // ── join ───────────────────────────────────────────────────────────────────
  if (t === 'join') {
    if (!id || id === 'host') return { error: 'Errore, riprova.' };
    if (b.adult !== true) return { error: 'Per giocare è necessario dichiarare di avere almeno 18 anni.' };

    // Validate name: allowed chars + max 14 chars
    const rawName = sanitize(String(b.name || ''), 14);
    if (rawName && !NAME_RE.test(rawName)) return { error: 'Input non valido' };

    let p = R.players[id];
    if (!p) {
      if (P(R).length >= MAX_PLAYERS_PER_ROOM) return { error: 'La stanza ha raggiunto il limite di giocatori.' };
      let name = rawName || 'Giocatore';
      let n = name, i = 2;
      while (P(R).some(x => x.name.toLowerCase() === n.toLowerCase())) n = name + i++;
      p = R.players[id] = { id, name: n, score: 0, online: false, photo: null, pv: 0 };
    }
    if (b.photo && !setPhoto(p, b.photo)) return { error: 'Foto non valida. Scegline un’altra o continua senza foto.' };
    p.online = R.clients.has(id);
    broadcast(R);
    return { ok: true, name: p.name };
  }

  // ── host actions ───────────────────────────────────────────────────────────
  if (host) {
    if (t === 'start' || t === 'next') { start(R, b.theme, b.mode, b.ai); return {}; }
    if (t === 'discuss' && R.phase === 'answering')          discuss(R);
    if (t === 'tovote'  && R.phase === 'discussion')         R.phase = 'voting';
    if (t === 'reveal'  && R.phase === 'voting')             reveal(R);
    if (t === 'lobby'   && R.phase !== 'loading')            { R.phase = 'lobby'; R.part = []; }

  // ── player actions ─────────────────────────────────────────────────────────
  } else if (R.players[id] && R.part.includes(id)) {
    if (t === 'answer' && R.phase === 'answering') {
      // Validate and sanitize answer text
      const text = sanitize(String(b.text || ''), 80);
      R.answers[id] = text || '…';
      if (R.part.every(i => i in R.answers)) discuss(R);
    }
    if (t === 'vote' && R.phase === 'voting') {
      // Validate vote target: must be alphanumeric, not self, must be in participants
      const rawTarget = sanitize(String(b.target || ''), 24);
      if (!TGT_RE.test(rawTarget)) return { error: 'Input non valido' };
      if (rawTarget !== id && R.part.includes(rawTarget)) {
        R.votes[id] = rawTarget;
        if (R.part.every(i => i in R.votes)) reveal(R);
      }
    }
  }

  broadcast(R);
  return {};
}

// ─── Static file map ──────────────────────────────────────────────────────────
const PAGES = { '/': 'index.html', '/host': 'host.html', '/privacy': 'privacy.html', '/style.css': 'style.css', '/app.js': 'app.js', '/qr.js': 'qr.js' };
const TYPE  = { html: 'text/html', css: 'text/css', js: 'text/javascript' };

// ─── HTTP server ──────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  // FIX #4: Apply security headers to every response
  const nonce = setSecurityHeaders(req, res);

  const u = new URL(req.url, 'http://x');
  const q = u.searchParams;

  // ── SSE endpoint ───────────────────────────────────────────────────────────
  if (u.pathname === '/events') {
    const R  = rooms.get((q.get('room') || '').toUpperCase());
    const id = q.get('id') || '';
    if (!R || (id === 'host' ? q.get('token') !== R.token : !ID_RE.test(id) || !R.players[id])) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    R.clients.set(id, res);
    if (R.players[id]) R.players[id].online = true;
    push(R, id, res); broadcast(R);
    const hb = setInterval(() => { R.seen = Date.now(); res.write(': ♥\n\n'); }, 15000);
    req.on('close', () => {
      clearInterval(hb);
      if (R.clients.get(id) === res) {
        R.clients.delete(id);
        if (R.players[id]) R.players[id].online = false;
        broadcast(R);
      }
    });

  // ── Create room ────────────────────────────────────────────────────────────
  } else if (u.pathname === '/api/create' && req.method === 'POST') {
    if (!sameOrigin(req)) { res.writeHead(403); return res.end('Richiesta non consentita'); }
    if (rateLimited(req, res)) return;
    if (Number(req.headers['content-length'] || 0) > 0 || req.headers['transfer-encoding']) {
      res.writeHead(400); return res.end('La richiesta non deve contenere un corpo.');
    }
    if (rooms.size >= MAX_ROOMS) { res.writeHead(503); return res.end('Troppe stanze attive, riprova più tardi.'); }
    const R = mkRoom();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ room: R.code, token: R.token }));

  // ── Main API — with rate limiting ──────────────────────────────────────────
  } else if (u.pathname === '/api' && req.method === 'POST') {
    if (!sameOrigin(req)) { res.writeHead(403); return res.end('Richiesta non consentita'); }
    if (rateLimited(req, res)) return;
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      res.writeHead(415); return res.end('È richiesto JSON');
    }

    let s = '', bodyBytes = 0, tooLarge = false;
    req.on('data', c => {
      if (tooLarge) return;
      bodyBytes += c.length;
      if (bodyBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        res.writeHead(413, { 'Connection': 'close' });
        res.end('Richiesta troppo grande');
        return;
      }
      s += c;
    });
    req.on('end', async () => {
      if (tooLarge || res.writableEnded) return;
      let out = {};
      try {
        const body = JSON.parse(s);
        if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('JSON non valido');
        out = await act(body);
      }
      catch (e) {
        warn('Richiesta /api non valida');
        out = { error: 'Richiesta non valida' };
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(out));
    });

  // ── Player photo ───────────────────────────────────────────────────────────
  } else if (u.pathname.startsWith('/p/')) {
    const [,, c, id] = u.pathname.split('/');
    const R = rooms.get((c || '').toUpperCase());
    const p = R && R.players[id];
    if (!p || !p.photo) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(p.photo);

  // ── Static files ───────────────────────────────────────────────────────────
  } else if (PAGES[u.pathname]) {
    const f = PAGES[u.pathname];
    res.writeHead(200, { 'Content-Type': TYPE[f.split('.')[1]] + '; charset=utf-8' });
    let content = fs.readFileSync(path.join(__dirname, 'public', f));
    if (f.endsWith('.html')) content = content.toString('utf8').replace(/<script>/g, `<script nonce="${nonce}">`);
    res.end(content);

  } else {
    res.writeHead(404);
    res.end('Pagina non trovata');
  }
}).listen(PORT, () => {
  info('🎭 Server Fuori Tema pronto e in ascolto', { port: PORT, url: 'http://localhost:' + PORT });
  info('Integrazione AI', { provider: GKEY ? 'Gemini (' + GMODEL + ')' : AKEY ? 'Claude (' + MODEL + ')' : 'Offline (banca quesiti preimpostata)' });
});
