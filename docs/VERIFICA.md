# Verifica del redesign Shift Flow

## Revisione editoriale interattiva

- Nome del sito: Shift Flow. PFEV resta il metodo.
- Ordine visibile e selezionabile: Shift Flow, Relactions, Evolve. La copertina originale riporta RELACTIONS.
- Palette ispirata alle copertine: bianco carta, inchiostro morbido, rosa/acqua, corallo e azzurro. Bodoni Moda sostituisce il display condensato; Barlow resta il carattere d'interfaccia.
- Hero sostituita con visualizzatore CSS 3D: copertina originale, cambio volume, apertura, rotazione da puntatore e slider. Spessore, dorso e interno sono dimostrativi, non una riproduzione certificata di un'edizione fisica.
- Metodo consultabile in quattro pannelli, selettore energia spostato nel metodo, Tech project raccolto in una tendina chiusa inizialmente e apribile dai link.
- Pausa animazioni, movimento ridotto, avanzamento di lettura e interazioni da tastiera.
- La simulazione DOM è stata estesa a ordine dei libri, cambio copertina, apertura/chiusura, rotazione, pausa, pannelli del metodo e apertura della sezione tecnica. Build e suite API nuovamente eseguite.
- Non è stato aggirato il blocco del browser: geometria visiva 3D, resa Safari e layout reale restano da verificare sul dispositivo dell'utente. Le prove simulate non equivalgono a screenshot o test nei browser.

Il resoconto seguente descrive anche la prima revisione. Il diagramma dell'energia non è più nella hero; è sostituito dal libro interattivo.

## Funzioni conservate

- Form risorse: stesso webhook e stessi campi JSON `name`, `email`, `resource: planner-pfev`.
- Planner AI: stesso percorso `/api/ai-planner`, stesse variabili server-side e header `x-pfev-secret`.
- Rendering Markdown con Marked e sanitizzazione DOMPurify.
- Vite, JavaScript, Docker, Nginx e Vercel, senza migrazione di framework.

## Miglioramenti

- Nuova gerarchia editoriale, font ospitati localmente e copertine originali.
- Diagramma dell'energia interattivo, esplicitamente illustrativo.
- Metodo in quattro parti e sinossi dei tre libri, senza manoscritti integrali.
- Esempi compilabili, conteggio caratteri, blocco dei doppi invii, timeout, errori recuperabili.
- Copia e download del testo del piano; il risultato precedente resta disponibile dopo un errore.
- HTML AI limitato a elementi Markdown: esclusi stili inline, SVG e controlli interattivi.
- Risultato scorrevole raggiungibile da tastiera; input bloccato durante la generazione.
- Sezione Tech completata con gruppi tecnologici, due flussi e limiti architetturali reali.
- Candidatura Jobtech e contatto con Luca Guido.

## Prove eseguite

1. Compilazione di produzione Vite.
2. Suite Node `tests/ai-planner.test.js`: metodo HTTP, input, configurazione assente, contratto del workflow, errori upstream, contenuto non valido e timeout. I servizi sono simulati.
3. Simulazione DOM con JSDOM: ancore e ID, selettore energia, menu/Escape, selettore architettura, esempi, doppio invio, successo/errore AI, rimozione HTML ostile, focus del risultato, copia/download e successo/errore del form risorse. Nessuna richiesta reale è stata inviata.
4. Revisione indipendente del codice: tre problemi segnalati e corretti (stili HTML AI, focus del risultato, modifiche al contesto durante l'attesa). La conferma indipendente successiva non è stata disponibile; le correzioni sono state verificate nella simulazione DOM.

## Da verificare prima della candidatura

- **Estetica reale non verificata:** il browser dell'ambiente ha rifiutato l'anteprima con `ERR_BLOCKED_BY_CLIENT`. Non sono stati prodotti screenshot né eseguiti controlli visuali desktop/mobile. Il controllo CSS non equivale a una prova nel browser.
- Aprire a 320, 390, 768, 1280 e 1440 px; verificare menu, titoli, copertine, diagramma e moduli. Verificare zoom al 200%, tastiera e preferenza movimento ridotto.
- Provare una generazione reale su Vercel e accertare la presenza delle quattro parti PFEV. La guida aggiunta al testo inoltrato non sostituisce un prompt di sistema nel workflow n8n; il suo risultato va verificato sul modello realmente configurato.
- Provare il form risorse con dati di test autorizzati e verificarne il salvataggio in Supabase. Non sono state create righe di test esterne in questa sessione.
- Configurare un limite durevole alle richieste AI e un budget del provider. Il secret protegge il collegamento al webhook, non impedisce l'abuso dell'endpoint pubblico.
- Completare con il titolare i dettagli privacy (tempi di conservazione, configurazioni e responsabilità dei servizi). Il testo del form è una spiegazione operativa, non una certificazione di conformità.
- Non dichiarare automatica la consegna dei materiali: l'attuale flusso registra solo le richieste.

## Provenienza delle immagini e dei font

- `public/books/shift-flow.png`: prima pagina del file Pages SHIFT-FLOW fornito da Luca Guido, convertito in PDF e rasterizzato. La conversione Pages può alterare l'impaginazione rispetto all'originale.
- `public/books/evolve.png`: prima pagina del PDF SHIFT-FLOW EVOLVE fornito dall'autore.
- `public/books/relactions.png`: prima pagina del PDF SHIFT-FLOW RELACTIONS fornito dall'autore.
- Le tre copertine non sono state ridisegnate; rotazione e ombra sono soltanto presentazione CSS.
- Barlow e Barlow Condensed: file scaricati da Google Fonts, licenze SIL OFL incluse accanto ai font. Nessuna richiesta a Google Fonts al caricamento del sito.
- Bodoni Moda: font locale con licenza SIL OFL inclusa. È il nuovo carattere dei titoli; Barlow Condensed è conservato come asset precedente ma non usato dalla pagina.
