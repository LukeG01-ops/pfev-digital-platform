import { volumes } from './books.js';
// Activate sales only with a final product, price, and working hosted checkout.
// Physical products and subscriptions are intentionally outside this first release.
export const products = [
  ...volumes.map(book => ({
    id: book.shopId || book.id, category: 'libro', label: 'Il libro', title: book.name,
    image: book.image, subtitle: book.line, description: book.description,
    format: 'Libro cartaceo · ebook Kindle · metodo ed esercizi',
    contents: book.shopId === 'libro' ? ['Otto capitoli: energia, pianificazione, recupero e relazioni', 'Metodo PFEV spiegato e applicato', 'Esempi, esercizi e schede pratiche', 'Appendice, fonti e approfondimenti'] : book.ideas,
    previewPages: book.shopId === 'libro' ? [{image:'/books/shift-flow-cover.png',caption:'La copertina del libro'},{image:'/books/shift-flow-sample-29.png',caption:'Estratto del capitolo 4: il PFEV'},{image:'/books/shift-flow-sample-30.png',caption:'Estratto del capitolo 4: la logica del sistema'}] : (book.previewPages || []),
    purchaseChannel: 'amazon', amazonUrl: null, status: 'coming-soon',
    // Author-approved launch prices. Future volumes require their own approval.
    price: book.shopId === 'libro' ? 13.9 : null,
    kindlePrice: book.shopId === 'libro' ? 7.9 : null,
    checkoutUrl: null,
  })),
  { id: 'planning', category: 'organizzazione', label: 'Organizzazione', title: 'La tua settimana flessibile', subtitle: 'Una direzione, con spazio per cambiare.', description: 'Schede riutilizzabili per scegliere l’essenziale, adattare le attività all’energia e riorganizzarti quando cambia il piano.', format: 'Kit PDF compilabile · A4 · 12 pagine', pages: 12, version: '1.1', contents: ['Due modelli settimanali PFEV', 'Priorità mobili, vincoli e accordi', 'Scheda del giorno e ripartenza dopo un imprevisto', 'Revisione e versione minima'], previewPages: [{image:'/kits/planning-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/planning-example.png',caption:'Un piano che lascia margine: esempio compilato'}, {image:'/kits/planning-sheet.png',caption:'Il PFEV della settimana: una scheda del kit'}], status: 'review', price: 4.9, checkoutUrl: null },
  { id: 'recupero', category: 'recupero', label: 'Sonno e recupero', title: 'Fai spazio al recupero', subtitle: 'Anche fermarsi fa parte del piano.', description: 'Un percorso pratico per proteggere il riposo tra i turni, alleggerire il rientro e osservare il sonno senza inseguire un punteggio.', format: 'Kit PDF compilabile · A4 · 14 pagine', pages: 14, version: '1.1', contents: ['Ambiente e riposo protetto', 'Giornata post-turno e miniroutine di rientro', 'Spazio per lasciare i pensieri su carta', 'Diario del sonno di sette giorni e revisione', 'Fonti e limiti: strumento educativo, non cura dell’insonnia'], previewPages: [{image:'/kits/recupero-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/recupero-example.png',caption:'Una mattina di transizione: esempio compilato'}, {image:'/kits/recupero-sheet.png',caption:'La giornata post-turno: una scheda del kit'}], status: 'review', price: 4.9, checkoutUrl: null },
  { id: 'energia', category: 'consapevolezza', label: 'Consapevolezza', title: 'Ascolta la tua energia', subtitle: 'Prima osserva. Poi scegli.', description: 'Un diario leggero per riconoscere i tuoi segnali, adattare le richieste e provare brevi pause facoltative di attenzione e meditazione.', format: 'Kit PDF compilabile · A4 · 12 pagine', pages: 12, version: '1.1', contents: ['Bussola personale e diario fino a due settimane', 'Attività in tre versioni, secondo l’energia', 'Due pause facoltative: ambiente e respiro naturale', 'Revisione e piccolo esperimento organizzativo', 'Fonti e limiti: pratiche educative, non terapia'], previewPages: [{image:'/kits/energia-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/energia-example.png',caption:'Da un segnale a una scelta: esempio compilato'}, {image:'/kits/energia-sheet.png',caption:'La prima settimana del diario: una scheda del kit'}], status: 'review', price: 4.9, checkoutUrl: null },
];

export const episodes = [
  { id: 'rientro', category: 'recupero', title: 'Rientrare, rallentare', description: 'Una guida per lasciare andare la fretta dopo una giornata intensa e ritrovare un momento per te.', theme: 'Dopo il turno', source: null, transcript: null, duration: null },
  { id: 'sonno', category: 'sonno', title: 'Un momento prima del riposo', description: 'Un accompagnamento tranquillo per passare dagli impegni a uno spazio dedicato al riposo.', theme: 'Verso il riposo', source: null, transcript: null, duration: null },
  { id: 'pausa', category: 'meditazione', title: 'Torna al momento presente', description: 'Una pausa guidata per portare attenzione a quello che senti, senza dover raggiungere un risultato.', theme: 'Meditazione', source: null, transcript: null, duration: null },
];

export function purchaseAvailable(product) {
  if (product.status !== 'available' || !validPrice(product.price)) return false;
  if (product.category === 'libro') return amazonProductUrl(product.amazonUrl);
  return product.deliveryReady === true && digitalCheckoutUrl(product.checkoutUrl, product.purchaseProvider);
}

export function validPrice(price) {
  return Number.isFinite(price) && price > 0 && price <= 10000 &&
    Math.abs(Math.round(price * 100) - price * 100) < 0.000001;
}

export function priceLabel(product) {
  const euros = price => new Intl.NumberFormat('it-IT', {style:'currency',currency:'EUR'}).format(price);
  if (!validPrice(product.price)) return 'Prezzo da definire';
  if (product.category === 'libro' && validPrice(product.kindlePrice)) {
    return `Cartaceo ${euros(product.price)} · Kindle ${euros(product.kindlePrice)}`;
  }
  return euros(product.price);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch { return null; }
}

export function amazonProductUrl(value) {
  const url = safeUrl(value);
  return !!url && /^(?:www\.)?amazon\.(?:it|com|de|fr|es|co\.uk)$/.test(url.hostname) &&
    /\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:\/|$)/i.test(url.pathname);
}

export function digitalCheckoutUrl(value, provider) {
  const url = safeUrl(value);
  if (!url) return false;
  if (provider === 'stripe') return (url.hostname === 'buy.stripe.com' || url.hostname === 'checkout.stripe.com') && url.pathname.length > 1;
  if (provider === 'lemon-squeezy') return /^(?:[a-z0-9-]+\.)?lemonsqueezy\.com$/.test(url.hostname) && /^\/buy\/[a-z0-9-]+$/i.test(url.pathname);
  return false;
}

// Only curated public samples belong here. Full paid PDFs are never linked.
export function previewAvailable(product) {
  return Array.isArray(product.previewPages) && product.previewPages.length > 0 &&
    product.previewPages.every(page => /^\/(?:kits|books)\/[a-z0-9-]+\.png$/.test(page.image) && typeof page.caption === 'string' && page.caption.trim());
}

export function audioAvailable(episode) {
  return typeof episode.source === 'string' && (/^https:\/\//.test(episode.source) || /^\/(?!\/)/.test(episode.source));
}
