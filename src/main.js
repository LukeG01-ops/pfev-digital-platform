import './style.css'

document.querySelector('#app').innerHTML = `
  <header class="navbar">
    <div class="logo">PFEV</div>

    <nav>
      <a href="#progetto">Il progetto</a>
      <a href="#risorse">Risorse</a>
      <a href="#tech">Tech</a>
    </nav>

    <a class="nav-button" href="#risorse">Scopri le risorse</a>
  </header>

  <main>
    <section class="hero">
      <div class="hero-content">
        <span class="badge">PFEV DIGITAL PLATFORM</span>

        <h1>
          Organizza il tuo tempo<br>
          in base alla tua <span>energia.</span>
        </h1>

        <p>
          Una piattaforma digitale dedicata al metodo PFEV:
          strumenti, risorse e automazioni pensate per trasformare
          la pianificazione in qualcosa di realmente sostenibile.
        </p>

        <div class="hero-buttons">
          <a class="primary-button" href="#risorse">
            Esplora le risorse
          </a>

          <a class="secondary-button" href="#tech">
            Scopri il progetto tecnico →
          </a>
        </div>
      </div>

      <div class="hero-card">
        <div class="card-label">PFEV</div>
        <h2>Planning Flessibile a Energia Variabile</h2>
        <p>
          Pianifica ciò che fai partendo dall'energia che hai,
          non da quella che vorresti avere.
        </p>

        <div class="card-status">
          <span class="status-dot"></span>
          Digital Platform
        </div>
      </div>
    </section>

    <section id="progetto" class="section">
      <div class="section-title">
        <span>01</span>
        <div>
          <p>IL PROGETTO</p>
          <h2>Più di un semplice sito.</h2>
        </div>
      </div>

      <div class="features">
        <article>
          <div class="feature-number">01</div>
          <h3>Risorse digitali</h3>
          <p>
            Schede, planner e strumenti collegati ai libri e al metodo PFEV.
          </p>
        </article>

        <article>
          <div class="feature-number">02</div>
          <h3>Automazioni</h3>
          <p>
            Workflow automatici per gestire richieste, dati e distribuzione delle risorse.
          </p>
        </article>

        <article>
          <div class="feature-number">03</div>
          <h3>Intelligenza artificiale</h3>
          <p>
            Funzioni AI progettate per rendere la pianificazione più personale e dinamica.
          </p>
        </article>
      </div>
    </section>

    <section id="risorse" class="section resources-section">
      <div>
        <span class="badge">IN SVILUPPO</span>
        <h2>Le risorse PFEV stanno arrivando.</h2>
        <p>
          La piattaforma verrà progressivamente arricchita con strumenti
          digitali e contenuti dedicati ai lettori.
        </p>
      </div>

      <button id="notifyButton">Avvisami quando saranno disponibili</button>
    </section>

    <section id="tech" class="section tech-section">
      <div class="section-title">
        <span>02</span>
        <div>
          <p>TECH PROJECT</p>
          <h2>Come è costruita la piattaforma.</h2>
        </div>
      </div>

      <div class="tech-stack">
        <span>JavaScript</span>
        <span>REST API</span>
        <span>HTTP</span>
        <span>n8n</span>
        <span>Webhooks</span>
        <span>PostgreSQL</span>
        <span>AI / LLM</span>
        <span>Docker</span>
        <span>Git</span>
      </div>

      <p class="tech-description">
        Questo progetto viene sviluppato come laboratorio pratico per
        sperimentare sviluppo web, API, automazioni, database,
        containerizzazione e integrazioni AI.
      </p>
    </section>
  </main>

  <footer>
    <div class="logo">PFEV</div>
    <p>Digital Platform · Personal Project</p>
  </footer>
`

document.querySelector('#notifyButton').addEventListener('click', () => {
  alert('Presto collegheremo questo pulsante al nostro primo workflow n8n!')
})