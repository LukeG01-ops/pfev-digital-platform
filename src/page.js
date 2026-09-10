import { volumes } from "./books.js";
import {
  plannerMarkup,
  resourcesMarkup,
  techMarkup,
} from "./preserved-sections.js";

export function renderPage(icon) {
  return `
  <a class="skip-link" href="#contenuto">Salta al contenuto</a>
  <header class="navbar">
    <a class="brand" href="#" aria-label="Shift Flow — inizio pagina">Shift <span>Flow</span><i aria-hidden="true"></i></a>
    <button class="menu-toggle" aria-label="Apri menu" aria-expanded="false" aria-controls="main-nav">${icon("menu")}</button>
    <nav id="main-nav" aria-label="Navigazione principale"><a href="#libri">La trilogia</a><a href="#metodo">Il metodo</a><a href="#risorse">Le risorse</a><a href="#tech" data-open-tech>Tech project ${icon("plus")}</a></nav>
    <a class="nav-cta" href="#planner-ai">Trova il tuo ritmo ${icon("external")}</a>
    <div class="reading-progress" aria-hidden="true"><span id="readingProgress"></span></div>
  </header>
  <main id="contenuto">
    <section class="hero" id="inizio" aria-labelledby="hero-title" data-volume="0">
      <div class="hero-topline wrap"><span>Una trilogia di Luca Guido</span><span>Energia. Relazioni. Evoluzione.</span></div>
      <div class="hero-grid wrap">
        <div class="hero-copy"><h1 id="hero-title">La vita cambia <br>ritmo.<br><em>Trova il tuo.</em></h1>
          <p class="hero-description">Non hai bisogno di incastrare meglio ogni minuto.<br>Hai bisogno di un modo di organizzarti che tenga conto di te.</p>
          <p class="hero-support">Shift Flow nasce per chi lavora a turni. E per quelle settimane in cui il calendario dice una cosa, ma la tua energia ne dice un’altra.</p>
          <div class="button-row"><a class="button primary" href="#libri">Entra in Shift Flow ${icon("arrow")}</a><a class="text-link" href="#planner-ai">Prova il metodo ${icon("external")}</a></div>
          <div class="hero-index"><span>UN PERCORSO IN TRE LIBRI</span><div class="volume-tabs" role="group" aria-label="Scegli il libro nella hero">${volumes.map((b, i) => `<button data-volume-select="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span>${["Shift Flow", "Relactions", "Evolve"][i]}</button>`).join("")}</div></div>
        </div>
        <div class="book-experience">
          <div class="book-viewer" id="bookViewer" aria-label="Modello interattivo del libro, usa i controlli sotto per ruotarlo o aprirlo">
            <div class="book-halo" aria-hidden="true"></div>
            <div class="book-float"><div class="book-object" id="heroBook">
              <div class="book-back" aria-hidden="true"></div><div class="book-spine" aria-hidden="true"><span id="bookSpine">SHIFT FLOW</span><small>LUCA GUIDO</small></div>
              <div class="book-pages" aria-hidden="true"></div>
              <div class="book-interior" id="bookInterior" aria-hidden="true"><span class="interior-label">IL CUORE DEL LIBRO</span><h2 id="insideTitle">Il tuo ritmo,<br>prima del calendario.</h2><p id="insideCopy">Partire dall’energia che hai. Scegliere l’essenziale. Lasciare spazio al recupero.</p><span class="interior-footer">SHIFT FLOW · LUCA GUIDO</span></div>
              <div class="book-front" id="bookFront"><img id="heroCover" src="/books/shift-flow.png" alt="Copertina originale di Shift Flow" width="816" height="1158" fetchpriority="high"/><div class="cover-back" aria-hidden="true"><span>Shift Flow</span><p>Un metodo che si adatta alla vita.<br>Non il contrario.</p></div></div>
            </div></div>
            <span class="book-ground" aria-hidden="true"></span>
          </div>
          <div class="book-caption" aria-live="polite"><span id="volumeNumber">VOLUME 01 / 03</span><h2 id="volumeTitle">Shift Flow</h2><p id="volumeTheme">Il tuo ritmo, prima del calendario.</p></div>
          <div class="book-controls"><button id="openBook" aria-expanded="false" aria-controls="bookInterior">Apri il libro ${icon("plus")}</button><div class="rotation-control"><label for="bookRotation">Ruota</label><input id="bookRotation" type="range" min="-38" max="28" value="-20" aria-label="Ruota il libro in 3D"/></div><button id="motionToggle" aria-pressed="false" aria-label="Pausa animazioni">Pausa</button></div>
          <p class="viewer-note">Copertina originale · Interno dimostrativo, non estratto integrale</p>
        </div>
      </div>
      <div class="hero-bottom wrap"><p>Non fare di più. <strong>Fai spazio a ciò che conta.</strong></p><a href="#progetto">Il punto di partenza ${icon("arrow", "down")}</a></div>
    </section>

    <section id="progetto" class="section wrap story-section"><div class="story-side"><span class="margin-note">Una domanda cambia tutto.</span><div class="palette-thread" aria-hidden="true"><i></i><i></i><i></i></div></div><div class="story-copy"><h2>E se non fosse il tempo<br>quello che ti manca?</h2><p class="large-copy">Hai un’ora libera. Ma non sempre hai l’energia per riempirla.<br>Un piano che ignora questa differenza finisce per chiederti <em>più di quello che puoi dare.</em></p><div class="story-columns"><p>Shift Flow parte da qui: dal lavoro a turni, dalle giornate che non si assomigliano, dalla fatica di seguire un’organizzazione pensata per qualcun altro.</p><p>Nei libri ho sviluppato il <strong>PFEV — Planning Flessibile a Energia Variabile</strong>. Non una routine perfetta da replicare. Una struttura essenziale da adattare alla settimana che stai vivendo.</p></div></div></section>

    <section id="libri" class="section collection-section"><div class="wrap"><div class="section-heading"><h2>Un percorso.<br><em>Tre movimenti.</em></h2><p>Prima impari ad ascoltare il tuo ritmo.<br>Poi a condividerlo. Infine, a farlo evolvere.<br>Ogni libro aggiunge una prospettiva, senza perdere il filo.</p></div>
      <div class="books-grid">${volumes.map((b, i) => `<article class="book volume-${i}"><div class="book-card-top"><span>VOLUME 0${i + 1}</span><span>${["Il tuo ritmo", "Le tue relazioni", "Il tuo cambiamento"][i]}</span></div><button class="book-stage" data-view-volume="${i}" aria-label="Esplora ${b.name} nel visualizzatore 3D"><img src="/books/${b.image}" alt="Copertina di ${b.name}" width="420" height="594" loading="lazy"/><span class="view-volume">Esplora in 3D ${icon("external")}</span></button><div class="book-copy"><h3>${["Shift Flow", "Shift Flow Relactions", "Shift Flow Evolve"][i]}</h3><p class="book-subtitle">${b.subtitle}</p><p>${b.description}</p><details class="book-details-disclosure"><summary>Dentro il libro ${icon("plus")}</summary><div class="book-details"><strong>${b.focus}</strong><ul>${b.ideas.map((x) => `<li>${x}</li>`).join("")}</ul><p><strong>Nella vita reale.</strong> ${b.example}</p></div></details></div></article>`).join("")}</div>
      <p class="editorial-note">Sinossi dei libri di Luca Guido. Un approccio personale all’organizzazione: non uno strumento clinico e non una promessa di prestazioni.</p>
    </div></section>

    <section id="metodo" class="method-section"><div class="wrap"><div class="section-heading"><h2>Una struttura leggera.<br><em>Per una vita vera.</em></h2><p>Quattro elementi tengono insieme il metodo PFEV. Esplorali: il piano non serve a riempire gli spazi, ma a scegliere come usarli.</p></div><div class="method-layout"><div class="method-tabs" role="group" aria-label="Esplora gli elementi del metodo PFEV">${["La base essenziale", "Attività per energia", "Priorità mobili", "Recupero pianificato"].map((t, i) => `<button data-method="${i}" aria-pressed="${i === 0}" aria-controls="methodDetail"><span>0${i + 1}</span><span class="method-tab-title">${t}</span>${icon("arrow")}</button>`).join("")}</div><div class="method-detail" id="methodDetail" aria-live="polite"><span id="methodNumber" class="method-number" aria-hidden="true">01</span><h3 id="methodTitle">Il minimo che ti sostiene.</h3><p id="methodCopy">Fino a tre cose che tengono in piedi la settimana. Parti da qui, anche quando tutto il resto cambia.</p><div class="method-example"><span>IN PRATICA</span><p id="methodExample">Pasti semplici. Gli impegni davvero necessari. Una base di ordine. Il resto si può ridimensionare.</p></div><p id="methodTakeaway" class="method-takeaway">Una base realistica vale più di una lista perfetta.</p></div></div>
      <div class="energy-practice"><div><h3>E oggi, da dove parti?</h3><p>Scegli un livello e osserva come cambia la proposta.</p></div><div class="segmented" role="group" aria-label="Energia illustrativa di oggi"><button data-energy="low" aria-pressed="false">Bassa</button><button data-energy="medium" aria-pressed="true">Media</button><button data-energy="high" aria-pressed="false">Alta</button></div><div class="energy-answer" aria-live="polite"><span id="energyKind">UN PASSO SOSTENIBILE</span><p id="energyTask">Un’attività concreta. Senza riempire ogni spazio.</p></div><span class="lab-note">Esempio illustrativo, non una misurazione.</span></div>
    </div></section>

    <section class="breathing-section wrap"><span class="breathing-line" aria-hidden="true"></span><p>Il recupero non è il premio<br>per aver fatto abbastanza.<br><em>È parte del piano.</em></p><a class="text-link" href="#planner-ai">Comincia da una settimana ${icon("arrow")}</a></section>
    ${plannerMarkup(icon)}
    ${resourcesMarkup(icon)}

    <section id="candidatura" class="author-section section wrap"><div class="author-signature"><span class="author-monogram" aria-hidden="true">Lg.</span><h2>Prima l’esperienza.<br><em>Poi le parole.<br>Poi il codice.</em></h2></div><div class="author-copy"><h3>Sono Luca Guido.</h3><p>Ho scritto Shift Flow partendo da una domanda molto concreta: come organizzarsi quando il lavoro cambia continuamente il ritmo delle giornate?</p><p>La trilogia è una prima risposta. Questa piattaforma è il passo successivo: trasformare un metodo in uno strumento utilizzabile, collegando contenuti, automazioni e intelligenza artificiale.</p><p>Presento questo progetto a <strong>Jobtech</strong> per il ruolo <strong>Junior Tech Dev — Automation AI</strong>: un percorso in costruzione, con scelte e limiti che puoi esplorare qui sotto.</p><div class="button-row"><a class="button primary" data-open-tech href="#tech">Dentro il progetto ${icon("plus")}</a><a class="text-link" href="#planner">Prova il planner ${icon("arrow")}</a></div></div></section>

    <section id="tech" class="tech-shell wrap"><details id="techDetails" class="tech-disclosure"><summary><div><h2>Tech project</h2><p>Dal metodo al prodotto digitale. Architettura, flussi e scelte tecniche.</p></div><span class="tech-open-label">Esplora ${icon("plus")}</span></summary><div class="tech-reveal">${techMarkup(icon)}</div></details></section>
  </main>
  <footer class="footer wrap"><div class="footer-top"><a class="brand" href="#">Shift <span>Flow</span><i aria-hidden="true"></i></a><p>Il tuo ritmo. Le tue relazioni. La tua evoluzione.</p><a href="#">Torna all’inizio ${icon("arrow", "up")}</a></div><div class="footer-bottom"><span>Un progetto di Luca Guido</span><span>Metodo PFEV · Trilogia Shift Flow</span><a data-open-tech href="#tech">Vedi la struttura ${icon("external")}</a></div></footer>`;
}
