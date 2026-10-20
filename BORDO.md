# 📋 File di Bordo — Zughi del KJB / Fuori Tema

> Aggiornato automaticamente da Antigravity — ultima modifica: 2026-10-20

---

## 🎯 Obiettivi del Progetto

- Creare un party game multiplayer in tempo reale giocabile via browser senza app
- Supportare 3 modalità di gioco: Impostore, Miglior Risposta, Chi è più probabile?
- Integrazione opzionale con AI (Gemini / Claude) per generazione dinamica di domande
- Interfaccia host su TV/schermo grande, giocatori via smartphone con QR code
- Ruota della fortuna e archivio sfide esterne come utility aggiuntive
- Personalizzazione tema via preset o prompt libero all'AI
- Funzionare senza dipendenze backend pesanti (Node.js puro)

---

## ✅ Mansioni Svolte

### Round 1 — Sicurezza & Robustezza del Server
- [x] Aggiunta validazione e sanitizzazione degli input lato server (`act()`)
- [x] Aggiunto rate limiting per prevenire spam di richieste API
- [x] Corretta race condition nella fase `start` con flag atomico
- [x] Aggiunto Content-Security-Policy e header di sicurezza HTTP
- [x] Migliorata gestione errori con messaggi specifici per tipo di errore

### Round 2 — UX & Accessibilità
- [x] Aggiornamento differenziale del DOM nella lobby host (no full re-render)
- [x] Feedback di loading sul pulsante "Invia Risposta" con blocco doppi invii
- [x] Tooltip e stato visivo sui giochi "In arrivo" nel catalogo
- [x] Aggiunto attributo `aria-label` sui pulsanti di voto
- [x] Aggiunto `autocomplete="off"` e `inputmode="text"` per mobile

### Round 3 — Qualità del Codice & Manutenibilità
- [x] Rimossa dipendenze inutilizzate da `package.json` (Three.js, React, Framer Motion, ecc.) con `npm prune`
- [x] Introdotto logging strutturato con timestamp ISO e livelli (`INFO`, `WARN`, `ERROR`)
- [x] Riformattazione completa di `server.js` con sezioni architetturali ben delimitate, commenti tecnici e rimozione minificazione
- [x] Aggiunti script npm per sviluppo locale (`"dev": "node --watch server.js"`) e standardizzazione `"type": "commonjs"`

---

## 📌 Mansioni da Svolgere

### Priorità Alta
- [ ] Aggiungere un sistema di persistenza delle stanze (es. file JSON o SQLite) per sopravvivere ai restart del server
- [ ] Implementare riconnessione automatica lato client con exponential backoff
- [ ] Test di carico con più di 20 giocatori connessi simultaneamente

### Priorità Media
- [ ] Implementare la modalità "Obbligo o Verità AI" (già nel catalogo come "In arrivo")
- [ ] Implementare il "Quiz a Squadre" con punteggi di squadra
- [ ] Timer visivo per le risposte (countdown sul telefono)
- [ ] Notifica sonora/vibrazione su mobile quando arriva una nuova domanda

### Priorità Bassa
- [ ] PWA (Progressive Web App) con icona installabile su homescreen
- [ ] Dark/light mode toggle
- [ ] Esportazione classifica in formato immagine condivisibile
- [ ] Localizzazione in lingua diversa dall'italiano

---

## 🔴 Debolezze Identificate (Pre-Intervento)

### Round 1 — Sicurezza & Robustezza
1. Nessuna validazione/sanitizzazione degli input lato server
2. Token host esposto in SessionStorage in plaintext (rischio impersonazione)
3. Race condition nella fase `start` con chiamate asincrone AI

### Round 2 — UX & Accessibilità
1. `host.html` ridisegnava l'intera pagina ad ogni evento SSE (flickering, perdita focus)
2. Nessun feedback visivo durante invio risposta (doppi invii possibili)
3. Giochi "In arrivo" non cliccabili senza spiegazione per l'utente

### Round 3 — Qualità del Codice
1. `server.js` monolitico di 132 righe minificate (logica, routing e AI mischiate)
2. `package.json` con dipendenze Three.js/React/Framer inutilizzate (~50MB)
3. Nessun logging strutturato (solo `console.log()` sparsi)

