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
    <span class="badge">ACCESSO ANTICIPATO</span>
    <h2>Ricevi le risorse PFEV.</h2>

    <p>
      Lascia i tuoi dati per essere avvisato quando il planner
      e le nuove risorse digitali saranno disponibili.
    </p>
  </div>

  <form id="resourceForm" class="resource-form">

    <input
      id="name"
      name="name"
      type="text"
      placeholder="Il tuo nome"
      required
    >

    <input
      id="email"
      name="email"
      type="email"
      placeholder="La tua email"
      required
    >

    <button type="submit">
      Avvisami
    </button>

    <p id="formMessage"></p>

  </form>
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

const form = document.querySelector('#resourceForm')
const message = document.querySelector('#formMessage')

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const name = document.querySelector('#name').value
  const email = document.querySelector('#email').value

  message.textContent = 'Invio in corso...'

  try {
    const response = await fetch(
      'https://lukeg01.app.n8n.cloud/webhook/pfev-resource-request',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          name,
          email,
          resource: 'planner-pfev',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    message.textContent = 'Richiesta inviata con successo ✓'

    form.reset()

  } catch (error) {
    console.error(error)

    message.textContent =
      'Si è verificato un errore. Riprova tra poco.'
  }
})