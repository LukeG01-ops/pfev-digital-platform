# Accesso, bonus del libro e pagamenti — implementazione del 13 ottobre 2026

## Stato effettivo

Implementati nel repository: accesso integrato tramite email/OTP, quattro schede bonus nella sezione Podcast, codice condiviso associato all'account, sconto monouso del 25% su un solo kit (3,68 EUR, arrotondamento al centesimo), checkout ospitato Stripe, conferma tramite webhook firmato, ordini privati e download dei PDF acquistati. Non esiste una pagina o voce di menu “area lettore”.

Non ancora operativi: progetto Supabase remoto, invio email, schema remoto, credenziali server Stripe, endpoint webhook registrato, codice definitivo del libro, registrazioni audio/video e passaggio agli incassi live. I controlli locali usano PostgreSQL PGlite e trasporto Stripe simulato: non sono pagamenti reali né un collaudo end-to-end della sandbox. La configurazione pubblica deve restare chiusa fino a questi passaggi.

## Blocco infrastruttura da risolvere con l'autore

Il catalogo Stripe Projects include Supabase (database, auth, storage). Il preflight ha restituito `BROWSER_AUTH_REQUIRED` / `login_required`: nessuna sessione Stripe Projects con account live collegata. L'autorizzazione del connettore alla sandbox non autorizza automaticamente la CLI Projects.

Il login deve essere completato dall'autore, nel Terminale, dalla cartella di questo progetto:

```sh
npx --yes @stripe/cli projects init --json --yes
```

Seguire l'URL di onboarding e l'URL/codice di verifica restituiti, scegliere l'account Projects e approvare personalmente. Non incollare codici, chiavi o output con credenziali in chat. Non eseguire `stripe login` come scorciatoia. Non riavviare init/preflight dall'agente prima della conferma dell'autore. Non attivare piani a pagamento, accettare termini o collegare dati bancari automaticamente. Il catalogo Free non garantisce assenza di qualsiasi costo futuro o requisiti contrattuali.

## Preparazione Supabase

1. Dopo collegamento e conferma del piano, creare un progetto dedicato e applicare una sola volta `supabase/migrations/001_shift_flow.sql`. È testata localmente, non applicata a un servizio remoto.
2. Attivare conferma email e accesso OTP. Nel template email usare `{{ .Token }}`; il frontend non tratta un magic link come conferma del codice. Configurare SMTP per utenti pubblici, dominio mittente, limiti di invio e protezione anti-abuso; non usare il servizio email dimostrativo per il lancio.
3. Pubblicare informativa privacy, recapito assistenza e le condizioni appropriate prima di raccogliere email. Nessuna iscrizione marketing automatica. Verificare gestione cancellazione account e conservazione dei dati degli ordini prima del lancio: la migrazione iniziale usa cancellazione a cascata.
4. Tabelle e RPC non sono accessibili a `anon` o `authenticated`; soltanto il server con service role. Il server conferma ogni token con `auth.getUser`, richiede `email_confirmed_at` e filtra ogni ordine per proprietario. Non usare un token decodificato o localStorage come autorizzazione.
5. Creare bucket **privato** `shift-flow-bonus`. Nessuna policy pubblica sui contenuti. I media sono firmati dal server per cinque minuti solo dopo verifica del bonus.

## Variabili server Vercel

Non aggiungere segreti a Git, al frontend, a variabili `VITE_*` o alla chat.

| Nome | Scopo |
| --- | --- |
| `SUPABASE_URL` | URL del progetto Supabase |
| `SUPABASE_PUBLIC_KEY` | Chiave publishable pubblica, esposta solo se accesso abilitato |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave amministrativa/secret solo server |
| `MEMBERS_ENABLED` | `true` soltanto dopo schema e OTP collaudati |
| `MEMBERS_PRIVACY_READY` | `true` soltanto dopo informativa e trattamento dati verificati |
| `MEMBERS_PRIVACY_URL` | URL dell'informativa effettivamente pubblicata, sull'origine canonica del sito; mostrato prima dell'invio email |
| `BOOK_CODE_HASH` | SHA-256 del codice definitivo, normalizzato uppercase e trim; mai il codice nel bundle JS |
| `PUBLIC_SITE_ORIGIN` | Origine HTTPS canonica, senza slash finale; default sito Vercel attuale |
| `STRIPE_SECRET_KEY` | Preferire restricted key: scrittura Checkout/PaymentIntents; lettura prezzi, prodotti, sessioni e charge; nessuna gestione Atlas, Connect o payout |
| `STRIPE_WEBHOOK_SECRET` | Segreto dell'endpoint webhook dell'ambiente corrispondente |
| `SHOP_PRICE_IDS` | JSON dei quattro price ID: planning, recupero, energia, bundle |
| `SHOP_PRODUCT_IDS` | JSON dei quattro product ID corrispondenti |
| `BLOB_READ_WRITE_TOKEN` | Token del Blob privato già esistente |
| `SHOP_TEST_TOKEN` | Segreto casuale ≥32 caratteri per test server della sandbox; mai esposto al browser |
| `SHOP_LIVE_ENABLED` | `true` solo dopo collaudo e approvazione dell'autore; mai per le prime prove |
| `SHOP_LEGAL_READY` | `true` solo dopo condizioni, assistenza, fiscalità e hosting commerciale verificati |
| `STRIPE_AUTOMATIC_TAX` | Non attivare finché registrazioni fiscali non sono confermate |
| `TAX_REGISTRATION_CONFIRMED` | Conferma esplicita necessaria se automatic tax viene attivata |
| `BONUS_MEDIA_JSON` | Manifest privato con ID rientro/sonno/pausa/energia: `{ "id": { "path": "v1/nome.mp4", "type": "video/mp4" } }`; pubblicare solo asset realmente prodotti |

