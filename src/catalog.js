import { volumes } from './books.js';
// Activate sales only with a final product, price, and working hosted checkout.
// Physical products and subscriptions are intentionally outside this first release.
export const products = [
  ...volumes.map(book => ({ id: book.shopId || book.id, category: 'libro', label: 'Il libro', title: book.name, image: book.image, subtitle: book.line, description: book.description, format: 'Libro · edizione in preparazione', contents: book.ideas, status: 'coming-soon', price: null, checkoutUrl: null })),
  { id: 'planning', category: 'organizzazione', label: 'Organizzazione', title: 'La tua settimana flessibile', subtitle: 'Una direzione, con spazio per cambiare.', description: 'Un set di schede PDF per raccogliere essenziali, attività per energia, priorità mobili e recupero.', format: 'Kit PDF · in progettazione', contents: ['Planning settimanale PFEV', 'Spazio per le priorità mobili', 'Revisione della settimana'], status: 'coming-soon', price: null, checkoutUrl: null },
  { id: 'recupero', category: 'recupero', label: 'Recupero', title: 'Fai spazio al recupero', subtitle: 'Anche fermarsi fa parte del piano.', description: 'Schede PDF per osservare le giornate dopo un turno e costruire piccole routine di recupero.', format: 'Kit PDF · in progettazione', contents: ['Scheda della giornata post-turno', 'Il tuo piano minimo di recupero', 'Promemoria per alleggerire gli impegni'], status: 'coming-soon', price: null, checkoutUrl: null },
  { id: 'energia', category: 'consapevolezza', label: 'Consapevolezza', title: 'Ascolta la tua energia', subtitle: 'Prima osserva. Poi scegli.', description: 'Un diario PDF per riconoscere i tuoi ritmi e scegliere che cosa chiederti nelle diverse giornate.', format: 'Kit PDF · in progettazione', contents: ['Tracker dell’energia', 'Domande di osservazione', 'Una piccola revisione personale'], status: 'coming-soon', price: null, checkoutUrl: null },
];

export const episodes = [
  { id: 'rientro', category: 'recupero', title: 'Rientrare, rallentare', description: 'Una guida per lasciare andare la fretta dopo una giornata intensa e ritrovare un momento per te.', theme: 'Dopo il turno', source: null, transcript: null, duration: null },
  { id: 'sonno', category: 'sonno', title: 'Un momento prima del riposo', description: 'Un accompagnamento tranquillo per passare dagli impegni a uno spazio dedicato al riposo.', theme: 'Verso il riposo', source: null, transcript: null, duration: null },
  { id: 'pausa', category: 'meditazione', title: 'Torna al momento presente', description: 'Una pausa guidata per portare attenzione a quello che senti, senza dover raggiungere un risultato.', theme: 'Meditazione', source: null, transcript: null, duration: null },
];

export function purchaseAvailable(product) {
  return product.status === 'available' && Number.isFinite(product.price) && product.price > 0 && /^https:\/\//.test(product.checkoutUrl || '');
}

export function audioAvailable(episode) {
  return typeof episode.source === 'string' && (/^https:\/\//.test(episode.source) || /^\/(?!\/)/.test(episode.source));
}
