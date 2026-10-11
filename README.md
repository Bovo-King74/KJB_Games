# ⚽ Zughi del KJB · Party Arcade

Party game multiplayer via browser per gruppi di amici (18–25 anni). Non richiede installazione di app: funziona direttamente da qualsiasi smartphone e grande schermo (PC/TV).

Ispirato concettualmente alla piattaforma **socialgamebox.app**, unisce una ricca collezione di minigiochi multiplayer a un'identità araldica da club sportivo/fantacalcio (*Zughi del KJB*), integrando un potente **modulo IA per personalizzare regole e contenuti del gioco in tempo reale**.

---

## 🎮 Minigiochi Disponibili & Catalogo

- 🕵️ **L'Impostore:** Tutti ricevono la stessa domanda tranne uno. Chi è finito fuori tema prima che vi freghi?
- 🏆 **Miglior Risposta:** Sfida aperta con risposte anonime e votazione della battuta più geniale o assurda.
- 👀 **Chi è più probabile?:** Domande pungenti con voto diretto tra gli amici connessi.
- ⚽ **Crea il tuo Team (Speciale KJB):** Squad builder e asta con vincoli generati dall'IA.
- 🔥 **Obbligo o Verità AI:** Penitenze graduate dall'IA senza filtri per serate ad alto tasso di risate.
- ⚡ **Quiz a Squadre:** Derby a squadre su calcio, serie TV, meme e cultura pop.
- 🎬 **Indovina Hit & Film:** Rebus a emoji e citazioni create dall'IA.
- 🎨 **Disegna & Indovina:** Disegno su schermo smartphone e indovinello live su TV.

---

## 👑 Console Host: Giochi Interni & Utility Esterne

La schermata dell'host (`/host`) include due macro-aree operative dedicate:

### 1. 🎮 Gestione Giochi Interni
- **Selezione dal Catalogo:** Scegli tra L'Impostore, Miglior Risposta e Chi è più probabile con **Toggle IA Facoltativo** (attiva la generazione dinamica di nuove domande o usa il database ufficiale preimpostato offline).
- **Creazione con Prompt Diretto all'IA:** Area per inserire prompt personalizzati (fino a 500 caratteri) con regole speciali, aneddoti del gruppo o penitenze.
- **Scelta Casuale (Randomizer):** Pulsante per pescare all'istante una modalità a sorpresa e lanciare subito il round.

### 2. 🎡 Utility & Sfide Esterne
- **Ruota della Fortuna Interattiva:** Componente visuale Canvas per sorteggiare giocatori della stanza (per penitenze/ordini), generare squadre casuali (Team A/B) o estrarre sfide fisiche.
- **Archivio Sfide Web:** Elenco di piattaforme terze (include di default JeopardyLabs e TimeGuessr) con form per aggiungere dinamicamente nuovi link personalizzati salvati in memoria.

---

## 📁 Struttura del Progetto

```text
├── server.js               # Server Node.js nativo (HTTP, SSE, API di gioco e generazione IA)
├── package.json            # Configurazione e script di avvio
├── PRODUCT.md              # Documentazione del prodotto e brand Zughi del KJB
├── DESIGN.md               # Design tokens, tipografia e sistema visivo
├── README.md               # Panoramica e istruzioni del progetto
├── COME_SI_GIOCA.md        # Regole dettagliate del gioco
├── COME_METTERLO_ONLINE.md # Guida al deploy su Render
└── public/                 # File statici serviti ai client
    ├── index.html          # Interfaccia mobile per giocatori (Lobby & Catalogo giochi)
    ├── host.html           # Console Host per TV/PC (QR, Selezione giochi & Direttore IA)
    ├── style.css           # Design system clubhouse dark-mode con token Bricolage/Figtree
    ├── app.js              # Stemma KJB, catalogo minigiochi, preset IA e utility condivise
    └── qr.js               # Generatore SVG di codici QR
```

---

## 🚀 Avvio Rapido

### Prerequisiti
- **Node.js** versione 18 o superiore.
- Nessuna dipendenza esterna da installare.

### Avvio
```bash
node server.js
# oppure
npm start
```

- **Schermo Host / TV:** [http://localhost:3000/host](http://localhost:3000/host)
- **Giocatori (smartphone):** `http://<IP-LOCALE>:3000` (oppure inquadrando il QR code sullo schermo Host)

---

## 🤖 Configurazione Chiave IA (Opzionale)

Il gioco include un database di domande offline pronte all'uso. Per abilitare la generazione dinamica di nuove domande basata sui temi dell'host:

```bash
# Con Google Gemini (Consigliato)
export GEMINI_API_KEY="la-tua-chiave-api"
npm start

# Oppure con Anthropic Claude
export ANTHROPIC_API_KEY="la-tua-chiave-api"
npm start
```
