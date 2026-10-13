# Shift Flow: base del brand editoriale

La versione pubblica presenta un libro, il metodo, il Planner AI, un catalogo di proposte digitali e uno spazio per guide audio. I volumi non ancora pronti restano fuori dalla pagina. Lo shop e gli audio sono dichiarati in preparazione.

L’anteprima del primo libro usa l’immagine di copertina fornita dall’autore il 12 ottobre 2026 (screenshot delle 19:22), con illustrazione, sottotitoli aggiornati, nome autore e nessun numero di pagina. Il libro si apre e chiude cliccando o toccando l’oggetto; da tastiera funzionano Invio e Spazio. La dicitura visibile e l’etichetta accessibile seguono lo stato di apertura. Il pulsante separato è rimosso.

## Aggiungere libri, anche oltre la trilogia

`src/books.js`: aggiungere una voce a `library` con un ID univoco, `visible`, nome, copertina, descrizione, `line`, `inside`, `ideas` e `shopId`. Soltanto `visible: true` entra nella libreria. Con un libro il menu dice “Il libro”; con più libri dice “I libri” e compaiono galleria e selettore 3D. Nessun limite a tre volumi.

Il catalogo crea una scheda shop per ciascun libro visibile. La sezione con gli otto capitoli riguarda esplicitamente il primo Shift Flow: aggiungere gli indici dei nuovi libri al momento della loro revisione.

## Prodotti digitali

`src/catalog.js`: le proposte PDF sono configurabili separatamente. Prima di attivare le vendite servono file definitivi, prezzo e piattaforma che gestisca pagamento e consegna. `purchaseAvailable` abilita il collegamento solo con stato `available`, prezzo valido e checkout HTTPS. Il catalogo non simula acquisti e non gestisce pagamenti o un carrello proprietario.

Non inserire PDF a pagamento dentro `public/`: sarebbero liberamente scaricabili. Usare la consegna protetta del servizio scelto. Prezzi, termini di vendita e assistenza vanno completati insieme alla piattaforma.

Il 13 ottobre 2026: i tre kit 1.0 sono stati inseriti nel catalogo con contenuti effettivi, formato A4 compilabile e conteggi di 12, 14 e 12 pagine. `status: review` comunica che sono in revisione e mantiene gli acquisti disattivati. Ogni kit ha tre immagini di pagine reali in `public/kits/`: copertina, esempio compilato e una scheda. Nel dialogo sono esplorabili e ingrandibili; non sono i PDF completi.

Il repository GitHub è pubblico. Le copie locali dei file integrali sono in `private-products/`, escluso da Git, dalla cartella statica Vite e dagli upload di deployment tramite `.vercelignore`. I tre PDF 1.1 sono caricati nello store Vercel Blob **privato** `shift-flow-kits-private`, collegato al progetto per produzione e sviluppo. I percorsi sono `kits/v1.1/Shift-Flow-settimana-flessibile.pdf`, `kits/v1.1/Shift-Flow-spazio-al-recupero.pdf` e `kits/v1.1/Shift-Flow-ascolta-la-tua-energia.pdf`. Gli accessi anonimi restituiscono HTTP 403. Nessun endpoint pubblico distribuisce questi file.

Per attivare la vendita serve scegliere/configurare pagamento e autorizzazione della consegna, impostare prezzo e checkout e approvare la revisione editoriale. Il solo caricamento privato non crea un sistema di e-commerce. Non mettere token Blob nel frontend: la futura consegna deve essere autorizzata dal server dopo l'acquisto. `previewAvailable` accetta soltanto immagini locali curate; nessun collegamento pubblico ai file completi. Le credenziali sono gestite da Vercel e restano escluse da Git.

Le copertine 1.1 mantengono stile, font e palette comuni ma hanno disegni vettoriali distinti: percorso flessibile, luna e bussola. Le immagini pubbliche di copertina hanno suffisso `-v1-1` per evitare di mostrare la vecchia versione dalla cache. Le pagine operative interne e i 241 campi restano invariati.

## Pubblicazione del 13 ottobre 2026

Deployment di produzione riuscito tramite CLI sul progetto esistente `luca-fdfc/pfev-digital-platform`, con alias `https://shift-flow-project.vercel.app`. Ultimo deployment verificato: `dpl_J53mVPSLLCcTzkmExq6wNjuBahvh`, stato READY. Il progetto non era collegato a GitHub: un push al repository da solo non pubblica il sito. La CLI è ora collegata al progetto; per aggiornamenti successivi usare un deployment esplicito o concordare il collegamento Git.

16 test superati e build riuscita. Anteprime reali verificate nel browser, anche su mobile, senza overflow orizzontale; acquisti nascosti per i kit in revisione. La copertina del libro usa l'immagine dell'autore. La funzione Planner mantiene la configurazione precedente e risponde HTTP 405 a GET come previsto; non è stata eseguita una nuova generazione AI reale in questa verifica.

## Schede shop - aggiornamento successivo del 13 ottobre

Le quattro schede prodotto si aprono ora da copertina cliccabile o “Esplora”, con link condivisibili `#prodotto/<id>`, analisi editoriale, contenuti, istruzioni, due pagine di anteprima e area prezzo/acquisto. Anche il libro ha una scheda e un estratto reale del capitolo 4; non viene distribuito il manoscritto completo.

L'autore ha confermato che i prezzi non sono ancora decisi e non ha ancora un account di pagamento. Compare “Prezzo da definire”; i pulsanti “Acquista su Amazon” e “Acquista il PDF” sono visibili ma disabilitati. La selezione/attivazione del provider e la consegna autenticata sono ancora da realizzare: l'interfaccia non è un pagamento funzionante. Per il libro serve l'articolo Amazon esatto, non un link di ricerca. Nessun account finanziario o pagamento è stato creato.

21 test superati e build riuscita. Verificati apertura delle quattro schede, chiusura con Escape, link diretti anche dopo ricarica e layout mobile senza overflow. Il collegamento Amazon richiede ASIN nell'URL e dominio autentico; la visualizzazione di un acquisto digitale richiede un checkout noto e la conferma operativa della consegna. Queste regole frontend non sostituiscono l'autorizzazione del download sul server. I passi mancanti e il confronto dei servizi sono documentati in `docs/SHOP-SETUP.md`.

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
