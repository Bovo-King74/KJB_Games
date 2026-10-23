# Fuori Tema

Un gioco da telefono per gruppi di amici. Tutti ricevono la stessa domanda, tranne uno. Chi è finito fuori tema?

**Giocatori:** da 3 in su. **Durata:** circa 5 minuti a round.

## Cosa serve

- Il tuo telefono
- Il Wi-Fi a cui è collegato il computer di chi ospita
- Gli amici nella stessa stanza (il bello è discutere a voce)

## Come entrare

1. Collega il telefono allo stesso Wi-Fi del computer.
2. Apri nel browser l'indirizzo che compare sullo schermo del computer (tipo `http://192.168.1.20:3000`).
3. Scrivi il tuo nome e premi **Entra**.

Il telefono si ricorda il nome. Se la pagina si chiude o si ricarica, rientri da solo e non perdi i punti.

## Come si gioca

**1. Rispondi.**
Sul telefono compare una domanda. Scrivi una risposta breve, meglio se di una o due parole, e premi **Invia**. Nessuno vede cosa scrivi finché non hanno risposto tutti.

Attenzione: una sola persona ha ricevuto una domanda **diversa** dalle altre. È l'impostore, e non sa di esserlo. Pensa di rispondere alla stessa domanda di tutti.

**2. Discutete.**
Sullo schermo del computer e sui telefoni compaiono tutte le risposte con i nomi. Ora parlate a voce:

- Quale risposta sembra strana?
- Chiedete a qualcuno di spiegare perché ha risposto così.
- Se sei tu quello strano, difenditi.

**3. Votate.**
Quando siete pronti, chi ospita passa al voto. Ognuno sceglie dal telefono chi pensa sia l'impostore. Non puoi votare te stesso.

**4. Risultato.**
Vengono rivelati l'impostore, la domanda di tutti e quella dell'impostore. Poi parte il round successivo.

## Altre modalità

Chi ospita può scegliere (o far scegliere all'IA) il tipo di gioco:

- **Miglior risposta:** tutti ricevono la stessa sfida creativa e rispondono. Poi votate la risposta più divertente. Ogni voto ricevuto vale 1 punto.
- **Chi è più probabile:** compare una domanda tipo «Chi è il più probabile a…?» e votate un amico. Vince chi prende più voti, niente punti.

## Punti (modalità Impostore)

| Cosa succede | Punti |
|---|---|
| Hai votato l'impostore | +1 |
| Sei l'impostore e non vieni beccato | +2 |

L'impostore viene beccato solo se prende **più voti di tutti gli altri**. Se c'è parità, l'ha sfangata.

Vince chi ha più punti dopo i round che decidete di fare. Consiglio: 5 round.

## Consigli

- **Se sei l'impostore:** non puoi saperlo subito. Se dopo aver letto le risposte degli altri ti accorgi che la tua non c'entra niente, inventati una scusa credibile.
- **Se non lo sei:** non rispondere in modo troppo ovvio, altrimenti l'impostore capisce qual era la domanda vera.
- **Per tutti:** le risposte più divertenti sono quelle né troppo vaghe né troppo specifiche.

## Regole d'oro

1. Niente occhiate agli schermi degli altri.
2. Non dite a voce la vostra domanda prima del voto.
3. Chi entra a round già iniziato aspetta il prossimo.

## Per chi ospita

1. Dalla cartella principale del progetto, avvia il server con `npm start` (oppure `node server.js`).
2. Apri `http://localhost:3000/host` sul computer.
3. Quando ci sono almeno 3 giocatori, premi **Inizia**.
4. Se vuoi, scrivi un tema prima di iniziare (cibo, scuola, viaggi…) e l'IA inventa le domande su quello.
