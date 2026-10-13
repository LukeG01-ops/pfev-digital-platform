// Editorial descriptions of the real products. No clinical or outcome promises.
const details = {
  libro: {
    audience: 'Per chi lavora a turni e sente che le giornate libere non coincidono sempre con le energie disponibili.',
    overview: 'Shift Flow è il punto di partenza del percorso: non un’agenda da seguire alla lettera, ma un metodo per scegliere cosa chiederti nelle giornate che cambiano ritmo. Spiegazioni, esempi ed esercizi accompagnano il lettore dalla consapevolezza dell’energia alla costruzione del proprio sistema.',
    benefits: ['Distinguere il tempo disponibile dall’energia che hai davvero.', 'Costruire il PFEV: essenziale, attività per energia, priorità mobili e recupero.', 'Fare spazio al riposo e comunicare confini realistici.', 'Scegliere pochi strumenti, senza trasformarli in altri obblighi.'],
    steps: ['Leggi i capitoli seguendo il percorso, senza dover applicare tutto subito.', 'Prova gli esercizi e costruisci una prima versione del PFEV.', 'Torna alle schede e all’appendice quando cambia la tua settimana.'],
    relation: 'Il libro contiene già il metodo e gli esercizi. I kit digitali sono facoltativi: aggiungono schede pronte da ristampare o compilare al computer, non passaggi necessari per completare il percorso.',
    limitation: 'Un metodo di organizzazione personale, non una terapia per problemi di sonno o altre condizioni di salute.',
    delivery: 'L’acquisto sarà effettuato su Amazon. Formato, disponibilità, prezzo finale e spedizione saranno quelli indicati nella scheda Amazon del libro.',
  },
  planning: {
    audience: 'Per quando i turni cambiano, le priorità si accumulano o hai bisogno di una base semplice da cui ripartire.',
    overview: 'Questo kit trasforma le quattro parti del PFEV in schede riutilizzabili. Non assegna attività a ogni ora: ti aiuta a riconoscere il necessario, preparare versioni più leggere e rivedere il piano quando arriva un imprevisto.',
    benefits: ['Preparare una base settimanale, senza riempire ogni spazio.', 'Distinguere le scadenze reali dalle priorità che possono muoversi.', 'Ridurre una richiesta o concordare un aiuto concreto.', 'Rivedere le scelte della settimana senza darti un voto.'],
    steps: ['Guarda l’esempio compilato e scegli fino a tre essenziali.', 'Compila un modello settimanale. Usa le altre schede soltanto quando servono.', 'A fine settimana conserva ciò che ti alleggerisce e modifica una sola scelta.'],
    relation: 'Applica soprattutto i capitoli 3 e 4 di Shift Flow e riprende confini, sistema personale e strumenti dei capitoli successivi. Non sostituisce il libro: rende più comodo riutilizzare il metodo.',
    limitation: 'Non è un calendario rigido né uno strumento per valutare l’idoneità alla guida o al lavoro.',
    delivery: 'Un PDF di 12 pagine in A4, con campi compilabili. Puoi salvarne una copia e stampare soltanto le schede che ti servono.',
  },
  recupero: {
    audience: 'Per chi vuole alleggerire il rientro dal turno e proteggere uno spazio di riposo dagli impegni e dalle interruzioni evitabili.',
    overview: 'Il kit si concentra sul contesto del recupero: ambiente, accordi con chi vive con te, giornata post-turno e piccoli gesti di rientro. Il diario di sette giorni distingue il tempo a letto dal sonno stimato, senza trasformarlo in un punteggio.',
    benefits: ['Riconoscere un ostacolo pratico al riposo e scegliere da dove partire.', 'Preparare una giornata di transizione più leggera.', 'Costruire una miniroutine semplice, non un rituale obbligatorio.', 'Osservare una settimana e portare descrizioni più chiare a un professionista, se serve.'],
    steps: ['Parti dall’esempio e scegli un solo ostacolo concreto.', 'Prepara la scheda post-turno; il diario è facoltativo.', 'Rileggi le osservazioni e prova un piccolo cambiamento organizzativo.'],
    relation: 'Accompagna i temi di sonno e recupero del capitolo 5, i confini del capitolo 6 e le miniroutine del capitolo 8.',
    limitation: 'Non cura l’insonnia e non prescrive orari, restrizione del sonno, farmaci o integratori. Difficoltà persistenti o importanti richiedono una valutazione sanitaria.',
    delivery: 'Un PDF di 14 pagine in A4, con campi compilabili, diario di sette giorni, esempi e fonti. Stampabile oppure utilizzabile in un lettore PDF compatibile.',
  },
  energia: {
    audience: 'Per chi vuole capire meglio i propri segnali prima di decidere cosa chiedersi durante la giornata.',
    overview: 'Un diario leggero collega i segnali personali alle scelte concrete. Include una bussola dell’energia, fino a due settimane facoltative di osservazione e attività in tre versioni. Due brevi pause di attenzione invitano a sperimentare senza dover ottenere un risultato.',
    benefits: ['Dare un significato personale ad alta, media e bassa energia.', 'Osservare segnali e contesto, senza competere sui punteggi.', 'Preparare versioni più gestibili delle attività.', 'Scegliere se provare, accorciare o saltare una pausa di attenzione.'],
    steps: ['Compila la bussola con segnali che conosci già.', 'Osserva una settimana; continua per una seconda solo se ti è utile.', 'Rileggi le note e scegli una piccola modifica organizzativa reversibile.'],
    relation: 'Riprende la bussola dell’energia del capitolo 2, le attività per energia del capitolo 4 e gli strumenti personali dei capitoli 7 e 8.',
    limitation: 'Il diario non è una scala clinica. Le pause sono facoltative, interrompibili e non sostituiscono cure; non vanno praticate mentre guidi o devi vigilare.',
    delivery: 'Un PDF di 12 pagine in A4, con campi compilabili, diario, matrice delle attività, pratiche scritte e fonti. Non contiene registrazioni audio.',
  },
};

export function detailsFor(product) {
  return details[product.id] || {
    audience: 'Per continuare il percorso Shift Flow.', overview: product.description,
    benefits: product.contents, steps: [], relation: 'Un nuovo strumento nel percorso Shift Flow.',
    limitation: 'Strumento educativo di organizzazione personale.', delivery: product.format,
  };
}

export function productHash(id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid product id');
  return `#prodotto/${id}`;
}

export function productIdFromHash(hash) {
  return /^#prodotto\/([a-z0-9-]+)$/.exec(hash)?.[1] || null;
}
