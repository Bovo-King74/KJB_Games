---
name: Zughi del KJB
description: Party game multiplayer arcade con estetica da clubhouse sportiva, ispirata a socialgamebox.app con personalizzazione regole IA
colors:
  bg: "#090d16"
  surface: "#121927"
  surface-card: "#162032"
  surface-hover: "#1c2940"
  surface-active: "#22324e"
  surface-elevated: "#1a253a"
  border: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.16)"
  border-gold: "rgba(245, 158, 11, 0.4)"
  gold: "#f59e0b"
  gold-light: "#fbbf24"
  emerald: "#10b981"
  rose: "#f43f5e"
  blue: "#3b82f6"
  purple: "#8b5cf6"
  cyan: "#06b6d4"
  text-main: "#f8fafc"
  text-muted: "#94a3b8"
  text-dim: "#64748b"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: "clamp(34px, 7vw, 56px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: "clamp(24px, 4.5vw, 36px)"
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: "'Figtree', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  sm: "10px"
  md: "16px"
  lg: "24px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "#0b0f19"
    rounded: "{rounded.md}"
    padding: "14px 22px"
  button-secondary:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
---

# Design System: Zughi del KJB

## Overview
Zughi del KJB è una piattaforma multiplayer di minigiochi party da browser (smartphone + grande schermo host), con un'identità ispirata alla cultura sportiva, al fantacalcio e ai ritrovi tra amici 18–25 anni. L'interfaccia unisce la modularità pulita di socialgamebox.app con un'atmosfera da clubhouse serale.

## Colors
- **Sfondo & Superfici:** Deep Navy `#090d16` con gradiente radiale a `#162038`, e card in toni ardesia scuro `#162032` ed elevato `#1a253a`.
- **Accenti Principali:** Gold `#f59e0b` per azioni primarie, stemma KJB e richiami di vittoria; Pitch Emerald `#10b981` per conferme di presenza e stati attivi; Rose `#f43f5e` per impostore e alert.
- **Testi:** Bianco latte `#f8fafc` ad alto contrasto per titoli, grigio ardesia `#94a3b8` per testi secondari.

## Typography
- **Display & Headings:** `Bricolage Grotesque` (700, 800, 900) con tracking compatto (-0.025em) per dare impatto atletico e autorevole.
- **Body & Controls:** `Figtree` (500, 600, 700) per garantire la massima leggibilità a colpo d'occhio da smartphone.

## Layout
- **Mobile First per Giocatori:** Wrapper compatto max 620px con safe area padding per iPhone/Android. Layout orientato all'uso con una mano.
- **TV / Large Screen per Host:** Grid a due colonne (360px info stanza con PIN/QR + colonna destra per catalogo giochi e modulo IA).

## Elevation & Depth
- Nessun finto neobrutalismo piatto con ombre nette a 0-blur.
- Ombre morbide naturali a più livelli (`--shadow-sm`, `--shadow-md`, `--shadow-lg`) con trasparenze studiate per ambienti scuri.

## Shapes
- Angoli raccordati moderni (`10px` per elementi compatti, `16px` per card e pulsanti, pillole `9999px` per tag di stato e preset).
- Stemma SVG araldico personalizzato a scudo per Zughi del KJB.

## Components
- **Macro Navigation Bar:** Switcher a due sezioni (Giochi Interni vs Utility & Sfide) per evitare sovraccarico visivo.
- **Game Card:** Schede minigioco con icona, badge di stato, metadati (giocatori, durata) e nota regole IA.
- **AI Toggle Switch:** Toggle fluido iOS-style per attivare/disattivare facoltativamente la generazione IA delle domande.
- **AI Director Module:** Selettore rapido di preset (Fantacalcio, Bar Sport, Scuola, Spicy, ecc.) e textarea dedicata per prompt personalizzato.
- **Randomizer Card:** Box orizzontale compatto per avvio a sorpresa istantaneo.
- **Wheel of Fortune:** Ruota canvas interattiva con fisica di decelerazione per sorteggi giocatori, squadre e penitenze.
- **External Links Archive:** Lista interattiva per piattaforme di terze parti (JeopardyLabs, TimeGuessr) con form per aggiungere nuovi link.
- **Room PIN Display:** Visualizzazione a caratteri cubitali con alto contrasto per rapido inserimento.

## Do's and Don'ts
- **DO:** Mantenere contrasti elevati su sfondi scuri e dare ampio respiro tra le sezioni.
- **DO:** Usare l'oro `#f59e0b` con parsimonia solo per punti focali e call to action primarie.
- **DO:** Separare le funzioni interne dai tool esterni tramite macro-navigazione.
- **DON'T:** Non usare bordi spessi o strisce decorative laterali artificiali sulle card.
- **DON'T:** Non inserire animazioni infinite a pulsazione senza scopo informativo.

