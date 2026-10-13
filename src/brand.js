import { products, purchaseAvailable, previewAvailable } from './catalog.js';
import { chapters, referenceEdition } from './book-references.js';

export function showReadings(ids) {
  const panel = document.querySelector('#recommendedReading');
  const container = document.querySelector('#readingLinks');
  container.replaceChildren();
  const matches = chapters.filter(c => ids.includes(c.id));
  for (const c of matches) {
    const a = document.createElement('a');
    a.href = `#${c.id}`;
    a.className = 'reading-link';
    const label = document.createElement('span');
    label.textContent = `Capitolo ${c.number}${referenceEdition.showPages ? ` · pag. ${c.page}` : ''}`;
    const title = document.createElement('strong'); title.textContent = c.title;
    const detail = document.createElement('p'); detail.textContent = c.description;
    a.append(label, title, detail);
    a.addEventListener('click', () => { document.getElementById(c.id).open = true; });
    container.append(a);
  }
  panel.hidden = matches.length === 0;
}

export function setupBrand() {
  document.querySelectorAll('.episode audio').forEach(player => player.addEventListener('play', () => {
    document.querySelectorAll('.episode audio').forEach(other => { if (other !== player) other.pause(); });
  }));
  const dialog = document.querySelector('#productDialog');
  document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
    const filter = b.dataset.filter;
    let count = 0;
    document.querySelectorAll('.product-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) count++;
    });
    document.querySelectorAll('[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelector('#catalogCount').textContent = `${count} ${count === 1 ? 'proposta' : 'proposte'}`;
  }));
  document.querySelectorAll('[data-product]').forEach(b => b.addEventListener('click', () => {
    const product = products.find(p => p.id === b.dataset.product);
    if (!product) return;
    document.querySelector('#productFormat').textContent = product.format;
    document.querySelector('#productTitle').textContent = product.title;
    document.querySelector('#productDescription').textContent = product.description;
    const list = document.querySelector('#productContents'); list.replaceChildren();
    product.contents.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
    const hasPreview = previewAvailable(product);
    document.querySelector('#productContentsTitle').textContent = hasPreview ? 'Nel kit' : 'Contenuti previsti';
    const preview = document.querySelector('#productPreview');
    const pages = document.querySelector('#productPreviewPages');
    preview.open = false;
    preview.hidden = !hasPreview;
    pages.replaceChildren();
    if (hasPreview) product.previewPages.forEach((page, index) => {
      const figure = document.createElement('figure');
      const link = document.createElement('a');
      link.href = page.image;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `Ingrandisci: ${page.caption}`);
      const img = document.createElement('img');
      img.src = page.image;
      img.alt = `${product.title}: ${page.caption}`;
      img.width = 778;
      img.height = 1100;
      img.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.textContent = `${index + 1} / ${product.previewPages.length} · ${page.caption}`;
      const hint = document.createElement('span');
      hint.className = 'preview-enlarge';
      hint.textContent = 'Ingrandisci ↗';
      link.append(img, hint);
      figure.append(link, caption);
      pages.append(figure);
    });
    const available = purchaseAvailable(product);
    const purchase = document.querySelector('#purchaseLink');
    purchase.hidden = !available;
    purchase.removeAttribute('href');
    if (available) {
      purchase.href = product.checkoutUrl;
      purchase.textContent = `Acquista · ${new Intl.NumberFormat('it-IT', { style:'currency',currency:'EUR' }).format(product.price)}`;
    }
    document.querySelector('#productStatus').textContent = available ? 'Prosegui sul sito di pagamento per acquistare.' : hasPreview ? 'Versione in revisione editoriale. L’anteprima mostra alcune pagine reali; il PDF completo sarà disponibile quando saranno attivati acquisto e consegna.' : 'In preparazione. Ti presenteremo contenuti definitivi e prezzo quando sarà pronto.';
    dialog.showModal();
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.querySelector('#closeProduct').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  document.querySelectorAll('a[href^="#cap-"]').forEach(a => a.addEventListener('click', () => {
    const chapter = document.getElementById(a.hash.slice(1));
    if (chapter) chapter.open = true;
  }));
}
