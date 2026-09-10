---
name: Shift Flow
description: Un mondo editoriale costruito attorno alla trilogia
colors:
  paper: "#f7f8f7"
  ink: "#253533"
  muted: "#5f6c68"
  deep: "#233d3b"
  rose: "#e6b5cb"
  aqua: "#b7e0dc"
  coral: "#e08d7f"
  coral-ink: "#a44f43"
  sky: "#9cbcd6"
  blue-ink: "#386681"
  line: "#d5ddda"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(3.5rem, 5.4vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.65rem, 4.3vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Barlow, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  field: "4px"
  workspace: "12px"
spacing:
  small: "16px"
  panel: "34px"
components:
  button-primary:
    backgroundColor: "{colors.deep}"
    textColor: "#ffffff"
    padding: "14px 23px"
---

# Design System: Shift Flow

## Overview

**Creative North Star: "La vita cambia ritmo"**

Identità editoriale richiesta dall'utente: libri al centro, spazi aperti, tipografia serif, dettagli interattivi. Questa documentazione descrive il codice, non un'approvazione visuale: il browser dell'ambiente resta bloccato.

## Colors

Bianco carta e inchiostro morbido derivano dalla struttura delle copertine. Rosa e acqua riprendono il primo volume; corallo Relactions; azzurro Evolve. Le tinte profonde sostengono testo e controlli, le tinte chiare atmosfera e selezioni. Le tonalità sono interpretazioni progettuali delle copertine, non campioni colorimetrici certificati.

## Typography

Bodoni Moda richiama il lettering serif di Relactions ed Evolve, Barlow è usato per interfaccia e testi. Entrambi sono ospitati localmente con licenze incluse. Non usare il corsivo sintetico nel testo principale.

## Layout

Contenitore massimo 1280 px con margini di 56, 32 o 20 px. Hero a due colonne con visualizzatore del libro; lettura editoriale e trilogia in tre colonne; metodo interattivo su fondo scuro; planner chiaro. Tech project è un disclosure chiuso inizialmente. Breakpoint a 1150, 850 e 560 px.

## Elevation & Depth

La profondità è riservata soprattutto all'oggetto libro: copertina originale su piani trasformati in 3D, dorso e bordo pagine dimostrativi. Un'ombra morbida ancora il libro alla superficie. Non vengono sostituite le illustrazioni originali delle copertine.

## Shapes

Pulsanti primari rettangolari; piccoli campi a 4 px; workspace a 12 px; controlli di selezione arrotondati. Linee sottili sostengono sezioni e progressione.

## Components

- Libro: selezione di tre volumi nell'ordine Shift Flow, Relactions, Evolve; rotazione da puntatore o slider; copertina apribile; interno esplicitamente dimostrativo.
- Movimento: oscillazione del libro, apertura, cambio volume, hover e ingressi discreti. Pulsante Pausa e preferenza movimento ridotto. Nessun contenuto essenziale nascosto in attesa di animazione.
- Metodo: quattro pulsanti con aria-pressed aggiornano una spiegazione, un esempio e una frase conclusiva.
- Tech: details/summary nativo; il collegamento diretto apre il pannello.
- Planner: invio protetto da duplicati, stato in attesa, output Markdown sanitizzato e regione focalizzabile, errori espliciti.
- Palette: non usare i pastelli come testo piccolo su bianco.

## Do's and Don'ts

- Do preservare la copertina reale e l'ordine dei volumi.
- Do distinguere il nome del sito Shift Flow dal nome del metodo PFEV.
- Do mantenere tutti i controlli principali usabili anche senza hover.
- Don't reintrodurre la sezione tecnica come protagonista della pagina.
- Don't dichiarare superata la verifica visuale senza prove nel browser.
