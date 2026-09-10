import { volumes } from "./books.js";

export function setupExperience() {
  const hero = document.querySelector(".hero");
  const book = document.querySelector("#heroBook");
  const viewer = document.querySelector("#bookViewer");
  const cover = document.querySelector("#heroCover");
  const rotation = document.querySelector("#bookRotation");
  const openButton = document.querySelector("#openBook");
  const interior = document.querySelector("#bookInterior");
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let open = false,
    paused = Boolean(reduced?.matches),
    frame = 0;
  const themes = [
    {
      title: "Shift Flow",
      line: "Il tuo ritmo, prima del calendario.",
      inside:
        "Partire dall’energia che hai. Scegliere l’essenziale. Lasciare spazio al recupero.",
    },
    {
      title: "Shift Flow Relactions",
      line: "Esserci, senza perderti.",
      inside:
        "Dare spazio alle persone. Comunicare i propri limiti. Scegliere una presenza sostenibile, senza rincorrere quella perfetta.",
    },
    {
      title: "Shift Flow Evolve",
      line: "Cambia il passo. Non perdere il filo.",
      inside:
        "Osservare cosa cambia. Ridimensionare il piano. Crescere attraverso piccoli aggiustamenti, senza ricominciare ogni volta.",
    },
  ];
  function setOpen(value) {
    open = value;
    book.classList.toggle("is-open", open);
    viewer.classList.toggle("is-open", open);
    openButton.setAttribute("aria-expanded", String(open));
    openButton.firstChild.textContent = open
      ? "Chiudi il libro "
      : "Apri il libro ";
    interior.setAttribute("aria-hidden", String(!open));
    cover.setAttribute("aria-hidden", String(open));
  }
  function selectVolume(index) {
    const v = volumes[index],
      t = themes[index];
    if (!v) return;
    setOpen(false);
    hero.dataset.volume = String(index);
    cover.src = new URL(`/books/${v.image}`, location.href).href;
    cover.alt = `Copertina originale di ${v.name}`;
    document.querySelector("#bookSpine").textContent = v.name;
    document.querySelector("#volumeNumber").textContent =
      `VOLUME 0${index + 1} / 03`;
    document.querySelector("#volumeTitle").textContent = t.title;
    document.querySelector("#volumeTheme").textContent = t.line;
    document.querySelector("#insideTitle").textContent = t.line;
    document.querySelector("#insideCopy").textContent = t.inside;
    document
      .querySelectorAll("[data-volume-select]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(Number(b.dataset.volumeSelect) === index),
        ),
      );
    if (!paused && typeof book.animate === "function")
      book.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: 550,
        easing: "ease-out",
      });
  }
  document
    .querySelectorAll("[data-volume-select]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        selectVolume(Number(b.dataset.volumeSelect)),
      ),
    );
  document.querySelectorAll("[data-view-volume]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = Number(b.dataset.viewVolume);
      selectVolume(i);
      hero.scrollIntoView({ behavior: paused ? "instant" : "smooth" });
      document
        .querySelector(`[data-volume-select="${i}"]`)
        .focus({ preventScroll: true });
    }),
  );
  openButton.addEventListener("click", () => setOpen(!open));
  rotation.addEventListener("input", () => {
    book.style.setProperty("--book-ry", `${rotation.value}deg`);
    book.style.setProperty("--book-rx", "-5deg");
  });
  viewer.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || paused || open) return;
    const box = viewer.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5,
      y = (event.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      book.style.setProperty(
        "--book-ry",
        `${Number(rotation.value) + x * 19}deg`,
      );
      book.style.setProperty("--book-rx", `${-5 - y * 12}deg`);
    });
  });
  viewer.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    book.style.setProperty("--book-ry", `${rotation.value}deg`);
    book.style.setProperty("--book-rx", "-5deg");
  });
  const motionButton = document.querySelector("#motionToggle");
  function setPaused(value) {
    paused = value || Boolean(reduced?.matches);
    document.documentElement.classList.toggle("motion-paused", paused);
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.textContent = paused ? "Riprendi" : "Pausa";
    motionButton.setAttribute(
      "aria-label",
      paused ? "Riprendi animazioni" : "Pausa animazioni",
    );
    motionButton.disabled = Boolean(reduced?.matches);
    if (reduced?.matches) {
      motionButton.textContent = "Movimento ridotto";
      motionButton.setAttribute(
        "aria-label",
        "Animazioni disattivate dalle preferenze del dispositivo",
      );
    }
  }
  setPaused(paused);
  motionButton.addEventListener("click", () => setPaused(!paused));
  reduced?.addEventListener("change", (e) => setPaused(e.matches));

  const methodData = [
    [
      "Il minimo che ti sostiene.",
      "Fino a tre cose che tengono in piedi la settimana. Parti da qui, anche quando tutto il resto cambia.",
      "Pasti semplici. Gli impegni davvero necessari. Una base di ordine. Il resto si può ridimensionare.",
      "Una base realistica vale più di una lista perfetta.",
    ],
    [
      "Non tutte le ore sono uguali.",
      "Un’attività impegnativa e una faccenda leggera non chiedono la stessa energia. Il piano deve riconoscere questa differenza.",
      "Alta: una sessione di studio. Media: preparare i pasti. Bassa: una piccola faccenda o fermarsi. Sono esempi, non obblighi.",
      "Scegli l’attività adatta al momento, non alla pressione che senti.",
    ],
    [
      "Conta la direzione, non l’incastro.",
      "Scegli fino a tre priorità importanti e lasciale muovere dentro la settimana. Una finestra favorevole conta più di una data imposta.",
      "Vuoi studiare? Tieni pronta una sessione breve. Può trovare spazio nel giorno libero, non per forza dopo il turno più pesante.",
      "Spostare una priorità non significa abbandonarla.",
    ],
    [
      "Lascia spazio anche al vuoto.",
      "Decidi in anticipo quando fermarti e cosa non pretendere da te. Il recupero sostiene il piano, non arriva soltanto quando tutto è finito.",
      "Dopo una giornata impegnativa, conserva l’essenziale e togli una richiesta superflua. Non trasformare ogni pausa in un altro compito.",
      "Fermarsi può essere la scelta che rende sostenibile il resto.",
    ],
  ];
  document.querySelectorAll("[data-method]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = Number(b.dataset.method),
        v = methodData[i];
      document
        .querySelectorAll("[data-method]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      document.querySelector("#methodNumber").textContent = `0${i + 1}`;
      ["methodTitle", "methodCopy", "methodExample", "methodTakeaway"].forEach(
        (id, n) => (document.getElementById(id).textContent = v[n]),
      );
      const panel = document.querySelector("#methodDetail");
      if (!paused && typeof panel.animate === "function")
        panel.animate(
          [
            { opacity: 0.45, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 400, easing: "ease-out" },
        );
    }),
  );
  const energies = {
    low: [
      "TIENI L’ESSENZIALE",
      "Una piccola cosa necessaria. Poi spazio al recupero.",
    ],
    medium: [
      "UN PASSO SOSTENIBILE",
      "Un’attività concreta. Senza riempire ogni spazio.",
    ],
    high: [
      "UNA PRIORITÀ IMPORTANTE",
      "Una finestra di concentrazione per ciò che conta, lasciando comunque spazio alle pause.",
    ],
  };
  document.querySelectorAll("[data-energy]").forEach((b) =>
    b.addEventListener("click", () => {
      const v = energies[b.dataset.energy];
      document.querySelector("#energyKind").textContent = v[0];
      document.querySelector("#energyTask").textContent = v[1];
      document
        .querySelectorAll("[data-energy]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }),
  );
  const tech = document.querySelector("#techDetails");
  function openTech() {
    tech.open = true;
  }
  document
    .querySelectorAll("[data-open-tech]")
    .forEach((a) => a.addEventListener("click", openTech));
  if (location.hash === "#tech" || location.hash === "#tech-content")
    openTech();
  window.addEventListener("hashchange", () => {
    if (location.hash === "#tech" || location.hash === "#tech-content")
      openTech();
  });
  let scrollFrame = 0;
  function scrollUpdate() {
    scrollFrame = 0;
    const span = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector("#readingProgress").style.transform =
      `scaleX(${span > 0 ? Math.min(1, window.scrollY / span) : 0})`;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollUpdate);
    },
    { passive: true },
  );
  scrollUpdate();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".story-copy,.book,.method-layout,.breathing-section,.author-copy",
      )
      .forEach((e) => observer.observe(e));
  }
}
