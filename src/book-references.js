// Titles and printed chapter starts checked against Shift-Flow 4.3.pdf, 12 Oct 2026.
// Expose page numbers only after the print edition (including QR page) is frozen.
export const referenceEdition = { source: 'Shift-Flow 4.3.pdf', showPages: false };
export const chapters = [
  { id: 'cap-1', number: 1, page: 11, title: 'Perché l’organizzazione tradizionale non funziona con i turni', description: 'Routine rigide, senso di colpa e imprevedibilità: riconoscere ciò che rende difficile organizzarsi.', keywords: ['senso di colpa', 'routine perfetta', 'disciplina', 'imprevedibil', 'rigid'] },
  { id: 'cap-2', number: 2, page: 18, title: 'Organizzarsi per energia, non per tempo', description: 'Riconoscere le giornate ad alta, media e bassa energia e scegliere attività coerenti.', keywords: ['energia', 'stanc', 'concentrazione', 'esaurit', 'scaric'] },
  { id: 'cap-3', number: 3, page: 24, title: 'La pianificazione flessibile che funziona davvero', description: 'Distinguere l’essenziale, ridurre le priorità e riorganizzare la settimana.', keywords: ['pianific', 'priorita', 'imprevist', 'organizz', 'programma', 'piano'] },
  { id: 'cap-4', number: 4, page: 29, title: 'Il Planning Flessibile a Energia Variabile (PFEV)', description: 'Costruire il proprio PFEV attraverso le quattro parti del sistema.', keywords: ['pfev', 'essenzial', 'planning', 'settimana'] },
  { id: 'cap-5', number: 5, page: 38, title: 'Sonno, recupero e sopravvivenza mentale', description: 'Il giorno post-turno, le mini-routine e un piano minimo di recupero.', keywords: ['sonno', 'dorm', 'notte', 'nott', 'riposo', 'recuper', 'post-turno', 'ripos', 'rumore mentale', 'insonn'] },
  { id: 'cap-6', number: 6, page: 47, title: 'Vita personale, relazioni e confini quando lavori a turni', description: 'Valutare la disponibilità, comunicare un limite e proteggere lo spazio personale.', keywords: ['relazion', 'confini', 'famigli', 'amici', 'amico', 'coppia', 'partner', 'dire di no', 'disponibil', 'figli'] },
  { id: 'cap-7', number: 7, page: 55, title: 'Il tuo sistema personale: semplice, flessibile, sostenibile', description: 'Riunire energia, essenziale, recupero e confini in un sistema personale minimo.', keywords: ['sistema', 'sostenibil', 'ricominc', 'abitudin', 'progress'] },
  { id: 'cap-8', number: 8, page: 64, title: 'Strumenti pratici e risorse per accompagnarti nel tempo', description: 'Planning, tracker dell’energia e check-list per le giornate difficili.', keywords: ['strument', 'tracker', 'scheda', 'check-list', 'checklist', 'sopravvivenza', 'giornat'] },
];

export function recommendChapters(input) {
  const text = String(input).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return chapters.map(chapter => ({ chapter, score: chapter.keywords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.chapter.number - b.chapter.number)
    .slice(0, 2).map(item => item.chapter.id);
}
