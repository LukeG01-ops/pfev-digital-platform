# Shift Flow

Il brand editoriale di Luca Guido: libri, metodo PFEV, strumenti digitali e guide audio dedicati a energia, recupero e organizzazione.

Sito: https://shift-flow-project.vercel.app

## Esperienza

- Home con libro 3D apribile e rotazione controllabile.
- Un primo libro visibile; libreria configurabile senza limite di volumi.
- Indice interattivo del primo Shift Flow, verificato sul PDF 4.3.
- Metodo PFEV in quattro pannelli e selettore illustrativo dell’energia.
- Planner AI con proposta personalizzata, copia e download del piano.
- Suggerimenti di lettura basati sui temi della richiesta e su capitoli verificati.
- Shop filtrabile per libro, organizzazione, recupero e consapevolezza.
- Prodotti digitali in preparazione con schede di dettaglio.
- Sezione podcast e guide audio; player e trascrizione quando una sorgente reale è configurata.
- Presentazione dell’autore, prossime uscite e FAQ.

Lo shop non accetta pagamenti: prezzi, file e checkout non sono ancora configurati. Gli episodi audio e la newsletter sono in preparazione. I kit e i titoli audio presenti sono concept editoriali da finalizzare.

## Crescita del catalogo

`src/books.js` controlla quali libri sono pubblici. Con un solo libro il menu presenta “Il libro”; con più libri compaiono galleria e selettore. Le voci future sono nascoste fino all’attivazione. `src/catalog.js` controlla prodotti digitali, stato delle vendite e audio. I cataloghi sono indipendenti e non impongono una trilogia di tre volumi.

Dettagli operativi: [docs/BRAND-RELEASE.md](docs/BRAND-RELEASE.md).

## Planner AI

Browser → `/api/ai-planner` (Vercel Function) → n8n → OpenAI → piano in JSON.

Il server valida l’input, usa un secret verso n8n, applica timeout e verifica la risposta. Marked converte il Markdown; DOMPurify sanitizza l’HTML prima del rendering. I suggerimenti di lettura vengono scelti separatamente da un catalogo verificato, senza affidare titoli e pagine alla generazione libera. L’abbinamento attuale è per parole chiave. Le pagine restano nascoste finché l’edizione cartacea non è definitiva.

Non inserire credenziali nel frontend. Le due variabili server-only già usate su Vercel sono `N8N_AI_WEBHOOK_URL` e `N8N_AI_WEBHOOK_SECRET`. Per la prova locale, usare `.env.local` da `.env.example`. Senza configurazione il Planner mostra un errore esplicito, senza risultati simulati.

## Sviluppo e verifica

```sh
npm ci
npm run dev
npm run build
npm test
```

I test usano servizi simulati e non scrivono dati esterni. Le verifiche visuali desktop e mobile vanno effettuate nel browser.

## Deploy

Vercel pubblica il ramo `main` del repository collegato. Docker Compose serve il frontend con Nginx sulla porta 8080; quel container statico non esegue la funzione serverless. Per l’API completa usare Vercel o il server di sviluppo.

## Apertura commerciale

Restano da finalizzare copertina, prodotti, prezzi, pagamento e consegna, audio, contatto pubblico e newsletter. L’API pubblica richiede limiti durevoli alle richieste prima dell’uso esteso; la configurazione n8n non è inclusa nel repository. L’informativa sui servizi e i dati elaborati va completata prima del lancio definitivo.
