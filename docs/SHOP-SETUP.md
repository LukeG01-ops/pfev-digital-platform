# Shop Shift Flow - schede e attivazione degli acquisti

## Stato al 13 ottobre 2026

Libro e tre kit hanno schede editoriali complete: destinatari, descrizione, contenuti, istruzioni, rapporto con il metodo, limiti, anteprima e area prezzo/acquisto. Si aprono sia da copertina sia da “Esplora”. I collegamenti `#prodotto/libro`, `#prodotto/planning`, `#prodotto/recupero` e `#prodotto/energia` sono condivisibili e funzionano anche aprendo direttamente il sito.

L'autore ha approvato i prezzi di lancio: cartaceo 13,90 EUR, ebook Kindle 7,90 EUR, ciascuno dei tre kit PDF 4,90 EUR. Libro cartaceo ed ebook saranno acquistabili su Amazon nella scheda con scelta del formato; sul sito si vendono solo i kit PDF. I volumi futuri richiedono prezzi approvati separatamente. I pulsanti di acquisto restano disabilitati: manca ancora la pubblicazione Amazon e il checkout digitale con consegna protetta. Non sono stati creati checkout, prodotti o pagamenti reali. I file completi restano nel Blob store privato; solo le anteprime sono pubbliche.

L'autore ha successivamente approvato anche il bundle dei tre kit a 11,90 EUR. Il filtro “Offerte” lo mostra separatamente; è visibile anche in “Tutti”. Nessun prezzo appare nelle card: prezzi, confronto e risparmio compaiono solo nel dettaglio “Esplora”. La cifra barrata del bundle è la somma dei tre acquisti singoli, 14,70 EUR, non un precedente prezzo del bundle; il risparmio è 2,80 EUR, circa 19%. Il confronto è calcolato dai prezzi correnti dei kit. Il bundle contiene gli stessi tre file, non il libro, audio o contenuti esclusivi. Checkout e consegna del bundle non sono ancora implementati e gli acquisti restano disabilitati.

La connessione Stripe è disponibile e la lista account conferma un unico ambiente autorizzato, “Sandbox di ecommerce”, con `livemode: false`. Questo conferma l'accesso all'ambiente di prova, non l'attivazione degli incassi reali né i permessi effettivi su ogni risorsa.

## Libro su Amazon

Nella voce del libro in `src/catalog.js`, `price` è il prezzo cartaceo e `kindlePrice` quello dell'ebook. Sono già impostati gli importi approvati. Aggiungere `amazonUrl` con l'URL effettivo della scheda prodotto, non homepage, ricerca o link inventato. Prima di attivarlo, verificare titolo, autore, edizione e disponibilità dei due formati. Lo stato deve diventare `available` solo quando il libro è pubblicato. Confermare il prezzo finale al cliente nella schermata KDP: per il cartaceo il valore inserito può essere al netto dell'IVA.

Il pulsante è “Acquista su Amazon”. Il sito non incassa questo acquisto e non gestisce la spedizione del libro. Prezzo finale e disponibilità sono confermati su Amazon. Nessun codice affiliato viene aggiunto automaticamente.

## PDF: Stripe scelto, implementazione da completare

Per il progetto che potrà includere anche articoli fisici, l'autore ha scelto **Stripe** e completato l'autorizzazione della sandbox. Il checkout non è ancora implementato: prima di scrivere il relativo codice usare il planner ufficiale della connessione Stripe e confermare i requisiti per il flusso. Checkout ospitato raccoglierà i dati di pagamento su Stripe; il nostro server dovrà gestire l'autorizzazione del download.

L'alternativa valutata, ma non scelta, **Lemon Squeezy** è orientata ai prodotti digitali: gestisce checkout/consegna e opera come merchant of record. Non permette articoli fisici. Non creare account né accettare termini o inserire dati bancari al posto dell'autore.

Fonti ufficiali consultate il 13 ottobre 2026:

- [Stripe Checkout](https://docs.stripe.com/payments/checkout/quickstarts).
- [Tariffe Stripe Italia](https://stripe.com/it/pricing): la tariffa standard per carte standard SEE è 1,5% + 0,25 EUR; altri metodi, tipi di carta e servizi hanno condizioni diverse.
- [Lemon Squeezy: prezzi](https://www.lemonsqueezy.com/pricing): 5% + 50 centesimi USD di base; alcune transazioni hanno costi aggiuntivi. Non è un confronto di servizi identici, perché include funzionalità da merchant of record.
- [Lemon Squeezy: prodotti vietati](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products), inclusi gli articoli fisici.

Prima del lancio commerciale vanno verificati anche condizioni di vendita, privacy, assistenza, impostazione fiscale dell'attività e adeguatezza del piano hosting. Il servizio di pagamento non rende automaticamente completa tutta la conformità dell'attività.

## Requisiti prima di abilitare il checkout digitale

1. Scelta del provider, account attivato dall'autore e prezzi approvati.
2. Configurazione server-only dei prodotti/prezzi del provider; mai fidarsi di importi o percorsi file inviati dal browser.
3. Conferma autenticata del pagamento. Per Stripe: verificare sessione/pagamento e firma del webhook; non concedere un file perché un utente visita una pagina “successo”.
4. Consegna del solo prodotto acquistato, con autorizzazione limitata nel tempo. Per operazioni asincrone, verificare il pagamento effettivo, non il solo completamento del checkout.
5. Flusso di errore/annullamento, ricevuta e supporto. Test in ambiente di prova: pagato, non pagato, firma errata, altro prodotto, link scaduto e tentativo anonimo.
6. Soltanto dopo la verifica, collegare il checkout e rendere il prodotto `available`.

`purchaseAvailable` è una **regola di presentazione del frontend**, non una protezione dei file. Richiede prezzo, stato pubblicato, provider noto, URL di checkout e `deliveryReady: true`; il flag non sostituisce la verifica del pagamento sul server. Non impostarlo prima di aver realizzato e testato la consegna. Gli URL accettati sono checkout Stripe o Lemon Squeezy, non un qualsiasi sito HTTPS.

I pulsanti disabilitati non rappresentano un sistema di pagamento funzionante. Prezzi e provider sono stati approvati; mancano ancora implementazione e test di checkout/consegna autenticata, configurazione fiscale e commerciale, e verifica/attivazione dell'account live da parte dell'autore.
