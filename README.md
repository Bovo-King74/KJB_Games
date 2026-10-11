# 🎭 Zughi del KJB

Party game multiplayer via browser per gruppi di amici. Tutti ricevono la stessa domanda, tranne uno. Chi è finito fuori tema?

Un gioco ispirato ai party game e alla deduzione sociale: non richiede installazione di app, funziona da qualsiasi smartphone e schermo condiviso.

---

## 🎮 Come funziona

1. **L'Host crea la stanza:** Avvia la partita sul computer o su una TV e apre la schermata Host. Sullo schermo appaiono un codice stanza a 4 lettere e un codice QR.
2. **I giocatori entrano dal telefono:** Inquadrano il QR o visitano il link, scelgono un nome e scattano un selfie/avatar.
3. **Fase di risposta:** Tutti ricevono una domanda e rispondono in breve. Nella modalità *Impostore*, un giocatore casuale riceve una domanda diversa senza saperlo!
4. **Discussione a voce:** Tutte le risposte appaiono sullo schermo. Il gruppo discute a voce per capire quale risposta stona.
5. **Votazione e Rivelazione:** Ognuno vota dal proprio telefono chi pensa sia l'impostore. Vengono assegnati i punti e rivelate le domande!

### 🎲 Modalità di Gioco

- **Impostore:** Tutti ricevono la stessa domanda tranne uno. Trova chi è fuori tema prima che la faccia franca!
- **Miglior risposta:** Una sfida creativa per tutti. Si risponde e poi si vota la risposta più divertente.
- **Chi è più probabile:** Domande dirette stile *"Chi è il più probabile a...?"* con votazione immediata tra gli amici.

---

## 📁 Struttura del Progetto

```text
├── server.js               # Server Node.js nativo (HTTP, SSE, API di gioco e integrazione IA)
├── package.json            # Configurazione e script di avvio
├── README.md               # Panoramica e istruzioni del progetto
├── COME_SI_GIOCA.md        # Regole dettagliate del gioco e consigli per i giocatori
├── COME_METTERLO_ONLINE.md # Guida al deploy su Render e configurazione online
└── public/                 # File statici serviti ai client
    ├── index.html          # Interfaccia web per i giocatori (smartphone)
    ├── host.html           # Interfaccia per il conduttore / schermo condiviso
    ├── style.css           # Foglio di stile responsive e componenti UI
    ├── app.js              # Funzioni client condivise e utility
    └── qr.js               # Generatore di codici QR per l'accesso rapido
```

---

## 🚀 Avvio Rapido in Locale

### Prerequisiti

- **Node.js** versione 18 o superiore.
- Nessuna dipendenza npm da installare (il server utilizza moduli nativi di Node.js).

### Avvio

1. Clona o apri la cartella del progetto:
   ```bash
   cd Epstin_game
   ```

2. Avvia il server:
   ```bash
   node server.js
   # oppure
   npm start
   ```

3. Apri il browser:
   - **Schermo Host / Conduttore:** [http://localhost:3000/host](http://localhost:3000/host)
   - **Giocatori (stessa rete Wi-Fi):** `http://<IP-DEL-TUO-PC>:3000`

---

## 🤖 Configurazione IA (Opzionale)

Il gioco funziona perfettamente **offline** con una serie di domande preimpostate. Se desideri che l'IA inventi domande dinamiche basate sui temi proposti dall'host (es. *scuola, viaggi, serie tv, cibo*), puoi impostare una chiave API:

### Google Gemini (Consigliato)
```bash
export GEMINI_API_KEY="la-tua-chiave-api"
npm start
```
*(Opzionale: puoi specificare `GEMINI_MODEL`, di default usa `gemini-3.6-flash`)*

### Anthropic Claude
```bash
export ANTHROPIC_API_KEY="la-tua-chiave-api"
npm start
```
*(Opzionale: puoi specificare `MODEL`, di default usa `claude-sonnet-5-5`)*

---

## 🌐 Pubblicazione Online (Render)

Vuoi giocare con amici anche senza essere connessi alla stessa rete Wi-Fi? Consulta la guida completa in [COME_METTERLO_ONLINE.md](COME_METTERLO_ONLINE.md) per distribuire gratuitamente l'applicazione su Render.

---

## 📖 Regole e Dettagli

Per la spiegazione completa delle regole, del sistema di punteggio e consigli tattici, leggi il file [COME_SI_GIOCA.md](COME_SI_GIOCA.md).

