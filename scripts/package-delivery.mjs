import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import path from "node:path";

const project = process.cwd();
const destination = process.argv[2];
if (!destination || !path.isAbsolute(destination))
  throw new Error("Provide an absolute, new output directory.");
await mkdir(destination, { recursive: false });
const html = await readFile(path.join(project, "dist/index.html"), "utf8");
const jsPath = html.match(/<script[^>]+src="([^"]+)"/)[1];
const cssPath = html.match(/<link[^>]+href="([^"]+\.css)"/)[1];
const mime = (file) =>
  file.endsWith(".ttf")
    ? "font/ttf"
    : file.endsWith(".svg")
      ? "image/svg+xml"
      : "image/png";
const inline = async (file) =>
  `data:${mime(file)};base64,${(await readFile(path.join(project, "public", file))).toString("base64")}`;
let css = await readFile(path.join(project, "dist", cssPath), "utf8");
for (const file of [
  "fonts/barlow-regular.ttf",
  "fonts/barlow-semibold.ttf",
  "fonts/bodoni-moda.ttf",
])
  css = css.replaceAll("/" + file, await inline(file));
const js = await readFile(path.join(project, "dist", jsPath), "utf8");
const covers = {};
for (const name of ["shift-flow.png", "evolve.png", "relactions.png"])
  covers["/books/" + name] = await inline("books/" + name);
const offline = `
// This standalone preview never calls production services.
window.fetch = async () => new Response(JSON.stringify({error:'Offline preview'}), {status:503,headers:{'Content-Type':'application/json'}});
${js}
const previewCovers = ${JSON.stringify(covers)};
function inlinePreviewCovers() {
  document.querySelectorAll('img').forEach(img => {
    const current=img.getAttribute('src')||'';
    if(current.startsWith('data:')) return;
    const key='/books/'+current.split('/').pop();
    if(previewCovers[key]) img.src=previewCovers[key];
  });
}
inlinePreviewCovers();
new MutationObserver(inlinePreviewCovers).observe(document.querySelector('#heroCover'), {attributes:true,attributeFilter:['src']});
document.querySelector('#generateButton').disabled = true;
document.querySelector('#plannerStatus').textContent = 'Anteprima offline: la generazione AI si prova nel progetto configurato o su Vercel.';
document.querySelector('#resourceForm button[type="submit"]').disabled = true;
document.querySelector('#formMessage').textContent = 'Anteprima offline: i dati non vengono inviati.';
`;
let preview = html
  .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, "")
  .replace(/<link[^>]+rel="stylesheet"[^>]*>/, "")
  .replace(/<link[^>]+rel="preload"[^>]*>/g, "")
  .replace("/favicon.svg", await inline("favicon.svg"))
  .replace(
    "</head>",
    `<style>${css}</style><style>.preview-note{padding:10px 20px;text-align:center;font:14px Barlow,sans-serif;background:#233d3b;color:#f7f8f7}.preview-note strong{font-weight:600}</style></head>`,
  )
  .replace(
    "<body>",
    '<body><aside class="preview-note"><strong>ANTEPRIMA OFFLINE</strong> · Design e interazioni esplorabili. AI e invio dati disattivati in questa copia.</aside>',
  )
  .replace(
    "</body>",
    `<script type="module">${offline.replace(/<\/script/gi, "<\\/script")}</script></body>`,
  );
await writeFile(path.join(destination, "APRI-ANTEPRIMA.html"), preview);
const codeDir = path.join(destination, "progetto");
await mkdir(codeDir);
const entries = [
  "src",
  "api",
  "public",
  "tests",
  "docs",
  "scripts",
  ".impeccable",
  "dist",
  ".env.example",
  ".gitignore",
  "README.md",
  "PRODUCT.md",
  "DESIGN.md",
  "index.html",
  "package.json",
  "package-lock.json",
  "Dockerfile",
  "compose.yaml",
  "vite.config.js",
];
for (const entry of entries)
  await cp(path.join(project, entry), path.join(codeDir, entry), {
    recursive: true,
  });
await writeFile(
  path.join(destination, "LEGGIMI.md"),
  `# Shift Flow — Edizione editoriale interattiva

## Guardare subito il sito

Apri APRI-ANTEPRIMA.html con Chrome, Safari o Firefox (doppio clic, oppure Apri con).
È una copia autonoma del design: font e copertine sono inclusi. Puoi ruotare e aprire il libro, cambiare volume, esplorare il metodo, mettere in pausa le animazioni e consultare la tendina tecnica.
In questa anteprima AI e invio del form sono disattivati: non trasmette i dati dei moduli.

## Usare il progetto completo

La cartella progetto contiene il codice Vite e la funzione API originali, aggiornati. Segui progetto/README.md per avvio, configurazione e sostituzione dei file nella tua cartella esistente.
Non sovrascrivere la tua cartella .git né i tuoi file .env. Non sono inclusi nel pacchetto.

## Stato reale della verifica

Compilazione, suite API e simulazione delle interazioni: superate.
Verifica visiva nel browser: non completata, perché l'anteprima dell'ambiente è stata bloccata.
Servizi n8n/OpenAI/Supabase: collegamenti preservati nel codice, ma nessuna nuova chiamata reale o registrazione nel database eseguita durante questa revisione.
Il sito Vercel e il repository GitHub non sono stati modificati.

Prima di inviare la candidatura, apri questa anteprima sul tuo Mac e controlla il sito pubblicato anche da telefono. Il rapporto dettagliato è in progetto/docs/VERIFICA.md.
`,
);
console.log(
  JSON.stringify({
    destination,
    previewBytes: Buffer.byteLength(preview),
    sourceEntries: entries.length,
  }),
);