Prezzi sandbox già creati e verificati (nessun incasso live):

| Prodotto | Product ID | Price ID | EUR |
| --- | --- | --- | --- |
| planning | prod_shift_flow_planning_v1_1 | price_1UQ7SE9o1uvvdEISeIlEzvOk | 4,90 |
| recupero | prod_shift_flow_recupero_v1_1 | price_1UQ7Tp9o1uvvdEIS3ewcnUEc | 4,90 |
| energia | prod_shift_flow_energia_v1_1 | price_1UQ7To9o1uvvdEISsBqMglfs | 4,90 |
| bundle | prod_shift_flow_bundle_v1_1 | price_1UQ7Tn9o1uvvdEISA0iXcRM5 | 11,90 |

L'importo scontato viene generato con `price_data` **server-side** per il prodotto verificato, non con un codice promozionale Stripe pubblico. Prezzi e flag non dimostrano che gli obblighi fiscali siano assolti. Prima del live confermare IVA/prezzi finali, eventuali registrazioni e impostazioni; non copiare ID test in live.

## Flusso e limiti

- Il codice del libro dà quattro bonus e uno sconto, non certifica un acquisto Amazon. Essendo condiviso può essere divulgato; email diverse sono account diversi. Non promettere una verifica d'acquisto non implementata.
- Cinque tentativi codice ogni 15 minuti per account confermato. Aggiungere rate limiting infrastrutturale/IP e protezioni auth prima del lancio; quello per account non ferma molti account diversi.
- Le RPC bloccano la riga dell'account prima di prenotare lo sconto. Nessun consumo al semplice click. Checkout ripetuti dello stesso ordine usano la stessa idempotency key; un secondo prodotto non può prenotare lo stesso sconto.
- Annullo/ritorno al sito non prova che Stripe abbia annullato il pagamento. La prenotazione si libera dopo scadenza o fallimento **verificati**; per riaverla subito prima della scadenza si può implementare successivamente un annullamento esplicito della sessione. Non liberarla solo perché è passato del tempo: pagamenti asincroni potrebbero riuscire dopo.
- Il webhook riceve `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created` all'URL `/api/shop?action=webhook`. Verifica firma, ambiente, proprietario, ordine, prodotto, quantità e totale. Concede il download soltanto quando il pagamento è `paid`. Eventi ripetuti non consumano due volte lo sconto.
- Un rimborso totale o una contestazione revoca i file dell'ordine. Rimborsi parziali non sono interpretati come revoca automatica. Lo sconto già utilizzato non viene automaticamente ricreato; i bonus del libro sono indipendenti dall'ordine.
- URL di successo è `/#ordine/UUID`: richiede l'account proprietario e una verifica server, non concede privilegi da solo.
- I PDF restano nel Blob privato. Download attraverso risposta autenticata, senza URL Blob pubblici. File massimo 4 MB per questa implementazione. I video non passano dalla funzione Vercel: riproduzione tramite URL breve del bucket privato, per consentire streaming/range. Nessuna registrazione prodotta in questa fase.

## Collaudo richiesto prima degli incassi

`npm test` e `npm run build` verificano codice, database locale, webhook con firma SDK reale e trasporto simulato, prezzi, proprietà degli ordini, file, stati e RLS. Eseguire successivamente un vero acquisto sandbox (mai carte reali), consegna dei tre file del bundle e di ciascun singolo, OTP su casella controllata dall'autore, webhook reale, pagamento asincrono, annullo/scadenza, richiesta anonima e di altro account, replay webhook, rimborso totale e contestazione.

Il codice e il trafiletto per il libro vengono definiti **dopo** il collaudo; il QR solo dopo completamento del sito e scelta dell'URL stabile. Non modificare ancora il PDF del libro.

Riferimenti ufficiali: [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment), [gestione chiavi](https://docs.stripe.com/keys-best-practices), [Supabase OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [verifica server getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
