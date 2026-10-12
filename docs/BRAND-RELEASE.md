# Shift Flow: base del brand editoriale

La versione pubblica presenta un libro, il metodo, il Planner AI, un catalogo di proposte digitali e uno spazio per guide audio. I volumi non ancora pronti restano fuori dalla pagina. Lo shop e gli audio sono dichiarati in preparazione.

L’anteprima del primo libro usa la prima pagina del PDF 4.3 fornito dall’autore, rasterizzata senza modificare il manoscritto: titolo e sottotitoli aggiornati, nome autore e nessun numero di pagina. Il PDF contiene un frontespizio senza illustrazione, da sostituire con la copertina definitiva quando sarà pronta. Il libro si apre e chiude cliccando o toccando l’oggetto; da tastiera funzionano Invio e Spazio. La dicitura visibile e l’etichetta accessibile seguono lo stato di apertura. Il pulsante separato è rimosso.

## Aggiungere libri, anche oltre la trilogia

`src/books.js`: aggiungere una voce a `library` con un ID univoco, `visible`, nome, copertina, descrizione, `line`, `inside`, `ideas` e `shopId`. Soltanto `visible: true` entra nella libreria. Con un libro il menu dice “Il libro”; con più libri dice “I libri” e compaiono galleria e selettore 3D. Nessun limite a tre volumi.

Il catalogo crea una scheda shop per ciascun libro visibile. La sezione con gli otto capitoli riguarda esplicitamente il primo Shift Flow: aggiungere gli indici dei nuovi libri al momento della loro revisione.

## Prodotti digitali

`src/catalog.js`: le proposte PDF sono configurabili separatamente. Prima di attivare le vendite servono file definitivi, prezzo e piattaforma che gestisca pagamento e consegna. `purchaseAvailable` abilita il collegamento solo con stato `available`, prezzo valido e checkout HTTPS. Il catalogo non simula acquisti e non gestisce pagamenti o un carrello proprietario.

Non inserire PDF a pagamento dentro `public/`: sarebbero liberamente scaricabili. Usare la consegna protetta del servizio scelto. Prezzi, termini di vendita e assistenza vanno completati insieme alla piattaforma.

## Audio

Le voci di `episodes` possono essere aumentate senza riscrivere la pagina. `source: null` mostra la descrizione in preparazione. Con una sorgente reale pubblica HTTPS o un percorso locale compaiono player e trascrizione opzionale; `preload="none"` evita download anticipati. Una guida in riproduzione mette in pausa le altre.

Una sorgente pubblica è adatta solo agli episodi gratuiti. Non usare URL pubblici per un futuro abbonamento: serviranno autenticazione e controllo dell’accesso prima di consegnare i file. Nessuna scelta di abbonamento è già attiva.

## Suggerimenti del Planner

La richiesta a `/api/ai-planner` e il contratto n8n sono conservati. Dopo un piano riuscito, un abbinamento locale per parole chiave propone al massimo due capitoli verificati. Non è una ricerca semantica AI del manoscritto. Non modifica il prompt o il modello esterno.

`src/book-references.js` contiene titoli e pagine di partenza verificati su Shift-Flow 4.3.pdf. I numeri di pagina sono nascosti finché l’edizione con il QR non è definitiva; `referenceEdition.showPages` li rende visibili dopo una nuova verifica. Un testo senza corrispondenze non produce riferimenti inventati.

## Newsletter e servizi

Il vecchio form per le risorse e il suo webhook sono rimossi dal frontend. Nessun nuovo contatto viene raccolto. La newsletter resta “disponibile prossimamente” finché non sono scelti email pubblica, servizio di invio, conferma dell’iscrizione e disiscrizione.

Il Planner usa le variabili server-only `N8N_AI_WEBHOOK_URL` e `N8N_AI_WEBHOOK_SECRET` già configurate su Vercel. Nell’anteprima locale, senza queste variabili, mostra un errore recuperabile. Prima dell’apertura commerciale estesa restano da completare informativa sui servizi, contatto pubblico e limiti durevoli delle richieste AI.

## Verifica

Il 12 ottobre 2026: compilazione riuscita, 14 test passati, audit delle dipendenze senza vulnerabilità segnalate. La nuova suite verifica riferimenti, assenza di riferimenti inventati, acquisti non attivabili per prodotti incompleti, sorgenti audio e crescita a quattro volumi.

Anteprima verificata nel browser a 1280, 768, 390 e 320 px: nessuno scorrimento orizzontale indesiderato, menu mobile funzionante, filtri e dialogo prodotto corretti, nessun collegamento interno senza destinazione, nessun errore JavaScript osservato. Senza credenziali locali il Planner mostra correttamente un errore recuperabile; la generazione reale richiede l’ambiente Vercel configurato. Non sono stati inviati contatti o creati dati di vendita.
