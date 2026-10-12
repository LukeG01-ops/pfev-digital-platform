import './style.css';
import './brand.css';
import { renderPage } from './page.js';
import { setupExperience } from './experience.js';
import { setupBrand, showReadings } from './brand.js';
import { recommendChapters } from './book-references.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const icon = (name, cls = '') => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>',
  };
  return `<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
document.querySelector('#app').innerHTML = renderPage(icon);
setupExperience();
setupBrand();
const menuButton = document.querySelector('.menu-toggle');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Apri menu');
  document.querySelector('#main-nav').classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  document.querySelector('#main-nav').classList.toggle('is-open', open);
});
document.querySelectorAll('#main-nav a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuButton.focus();
  }
});

const examples = {
  turni: 'Lunedì e martedì lavoro 6–14, mercoledì riposo, giovedì e venerdì lavoro 14–22. Dopo il turno del mattino ho poca energia; nel giorno libero ne ho di più. Gli essenziali sono fare la spesa, preparare i pasti e gestire il bucato. Vorrei studiare per un progetto e chiamare un amico. Preferisco poche priorità mobili e pause vere, senza riempire tutti i momenti liberi.',
  studio: 'Lavoro da lunedì a venerdì 9–18. La sera ho energia media ma cala dopo cena. Nel weekend ho una finestra di buona concentrazione al mattino. Vorrei studiare e mantenere il tempo con le persone care. Gli impegni essenziali sono lavoro, spesa e faccende di base. Aiutami a scegliere fino a tre priorità mobili e un recupero realistico.',
  scarica: 'Questa settimana ho poca energia e diversi impegni di lavoro. Non voglio recuperare tutto. Gli essenziali sono rispettare i turni, preparare pasti semplici e tenere in ordine il necessario. Vorrei mantenere un piccolo contatto con un amico. Proponimi una versione minima della settimana, con attività leggere, priorità rinviabili e spazio per fermarmi.',
};
const plannerForm = document.querySelector('#aiPlannerForm');
const plannerInput = document.querySelector('#plannerInput');
const plannerResult = document.querySelector('#plannerResult');
const plannerStatus = document.querySelector('#plannerStatus');
const resultLabel = document.querySelector('#resultLabel');
const generateButton = document.querySelector('#generateButton');
let generatedPlan = '', plannerBusy = false;
const countInput = () => {
  document.querySelector('#inputCount').textContent = `${plannerInput.value.length} / 5000`;
  if (generatedPlan) resultLabel.textContent = 'PIANO PRECEDENTE';
};
plannerInput.addEventListener('input', countInput);
document.querySelectorAll('[data-example]').forEach(b => b.addEventListener('click', () => {
  plannerInput.value = examples[b.dataset.example]; countInput(); plannerInput.focus();
}));
plannerForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (plannerBusy) return;
  const input = plannerInput.value.trim();
  if (input.length < 20 || input.length > 5000) {
    plannerStatus.textContent = 'Aggiungi da 20 a 5.000 caratteri su turni, impegni ed energia.';
    plannerInput.focus(); return;
  }
  plannerBusy = true;
  generateButton.disabled = true;
  plannerInput.readOnly = true;
  document.querySelectorAll('[data-example]').forEach(b => b.disabled = true);
  document.querySelector('#copyStatus').textContent = '';
  generateButton.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sto creando il piano…';
  plannerStatus.textContent = 'Sto preparando una proposta per la tua settimana. Può richiedere alcuni secondi.';
  plannerStatus.classList.remove('error');
  resultLabel.textContent = 'IN ELABORAZIONE';
  plannerResult.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/ai-planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input }), signal: AbortSignal.timeout(35000) });
    if (!response.ok) {
      if (response.status === 503) throw new Error('Il Planner non è disponibile in questa anteprima. Il testo resta qui: puoi riprovare quando il servizio sarà collegato.');
      if (response.status === 429) throw new Error('Troppe richieste in questo momento. Attendi un minuto e riprova.');
      throw new Error('Il piano non è stato completato. Il testo è rimasto intatto: riprova tra poco.');
    }
    const data = await response.json();
    if (typeof data.plan !== 'string' || !data.plan.trim()) throw new Error('La risposta ricevuta non contiene un piano valido. Riprova tra poco.');
    generatedPlan = data.plan;
    plannerResult.innerHTML = DOMPurify.sanitize(marked.parse(data.plan, { breaks: true, gfm: true }), {
      ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','ul','ol','li','blockquote','pre','code','a','hr','table','thead','tbody','tr','th','td'],
      ALLOWED_ATTR: ['href','title','colspan','rowspan','scope'], ALLOW_DATA_ATTR: false,
    });
    plannerResult.classList.add('has-plan');
    plannerResult.setAttribute('tabindex','0');
    plannerResult.setAttribute('role','region');
    plannerResult.setAttribute('aria-label','Piano PFEV generato, contenuto scorrevole');
    document.querySelector('#resultActions').hidden = false;
    showReadings(recommendChapters(input));
    resultLabel.textContent = 'PIANO GENERATO';
    plannerStatus.textContent = 'Il piano è pronto. Rileggilo, adattalo e salvalo se ti è utile.';
  } catch (error) {
    plannerStatus.textContent = error.name === 'TimeoutError' ? 'La risposta sta impiegando troppo tempo. Il testo è rimasto intatto: riprova tra poco.' : error instanceof TypeError ? 'Connessione non riuscita. Controlla la rete e riprova: il testo non è stato cancellato.' : error.message;
    plannerStatus.classList.add('error');
    resultLabel.textContent = generatedPlan ? 'PIANO PRECEDENTE' : 'NON GENERATO';
  } finally {
    plannerBusy = false; generateButton.disabled = false; plannerInput.readOnly = false;
    document.querySelectorAll('[data-example]').forEach(b => b.disabled = false);
    generateButton.innerHTML = `Genera il mio piano ${icon('arrow')}`;
    plannerResult.setAttribute('aria-busy','false');
  }
});
document.querySelector('#copyPlan').addEventListener('click', async () => {
  const status = document.querySelector('#copyStatus');
  try { await navigator.clipboard.writeText(generatedPlan); status.textContent = 'Piano copiato.'; }
  catch { status.textContent = 'Copia non disponibile. Usa Scarica .txt.'; }
});
document.querySelector('#downloadPlan').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([`IL MIO PIANO PFEV\nProposta AI da verificare e adattare.\n\n${generatedPlan}`], { type:'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'il-mio-piano-pfev.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) {
      document.querySelectorAll('#main-nav a').forEach(a => {
        if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current','location');
        else a.removeAttribute('aria-current');
      });
    }});
  }, { rootMargin:'-15% 0px -65% 0px' });
  document.querySelectorAll('#inizio,#libro,#metodo,#planner-ai,#shop,#podcast').forEach(s => observer.observe(s));
}
