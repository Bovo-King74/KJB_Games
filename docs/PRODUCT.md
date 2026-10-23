# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Gruppo di amici 18–25 anni, tipicamente compagni di scuola superiore o universitari. Giocano insieme nella stessa stanza — chi ospita ha un computer/TV, gli altri usano lo smartphone. Il contesto è informale: serate, feste, ritrovi tra amici.

## Product Purpose

Party game multiplayer in browser che funziona senza app: un giocatore ospita la partita sullo schermo grande, gli altri entrano dal telefono scansionando un QR code. Tre modalità di gioco (Impostore, Miglior risposta, Chi è più probabile) alimentate opzionalmente da IA generativa per domande su tema. Il valore è nella semplicità: zero installazione, zero account, si gioca subito.

## Positioning

Gioco browser-only senza download, senza account, senza dipendenze npm. L'integrazione IA (Gemini/Claude) genera domande a tema in tempo reale, ma il gioco funziona completamente anche offline con domande preimpostate. Multi-stanza simultanea con codici a 4 lettere.

## Operating Context

- L'host apre `/host` su un browser desktop/TV → codice stanza + QR code
- I giocatori scansionano il QR o digitano il codice su smartphone
- Si gioca nella stessa stanza fisica, la discussione avviene a voce
- Il server Node.js nativo (nessuna dipendenza) comunica via Server-Sent Events
- Deploy opzionale su Render (piano gratuito)

## Capabilities and Constraints

**Funzionalità confermate:**
- Tre modalità: impostor, best answer, likely
- Selfie/avatar da fotocamera smartphone
- Punteggio e classifica persistenti nella sessione
- Generazione domande via Gemini API o Anthropic API (opzionale)
- Fallback a domande preimpostate senza chiave API
- Multi-stanza concorrente, codici a 4 lettere, pulizia automatica dopo 6h
- Riconnessione automatica (localStorage)

**Vincoli tecnici:**
- Server Node.js ≥ 18, zero dipendenze npm
- File statici serviti dalla cartella `public/`
- Comunicazione real-time via SSE (Server-Sent Events), no WebSocket
- Foto in memoria (Buffer), nessun database

## Brand Commitments

- **Nome:** *Zughi del KJB* (da adottare, attualmente "Fuori Tema")
- **Logo:** da creare — ispirato allo stile di uno stemma da fantacalcio (scudo, emblema sportivo stilizzato)
- **Tono:** informale, scherzoso, tra amici
- **Uso:** privato, tra il gruppo di amici del creatore

## Evidence on Hand

Nessun asset grafico, logo o materiale di branding esistente. Il nome "Fuori Tema" è usato nel codice e nell'interfaccia attuale. Le domande preimpostate sono in italiano e calibrate per un pubblico 18+.

## Product Principles

1. **Gioca subito:** Nessun download, nessun account — QR, nome, via.
2. **Tutto dal telefono:** L'interfaccia giocatore è pensata per essere usata con una mano sola sullo smartphone.
3. **La discussione è il gioco:** Il software facilita, il divertimento è nella conversazione a voce tra amici.
4. **Funziona anche senza internet (lato IA):** Le domande preimpostate garantiscono il funzionamento completo senza API key.

