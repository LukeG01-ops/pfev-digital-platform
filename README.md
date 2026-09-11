# Shift Flow

Sito della trilogia Shift Flow di Luca Guido, con un'applicazione del metodo **PFEV – Planning Flessibile a Energia Variabile**. Ordine dei volumi: Shift Flow, Relactions, Evolve.

Il progetto combina frontend, API, automazioni, database e integrazione AI. Questa revisione rinnova la presentazione per la candidatura di Luca Guido a Jobtech, preservando lo stack e i collegamenti esistenti.

## Live Demo

https://shift-flow-project.vercel.app

## Funzionalità principali

- Landing page responsive dedicata al metodo PFEV
- Form per richiedere risorse digitali
- Salvataggio delle richieste in database PostgreSQL tramite Supabase
- Automazioni backend realizzate con n8n
- Generatore AI di piani PFEV personalizzati
- Integrazione con OpenAI API
- Rendering Markdown delle risposte AI
- Sanitizzazione dell'output tramite DOMPurify
- API server-side per proteggere webhook e credenziali
- Containerizzazione dell'applicazione tramite Docker
- Web server Nginx su Alpine Linux
- Configurazione tramite Docker Compose
- Deploy pubblico tramite Vercel

## Architettura

### Generatore AI

Browser  
↓  
Vercel Serverless Function  
↓  
Webhook n8n  
↓  
Controllo secret  
↓  
OpenAI API  
↓  
n8n  
↓  
Risposta al frontend

### Richiesta risorse

Browser  
↓  
Webhook n8n  
↓  
Elaborazione dati  
↓  
PostgreSQL / Supabase

## Tecnologie utilizzate

### Frontend

- HTML5
- CSS3
- JavaScript
- Vite

### Backend e API

- Node.js
- Vercel Functions
- REST API
- JSON
- Webhook
- n8n

### AI

- OpenAI API
- Prompt engineering
- Marked
- DOMPurify

### Database

- PostgreSQL
- Supabase

### DevOps

- Git
- GitHub
- Docker
- Docker Compose
- Nginx
- Alpine Linux
- Vercel

## Sicurezza

Il frontend non comunica direttamente con il workflow AI.

Le richieste passano attraverso una funzione server-side su Vercel, mentre le credenziali e i secret vengono conservati tramite variabili d'ambiente e non vengono inclusi nel repository Git.

L'output generato dall'AI viene inoltre sanitizzato tramite DOMPurify prima di essere inserito nel DOM.

## Avvio locale

Installare le dipendenze:

```bash
npm ci
npm run dev
```

Vite richiede Node `^20.19.0 || >=22.12.0` secondo il pacchetto installato. Questa revisione è stata compilata con Node 24.

Per avviare soltanto l'interfaccia non servono credenziali. Il planner AI risponde con un errore esplicito se il servizio non è configurato; non restituisce risultati finti.

Per usare anche l'API locale, crea un file `.env.local` prendendo come riferimento `.env.example` e configura le due variabili **server-only** già usate su Vercel:

```text
N8N_AI_WEBHOOK_URL
N8N_AI_WEBHOOK_SECRET
```

Non mettere mai il secret in `src/`, in `public/` o in una variabile con prefisso `VITE_`. Non inviarlo in chat e non aggiungerlo a Git. `vite.config.js` adatta lo stesso handler Vercel allo sviluppo locale, senza esporre queste variabili al bundle.

## Compilazione e test

```bash
npm run build
node --test tests/ai-planner.test.js
```

La compilazione genera `dist/`. La suite API usa servizi simulati e non crea richieste reali, email o righe nel database. Il frontend è stato anche sottoposto a una simulazione DOM; i dettagli e i limiti sono in [docs/VERIFICA.md](docs/VERIFICA.md).

## Docker

```bash
docker compose up --build
```

Il frontend è disponibile sulla porta 8080. Il container Nginx serve file statici: **non esegue la funzione Vercel**. Per provare il planner AI completo usa Vercel oppure il server di sviluppo configurato. La configurazione originaria Docker è conservata; l'argomento storico `VITE_AI_WEBHOOK_URL` non viene usato dal frontend.

## Aggiornare il progetto esistente senza collegare GitHub a ChatGPT

1. Fai una copia di sicurezza della tua cartella originale e verifica eventuali modifiche locali non salvate.
2. Dal pacchetto del redesign copia tutti i file della cartella `src/` (inclusi `page.js`, `books.js`, `experience.js` e `preserved-sections.js`), `index.html`, `api/ai-planner.js`, `vite.config.js` e la cartella `public/` nella cartella originale. Conserva `.git`, i tuoi file `.env` e la configurazione Vercel.
3. Copia anche `.env.example`, `tests/`, `docs/`, `PRODUCT.md`, `DESIGN.md` e `.impeccable/design.json` per mantenere istruzioni e test. Per `.gitignore`, aggiungi soltanto le nuove regole se nel frattempo l'hai modificato.
4. Esegui `npm ci`, `npm run dev`, `npm run build` e i test indicati sopra. Verifica l'aspetto nel tuo browser prima di pubblicare.
5. Controlla `git diff` e salva soltanto i file del redesign. Esegui commit e push con il tuo flusso Git abituale; non caricare `.env`, `node_modules` o `dist` nel repository.
6. Se il repository è collegato al progetto Vercel esistente, verifica l'esito della nuova pubblicazione e la presenza delle due variabili server-only nell'ambiente corretto. Non creare un nuovo progetto Vercel senza necessità.

La release editoriale interattiva è pubblicata dal ramo `main`, collegato al progetto Vercel esistente. Le credenziali restano configurate esclusivamente nell'ambiente server-side.

## Contenuti e limiti

- Sinossi di SHIFT-FLOW, EVOLVE e RELACTIONS con le copertine fornite dall'autore. I libri integrali non sono inclusi.
- Libro 3D con copertine originali, rotazione via puntatore o slider, apertura e selettore dei tre volumi. La rilegatura e l'interno sono dimostrativi; non viene promessa un'edizione fisica in vendita.
- Metodo a quattro pannelli interattivi e selettore energia illustrativo, non una misurazione.
- Animazioni con pausa e rispetto della preferenza di movimento ridotto.
- Tech project raccolto in una sezione richiudibile; i link diretti la aprono.
- Le risorse sono in preparazione: il form registra interesse, non consegna ancora materiali.
- Il planner mantiene il contratto del workflow n8n esistente e inoltra soltanto il contesto ripulito. Prompt e comportamento del modello restano responsabilità del workflow server-side.
- Limiti anti-abuso, budget AI e dettagli privacy vanno verificati prima dell'uso pubblico esteso.
- Il controllo visuale desktop/mobile resta da completare: l'anteprima era bloccata nell'ambiente di lavoro. Non considerare la sola compilazione una verifica estetica.
