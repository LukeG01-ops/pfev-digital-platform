const books = [
  {
    name: "SHIFT-FLOW",
    subtitle: "Il punto di partenza.",
    image: "shift-flow-cover.png",
    class: "base",
    tags: "Turni · Energia · Pianificazione",
    description:
      "Quando i turni cambiano, un’agenda rigida non basta. Il primo libro costruisce un metodo flessibile per organizzare impegni, priorità e recupero a partire dall’energia che hai davvero.",
    focus: "Una struttura, non un’altra tabella da rispettare.",
    ideas: [
      "Tre essenziali per dare una base alla settimana.",
      "Attività distribuite per energia, non solo per orario.",
      "Priorità mobili e recupero già dentro al piano.",
    ],
    example:
      "Dopo un turno impegnativo, mantieni l’essenziale e sposta lo studio a una finestra più favorevole. Adattare il piano fa parte del piano.",
  },
  {
    name: "SHIFT-FLOW EVOLVE",
    subtitle: "Il metodo cresce con te.",
    image: "evolve.png",
    class: "evolve",
    tags: "Cicli · Osservazione · Adattamento",
    description:
      "Una settimana funziona, quella dopo cambia tutto. EVOLVE porta il metodo nel tempo: osservare ciò che cambia, riconoscere i propri cicli e modificare il sistema senza dover ricominciare da zero.",
    focus: "Meno rigidità. Più capacità di correggere la rotta.",
    ideas: [
      "Riconoscere fasi di espansione, stabilità e contrazione.",
      "Usare una breve revisione come feedback, non come giudizio.",
      "Sperimentare un piccolo cambiamento alla volta.",
    ],
    example:
      "Nella revisione settimanale scegli una sola modifica concreta: ridurre un impegno, spostarlo o sospenderlo. Poi osserva se ti aiuta.",
  },
  {
    name: "SHIFT-FLOW RELACTIONS",
    subtitle: "Fare spazio alle persone.",
    image: "relactions.png",
    class: "relations",
    tags: "Relazioni · Confini · Presenza",
    description:
      "I turni non cambiano soltanto il tempo per sé. RELACTIONS estende la pianificazione a coppia, amicizie e famiglia, con una presenza possibile, confini chiari e piccoli gesti di continuità.",
    focus: "La qualità della presenza, senza il peso della perfezione.",
    ideas: [
      "Comunicare disponibilità e limiti in modo concreto.",
      "Preferire piccoli contatti significativi a promesse irrealistiche.",
      "Dare alle relazioni finestre flessibili, non nuove scadenze.",
    ],
    example:
      "Scegli da una a tre persone e un contatto sostenibile: un messaggio, una chiamata breve, un momento condiviso. Lascia flessibile il quando.",
  },
];

// Add any number of volumes here. Only visible entries enter the public library.
export const library = [
  { ...books[0], id: 'shift-flow', name: 'Shift Flow', visible: true, line: 'Organizza la tua vita secondo le tue energie non col calendario', insideTitle: 'Il tuo ritmo, prima del calendario.', inside: 'Partire dall’energia che hai. Scegliere l’essenziale. Lasciare spazio al recupero.', shopId: 'libro' },
  { ...books[2], id: 'relactions', name: 'Shift Flow Relactions', visible: false, line: 'Esserci, senza perderti.', inside: 'Dare spazio alle persone. Comunicare i propri limiti. Scegliere una presenza sostenibile.', shopId: null },
  { ...books[1], id: 'evolve', name: 'Shift Flow Evolve', visible: false, line: 'Cambia il passo. Non perdere il filo.', inside: 'Osservare cosa cambia. Ridimensionare il piano. Crescere attraverso piccoli aggiustamenti.', shopId: null },
];
export const volumes = library.filter(book => book.visible);
export const bookNavLabel = volumes.length === 1 ? 'Il libro' : 'I libri';
