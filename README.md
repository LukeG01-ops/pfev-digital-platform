# PFEV Digital Platform

Piattaforma web sviluppata come progetto personale per digitalizzare il metodo **PFEV – Planning Flessibile a Energia Variabile**.

Il progetto combina frontend, automazioni, database, API, intelligenza artificiale e containerizzazione in un'unica applicazione funzionante e pubblicamente accessibile.

## Live Demo

https://pfev-digital-platform.vercel.app

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
npm install
