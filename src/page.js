import { volumes } from "./books.js";
import { plannerMarkup } from "./preserved-sections.js";
import { bookMarkup, shopMarkup, audioMarkup, closingMarkup } from './brand-sections.js';

export function renderPage(icon) {
  const bookNavLabel = volumes.length === 1 ? 'Il libro' : 'I libri';
  return `
  <a class="skip-link" href="#contenuto">Salta al contenuto</a>
  <header class="navbar">
    <a class="brand" href="#inizio" aria-label="Shift Flow — inizio pagina">Shift <span>Flow</span><i aria-hidden="true"></i></a>
    <button class="menu-toggle" aria-label="Apri menu" aria-expanded="false" aria-controls="main-nav">${icon("menu")}</button>
    <nav id="main-nav" aria-label="Navigazione principale"><a href="#inizio" aria-current="location">Home</a><a href="#libro">${bookNavLabel}</a><a href="#metodo">Il metodo</a><a href="#planner-ai">Planner AI</a><a href="#shop">Shop</a><a href="#podcast">Podcast</a></nav>
    <button class="account-trigger" id="accountButton" data-member-open aria-haspopup="dialog" aria-controls="memberDialog">Accedi</button>
    <div class="reading-progress" aria-hidden="true"><span id="readingProgress"></span></div>
  </header>
  <main id="contenuto">
    <section class="hero" id="inizio" aria-labelledby="hero-title" data-volume="0">
      <div class="hero-topline wrap"><span>SHIFT FLOW · DI LUCA GUIDO</span><span>Energia. Recupero. Spazio per te.</span></div>
      <div class="hero-grid wrap">
        <div class="hero-copy"><h1 id="hero-title">La vita cambia <br>ritmo.<br><em>Trova il tuo.</em></h1>
          <p class="hero-description">Non hai bisogno di incastrare meglio ogni minuto. Hai bisogno di un modo di organizzarti che tenga conto di te.</p>
          <p class="hero-support">Shift Flow nasce per chi lavora a turni. E per quelle settimane in cui il calendario dice una cosa, ma la tua energia ne dice un’altra.</p>
          <div class="button-row"><a class="button primary" href="#libro">${volumes.length === 1 ? 'Scopri il libro' : 'Esplora i libri'} ${icon("arrow")}</a><a class="text-link" href="#planner-ai">Prova il metodo ${icon("external")}</a></div>
          <div class="hero-index"><span>IL METODO PRENDE FORMA NELLA TUA VITA</span>${volumes.length > 1 ? `<div class="volume-tabs" role="group" aria-label="Scegli un libro">${volumes.map((b,i)=>`<button data-volume-select="${i}" aria-pressed="${i===0}">${b.name}</button>`).join('')}</div>` : '<p class="brand-path">Leggi. Sperimenta. Trova il tuo passo.</p>'}</div>
        </div>
        <div class="book-experience">
          <div class="book-viewer" id="bookViewer" aria-label="Libro interattivo in 3D">
            <div class="book-halo" aria-hidden="true"></div>
            <div class="book-float"><div class="book-object" id="heroBook" role="button" tabindex="0" aria-label="Apri il libro Shift Flow" aria-expanded="false" aria-controls="bookInterior" aria-describedby="bookHint">
              <div class="book-back" aria-hidden="true"></div><div class="book-spine" aria-hidden="true"><span id="bookSpine">SHIFT FLOW</span><small>LUCA GUIDO</small></div>
              <div class="book-pages" aria-hidden="true"></div>
              <div class="book-interior" id="bookInterior" aria-hidden="true"><span class="interior-label">IL CUORE DEL LIBRO</span><h2 id="insideTitle">Il tuo ritmo,<br>prima del calendario.</h2><p id="insideCopy">Partire dall’energia che hai. Scegliere l’essenziale. Lasciare spazio al recupero.</p><span class="interior-footer">SHIFT FLOW · LUCA GUIDO</span></div>
              <div class="book-front" id="bookFront"><img id="heroCover" src="/books/${volumes[0].image}" alt="Copertina di Shift Flow fornita dall’autore" width="940" height="1348" fetchpriority="high"/><div class="cover-back" aria-hidden="true"><span>Shift Flow</span><p>Un metodo che si adatta alla vita.<br>Non il contrario.</p></div></div>
            </div></div>
            <span class="book-ground" aria-hidden="true"></span>
          </div>
          <p id="bookHint" class="book-hint">Tocca o clicca il libro per aprirlo</p>
          <div class="book-caption" aria-live="polite"><span id="volumeNumber">IL LIBRO DA CUI COMINCIARE</span><h2 id="volumeTitle">Shift Flow</h2><p id="volumeTheme">${volumes[0].line}</p></div>
          <div class="book-controls"><div class="rotation-control"><label for="bookRotation">Ruota</label><input id="bookRotation" type="range" min="-38" max="28" value="-20" aria-label="Ruota il libro in 3D"/></div><button id="motionToggle" aria-pressed="false" aria-label="Pausa animazioni">Pausa</button></div>
          <p class="viewer-note">Copertina fornita dall’autore · Interno dimostrativo</p>
        </div>
      </div>
      <div class="hero-bottom wrap"><p>Non fare di più. <strong>Fai spazio a ciò che conta.</strong></p><a href="#progetto">Il punto di partenza ${icon("arrow", "down")}</a></div>
    </section>

    <section id="progetto" class="section wrap story-section"><div class="story-side"><span class="margin-note">Una domanda cambia tutto.</span><div class="palette-thread" aria-hidden="true"><i></i><i></i><i></i></div></div><div class="story-copy"><h2>E se non fosse il tempo<br>quello che ti manca?</h2><p class="large-copy">Hai un’ora libera. Ma non sempre hai l’energia per riempirla.<br>Un piano che ignora questa differenza finisce per chiederti <em>più di quello che puoi dare.</em></p><div class="story-columns"><p>Shift Flow parte da qui: dal lavoro a turni, dalle giornate che non si assomigliano, dalla fatica di seguire un’organizzazione pensata per qualcun altro.</p><p>Il cuore del percorso è il <strong>PFEV — Planning Flessibile a Energia Variabile</strong>: una struttura essenziale da adattare alla settimana che stai vivendo.</p></div></div></section>

    ${bookMarkup(icon)}

    <section id="metodo" class="method-section"><div class="wrap"><div class="section-heading"><h2>Una struttura leggera.<br><em>Per una vita vera.</em></h2><p>Quattro elementi tengono insieme il metodo PFEV. Esplorali: il piano non serve a riempire gli spazi, ma a scegliere come usarli.</p></div><div class="method-layout"><div class="method-tabs" role="group" aria-label="Esplora gli elementi del metodo PFEV">${["La base essenziale", "Attività per energia", "Priorità mobili", "Recupero pianificato"].map((t, i) => `<button data-method="${i}" aria-pressed="${i === 0}" aria-controls="methodDetail"><span>0${i + 1}</span><span class="method-tab-title">${t}</span>${icon("arrow")}</button>`).join("")}</div><div class="method-detail" id="methodDetail" aria-live="polite"><span id="methodNumber" class="method-number" aria-hidden="true">01</span><h3 id="methodTitle">Il minimo che ti sostiene.</h3><p id="methodCopy">Fino a tre cose che tengono in piedi la settimana. Parti da qui, anche quando tutto il resto cambia.</p><div class="method-example"><span>IN PRATICA</span><p id="methodExample">Pasti semplici. Gli impegni davvero necessari. Una base di ordine. Il resto si può ridimensionare.</p></div><p id="methodTakeaway" class="method-takeaway">Una base realistica vale più di una lista perfetta.</p></div></div>
      <div class="energy-practice"><div><h3>E oggi, da dove parti?</h3><p>Scegli un livello e osserva come cambia la proposta.</p></div><div class="segmented" role="group" aria-label="Energia illustrativa di oggi"><button data-energy="low" aria-pressed="false">Bassa</button><button data-energy="medium" aria-pressed="true">Media</button><button data-energy="high" aria-pressed="false">Alta</button></div><div class="energy-answer" aria-live="polite"><span id="energyKind">UN PASSO SOSTENIBILE</span><p id="energyTask">Un’attività concreta. Senza riempire ogni spazio.</p></div><span class="lab-note">Esempio illustrativo, non una misurazione.</span></div>
    </div></section>

    <section class="breathing-section wrap"><span class="breathing-line" aria-hidden="true"></span><p>Il recupero non è il premio<br>per aver fatto abbastanza.<br><em>È parte del piano.</em></p><a class="text-link" href="#planner-ai">Comincia da una settimana ${icon("arrow")}</a></section>
    ${plannerMarkup(icon)}
    ${shopMarkup(icon)}
    ${audioMarkup(icon)}
    ${closingMarkup(icon)}
  </main>
  <footer class="footer wrap"><div class="footer-top"><a class="brand" href="#inizio">Shift <span>Flow</span><i aria-hidden="true"></i></a><p>Energia. Recupero. Spazio per te.</p><a href="#inizio">Torna all’inizio ${icon("arrow", "up")}</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Shift Flow · Luca Guido</span><nav aria-label="Link nel piè di pagina"><a href="#autore">L’autore</a><a href="#novita">Novità</a><a href="#faq">Domande frequenti</a></nav><span>Il tuo ritmo, ogni giorno.</span></div></footer>`;
}
