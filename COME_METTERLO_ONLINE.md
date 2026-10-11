# Mettere online Fuori Tema

Dopo questi passaggi avrai un indirizzo tipo `https://fuori-tema.onrender.com` che funziona da qualsiasi rete, anche con i dati mobili. Non serve più stare sullo stesso Wi-Fi.

## 1. Carica il progetto su GitHub

1. Crea un account gratis su github.com.
2. Premi **New repository**, chiamalo `fuori-tema` e crealo.
3. Nella pagina del repository premi **uploading an existing file**.
4. Trascina dentro **tutto il contenuto** della cartella `fuori-tema-web`: `server.js`, `package.json`, `.gitignore` e la cartella `public` (con dentro `index.html`, `host.html`, `style.css`, `app.js`, `qr.js`).
5. Premi **Commit changes**.

La cartella `public` deve restare una cartella, con i suoi file dentro.

## 2. Pubblica su Render

1. Vai su render.com e registrati con il tuo account GitHub.
2. Premi **New → Web Service** e scegli il repository `fuori-tema`.
3. Compila così:
   - **Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Premi **Create Web Service** e aspetta qualche minuto.
5. In alto nella pagina del servizio trovi il tuo indirizzo `https://...onrender.com`.

## 3. Aggiungi la chiave dell'IA (facoltativo)

Nel servizio su Render vai su **Environment** e aggiungi:

- Nome: `GEMINI_API_KEY`
- Valore: la tua chiave di Google AI Studio

Poi salva: il sito si riavvia da solo. La chiave resta sul server, nessun giocatore può vederla. Se non la metti, il gioco usa le domande preimpostate.

## Come si gioca online

1. Sul computer (o sul telefono di chi ospita) apri `https://il-tuo-indirizzo/host`.
2. Compaiono un codice di 4 lettere e un QR.
3. Gli amici inquadrano il QR, oppure aprono il sito e scrivono il codice, poi mettono nome e selfie.
4. Quando siete almeno in 3, chi ospita preme **Inizia**.

Ogni partita ha il suo codice, quindi più gruppi possono giocare insieme sullo stesso sito senza disturbarsi.

## Cose da sapere

- **Il piano gratis di Render si addormenta** quando nessuno lo usa per un po'. Il primo caricamento può richiedere circa un minuto. Apri il sito qualche minuto prima di giocare.
- **Le partite non vengono salvate.** Se il server si riavvia, le stanze si cancellano e si ricomincia con un nuovo codice.
- **Il selfie** resta in memoria sul server solo finché esiste la stanza e viene cancellato con essa. Non finisce in nessun database.
- Su Render i limiti e le funzioni del piano gratis possono cambiare: controlla sul loro sito.

## Provarlo sul tuo computer prima

Nella cartella `fuori-tema-web` scrivi `node server.js` e apri `http://localhost:3000`. Per il selfie dal telefono serve però un indirizzo https, quindi la prova completa si fa online.
