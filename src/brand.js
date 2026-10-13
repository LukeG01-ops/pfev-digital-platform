import { products, purchaseAvailable, previewAvailable, priceLabel, validPrice } from './catalog.js';
import { chapters, referenceEdition } from './book-references.js';
import { detailsFor, productHash, productIdFromHash } from './product-details.js';

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
  let productTrigger = null;
  function fillList(id, values) {
    const list = document.querySelector(id);
    list.replaceChildren();
    values.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
  }
  function openProduct(product, updateHistory = true) {
    const detail = detailsFor(product);
    const isBook = product.category === 'libro';
    document.querySelector('#productFormat').textContent = product.format;
    document.querySelector('#productTitle').textContent = product.title;
    document.querySelector('#productSubtitle').textContent = product.subtitle || '';
    for (const [id, value] of [['#productAudience',detail.audience],['#productOverview',detail.overview],['#productRelation',detail.relation],['#productLimitation',detail.limitation],['#productDelivery',detail.delivery]]) {
      document.querySelector(id).textContent = value;
    }
    fillList('#productContents', product.contents);
    fillList('#productBenefits', detail.benefits);
    fillList('#productSteps', detail.steps);
    const hasPreview = previewAvailable(product);
    const cover = document.querySelector('#productCover');
    cover.src = isBook ? `/books/${product.image}` : (hasPreview ? product.previewPages[0].image : '');
    cover.alt = `Copertina di ${product.title}`;
    cover.hidden = !cover.getAttribute('src');
    const preview = document.querySelector('#productPreview');
    const pages = document.querySelector('#productPreviewPages');
    preview.hidden = !hasPreview;
    pages.replaceChildren();
    document.querySelector('#productPreviewNote').textContent = isBook ? 'Due pagine selezionate del manoscritto. Ingrandisci per leggere l’estratto: non è il libro completo.' : 'Due pagine reali del kit: un esempio e una scheda. Ingrandisci per leggerle; il PDF completo comprende anche le altre pagine.';
    if (hasPreview) product.previewPages.slice(1).forEach((page, index) => {
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
      caption.textContent = `${index + 1} / ${product.previewPages.length - 1} · ${page.caption}`;
      const hint = document.createElement('span');
      hint.className = 'preview-enlarge';
      hint.textContent = 'Ingrandisci ↗';
      link.append(img, hint);
      figure.append(link, caption);
      pages.append(figure);
    });
    const available = purchaseAvailable(product);
    const purchase = document.querySelector('#purchaseLink');
    const pending = document.querySelector('#purchasePending');
    const buyText = isBook ? 'Acquista su Amazon' : 'Acquista il PDF';
    document.querySelector('#productPrice').textContent = isBook && validPrice(product.price) ? `Cartaceo ${priceLabel({price:product.price})}` : priceLabel(product);
    document.querySelector('#productPrice').classList.toggle('book-price', isBook);
    const kindlePrice = document.querySelector('#productKindlePrice');
    kindlePrice.hidden = !isBook || !validPrice(product.kindlePrice);
    kindlePrice.textContent = kindlePrice.hidden ? '' : `Ebook Kindle ${priceLabel({price:product.kindlePrice})}`;
    document.querySelector('#productPrice').classList.toggle('price-pending', !validPrice(product.price));
    document.querySelector('#purchaseChannel').textContent = isBook ? 'LIBRO · AMAZON' : 'PRODOTTO DIGITALE · PDF';
    purchase.hidden = !available;
    pending.hidden = available;
    pending.textContent = buyText;
    purchase.textContent = buyText;
    purchase.removeAttribute('href');
    if (available) {
      purchase.href = isBook ? product.amazonUrl : product.checkoutUrl;
    }
    document.querySelector('#productStatus').textContent = available ? (isBook ? 'Si aprirà la scheda Amazon del libro in una nuova finestra.' : 'Si aprirà il checkout. Il file completo viene consegnato soltanto dopo la conferma del pagamento.') : (isBook ? 'Prezzi di lancio previsti. Dopo la pubblicazione, potrai scegliere cartaceo o ebook Kindle nella scheda Amazon. Il collegamento di acquisto non è ancora disponibile.' : 'Il prezzo di lancio è indicato e puoi esplorare l’anteprima. Pagamento e scaricamento del PDF completo non sono ancora attivi.');
    document.querySelector('#purchaseNotice').textContent = isBook ? 'Il prezzo finale e la disponibilità saranno confermati su Amazon.' : 'Le anteprime sono pubbliche. I file completi restano privati: questa scheda non abilita un download gratuito.';
    dialog.dataset.product = product.id;
    if (updateHistory && location.hash !== productHash(product.id)) {
      history.pushState({...history.state, shopProduct:product.id}, '', productHash(product.id));
    }
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  function closeProduct() {
    if (productIdFromHash(location.hash) && history.state?.shopProduct === dialog.dataset.product) {
      history.back();
    } else {
      if (productIdFromHash(location.hash)) history.replaceState(history.state, '', '#shop');
      dialog.close();
      if (productTrigger) productTrigger.focus({preventScroll:true});
      else document.querySelector('#shop').scrollIntoView({behavior:'instant',block:'start'});
    }
  }
  function restoreProductRoute() {
    const id = productIdFromHash(location.hash);
    const product = products.find(p => p.id === id);
    if (product) openProduct(product, false);
    else if (dialog.open) { dialog.close(); productTrigger?.focus({preventScroll:true}); }
  }
  document.querySelectorAll('[data-product]').forEach(b => b.addEventListener('click', () => {
    const product = products.find(p => p.id === b.dataset.product);
    if (!product) return;
    productTrigger = b;
    openProduct(product);
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', closeProduct);
  document.querySelector('#closeProduct').addEventListener('click', closeProduct);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProduct(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeProduct();
  });
  window.addEventListener('popstate', restoreProductRoute);
  window.addEventListener('hashchange', restoreProductRoute);
  restoreProductRoute();
  document.querySelectorAll('a[href^="#cap-"]').forEach(a => a.addEventListener('click', () => {
    const chapter = document.getElementById(a.hash.slice(1));
    if (chapter) chapter.open = true;
  }));
}
