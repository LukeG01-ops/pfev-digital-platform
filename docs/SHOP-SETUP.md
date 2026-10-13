# Shop Shift Flow - schede e attivazione degli acquisti

## Stato al 13 ottobre 2026

Libro e tre kit hanno schede editoriali complete: destinatari, descrizione, contenuti, istruzioni, rapporto con il metodo, limiti, anteprima e area prezzo/acquisto. Si aprono sia da copertina sia da “Esplora”. I collegamenti `#prodotto/libro`, `#prodotto/planning`, `#prodotto/recupero` e `#prodotto/energia` sono condivisibili e funzionano anche aprendo direttamente il sito.

I prezzi non sono stati ancora decisi dall'autore. Nessun importo è inventato: compare “Prezzo da definire”. Non esiste ancora un account di pagamento scelto/attivato. I pulsanti di acquisto sono visibili ma disabilitati, con spiegazione. Non sono stati creati checkout, prodotti o pagamenti reali. I file completi restano nel Blob store privato; solo le anteprime sono pubbliche.

## Libro su Amazon

Nella voce del libro in `src/catalog.js`, impostare il prezzo approvato dall'autore e `amazonUrl` con l'URL effettivo della scheda prodotto, non homepage, ricerca o link inventato. Prima di attivarlo, verificare titolo, autore, edizione e formato dell'articolo. Lo stato deve diventare `available` solo quando il libro è pubblicato.

Il pulsante è “Acquista su Amazon”. Il sito non incassa questo acquisto e non gestisce la spedizione del libro. Prezzo finale e disponibilità sono confermati su Amazon. Nessun codice affiliato viene aggiunto automaticamente.

## PDF: scelta del servizio ancora necessaria

Per il progetto che potrà includere anche articoli fisici, la proposta è **Stripe Checkout**, ma non è stata assunta una scelta dell'autore e non è stata attivata un'integrazione finanziaria. Checkout ospitato raccoglie i dati di pagamento su Stripe; il nostro server deve gestire l'autorizzazione del download.

L'alternativa **Lemon Squeezy** è orientata ai prodotti digitali: gestisce checkout/consegna e opera come merchant of record. Non permette articoli fisici. La scelta deve precedere onboarding e implementazione specifica. Non creare account né accettare termini o inserire dati bancari al posto dell'autore.

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

I pulsanti disabilitati non rappresentano un sistema di pagamento funzionante. L'attivazione è esplicitamente bloccata da prezzi, scelta/account del provider e consegna autenticata ancora mancanti.
