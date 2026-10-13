import { volumes } from './books.js';
// Activate sales only with a final product, price, and working hosted checkout.
// Physical products and subscriptions are intentionally outside this first release.
export const products = [
  ...volumes.map(book => ({ id: book.shopId || book.id, category: 'libro', label: 'Il libro', title: book.name, image: book.image, subtitle: book.line, description: book.description, format: 'Libro · edizione in preparazione', contents: book.ideas, status: 'coming-soon', price: null, checkoutUrl: null })),
  { id: 'planning', category: 'organizzazione', label: 'Organizzazione', title: 'La tua settimana flessibile', subtitle: 'Una direzione, con spazio per cambiare.', description: 'Schede riutilizzabili per scegliere l’essenziale, adattare le attività all’energia e riorganizzarti quando cambia il piano.', format: 'Kit PDF compilabile · A4 · 12 pagine', pages: 12, version: '1.1', contents: ['Due modelli settimanali PFEV', 'Priorità mobili, vincoli e accordi', 'Scheda del giorno e ripartenza dopo un imprevisto', 'Revisione e versione minima'], previewPages: [{image:'/kits/planning-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/planning-example.png',caption:'Un piano che lascia margine: esempio compilato'}, {image:'/kits/planning-sheet.png',caption:'Il PFEV della settimana: una scheda del kit'}], status: 'review', price: null, checkoutUrl: null },
  { id: 'recupero', category: 'recupero', label: 'Sonno e recupero', title: 'Fai spazio al recupero', subtitle: 'Anche fermarsi fa parte del piano.', description: 'Un percorso pratico per proteggere il riposo tra i turni, alleggerire il rientro e osservare il sonno senza inseguire un punteggio.', format: 'Kit PDF compilabile · A4 · 14 pagine', pages: 14, version: '1.1', contents: ['Ambiente e riposo protetto', 'Giornata post-turno e miniroutine di rientro', 'Spazio per lasciare i pensieri su carta', 'Diario del sonno di sette giorni e revisione', 'Fonti e limiti: strumento educativo, non cura dell’insonnia'], previewPages: [{image:'/kits/recupero-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/recupero-example.png',caption:'Una mattina di transizione: esempio compilato'}, {image:'/kits/recupero-sheet.png',caption:'La giornata post-turno: una scheda del kit'}], status: 'review', price: null, checkoutUrl: null },
  { id: 'energia', category: 'consapevolezza', label: 'Consapevolezza', title: 'Ascolta la tua energia', subtitle: 'Prima osserva. Poi scegli.', description: 'Un diario leggero per riconoscere i tuoi segnali, adattare le richieste e provare brevi pause facoltative di attenzione e meditazione.', format: 'Kit PDF compilabile · A4 · 12 pagine', pages: 12, version: '1.1', contents: ['Bussola personale e diario fino a due settimane', 'Attività in tre versioni, secondo l’energia', 'Due pause facoltative: ambiente e respiro naturale', 'Revisione e piccolo esperimento organizzativo', 'Fonti e limiti: pratiche educative, non terapia'], previewPages: [{image:'/kits/energia-cover-v1-1.png',caption:'La copertina del kit'}, {image:'/kits/energia-example.png',caption:'Da un segnale a una scelta: esempio compilato'}, {image:'/kits/energia-sheet.png',caption:'La prima settimana del diario: una scheda del kit'}], status: 'review', price: null, checkoutUrl: null },
];

export const episodes = [
  { id: 'rientro', category: 'recupero', title: 'Rientrare, rallentare', description: 'Una guida per lasciare andare la fretta dopo una giornata intensa e ritrovare un momento per te.', theme: 'Dopo il turno', source: null, transcript: null, duration: null },
  { id: 'sonno', category: 'sonno', title: 'Un momento prima del riposo', description: 'Un accompagnamento tranquillo per passare dagli impegni a uno spazio dedicato al riposo.', theme: 'Verso il riposo', source: null, transcript: null, duration: null },
  { id: 'pausa', category: 'meditazione', title: 'Torna al momento presente', description: 'Una pausa guidata per portare attenzione a quello che senti, senza dover raggiungere un risultato.', theme: 'Meditazione', source: null, transcript: null, duration: null },
];

export function purchaseAvailable(product) {
  return product.status === 'available' && Number.isFinite(product.price) && product.price > 0 && /^https:\/\//.test(product.checkoutUrl || '');
}

// Only curated public samples belong here. Full paid PDFs are never linked.
export function previewAvailable(product) {
  return Array.isArray(product.previewPages) && product.previewPages.length > 0 &&
    product.previewPages.every(page => /^\/kits\/[a-z0-9-]+\.png$/.test(page.image) && typeof page.caption === 'string' && page.caption.trim());
}

export function audioAvailable(episode) {
  return typeof episode.source === 'string' && (/^https:\/\//.test(episode.source) || /^\/(?!\/)/.test(episode.source));
}
