import { products, priceLabel } from './catalog.js';

export async function setupMembership() {
  const $=selector=>document.querySelector(selector);
  const dialog=$('#memberDialog'), status=$('#memberStatus');
  const privacyLink=document.createElement('a');privacyLink.className='text-link';privacyLink.textContent='Leggi l’informativa privacy';privacyLink.target='_blank';privacyLink.rel='noopener';privacyLink.hidden=true;$('#memberEmailForm').append(privacyLink);
  const discountBox=document.createElement('div');discountBox.id='readerDiscount';discountBox.className='reader-discount';discountBox.hidden=true;
  const discountLabel=document.createElement('label'),discountInput=document.createElement('input');
  discountInput.type='checkbox';discountInput.id='useReaderDiscount';
  discountLabel.append(discountInput,document.createTextNode('Usa lo sconto del libro: −25%, una sola volta su un kit singolo. Totale 3,68 €.'));
  discountBox.append(discountLabel);$('#purchasePending').before(discountBox);
  let config={memberReady:false,codeReady:false,checkoutReady:false}, auth=null, session=null, member=null, email='', authRevision=0;
  function tell(text) { status.textContent=text; }
  function open() { if (!dialog.open) dialog.showModal(); }
  document.querySelectorAll('[data-member-open]').forEach(button=>button.addEventListener('click',open));
  $('[data-member-close]').addEventListener('click',()=>dialog.close());
  async function request(action,{body,query={}}={}) {
    const params=new URLSearchParams({action,...query});
    const response=await fetch(`/api/shop?${params}`,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
    let result; try { result=await response.json(); } catch { throw new Error('Servizio temporaneamente non disponibile.'); }
    if (!response.ok) throw new Error(result.error || 'Operazione non completata.');
    return result;
  }
  function clearMedia() {
    document.querySelectorAll('.episode audio,.episode video').forEach(player=>{player.pause();player.removeAttribute('src');player.load();player.remove();});
  }
  function refreshProduct() {
    const product=products.find(p=>p.id===$('#productDialog').dataset.product);
    const box=$('#readerDiscount');
    if (!product || product.category==='libro') { box.hidden=true; return; }
    const eligible=member?.discount==='available' && product.id!=='bundle';
    box.hidden=!eligible;
    if (!eligible) $('#useReaderDiscount').checked=false;
    const discounted=eligible && $('#useReaderDiscount').checked;
    $('#productPrice').textContent=priceLabel({price:discounted?3.68:product.price});
    const button=$('#purchasePending');
    button.hidden=false; $('#purchaseLink').hidden=true;
    button.disabled=!config.checkoutReady;
    button.textContent=!session?'Accedi per acquistare':product.id==='bundle'?'Acquista il bundle':'Acquista il PDF';
    $('#productStatus').textContent=config.checkoutReady?(session?'Pagamento sicuro su Stripe. I file saranno disponibili dopo la conferma del pagamento.':'Accedi con la tua email per acquistare e ritrovare i file.'): 'Gli acquisti non sono ancora disponibili. Puoi consultare contenuti e anteprime.';
  }
  function draw() {
    $('#memberEmailForm').hidden=!config.memberReady || !!session;
    $('#memberOtpForm').hidden=true;
    $('#memberAccount').hidden=!member;
    document.querySelectorAll('[data-member-open]').forEach(b=>{if(b.id==='accountButton') b.textContent=member?'Il tuo account':'Accedi';});
    if (member) {
      $('#memberEmailLabel').textContent=member.email;
      $('#bookCodeForm').hidden=member.bonus || !config.codeReady;
      $('#memberBenefits').textContent=member.bonus?
        `Codice del libro attivato: accesso alle quattro guide. ${member.discount==='available'?'Hai il 25% su un kit PDF singolo: 3,68 € invece di 4,90 €.':member.discount==='reserved'?'Lo sconto è riservato a un pagamento. Se lo annulli, torna disponibile dopo la scadenza confermata del checkout.':'Hai già utilizzato lo sconto. L’accesso alle guide resta attivo.'}`:
        config.codeReady?'Inserisci il codice del libro per attivare i vantaggi.':'Il codice del libro non è ancora attivo.';
      drawOrders();
    } else $('#memberOrders').replaceChildren();
    document.querySelectorAll('[data-bonus-play]').forEach(button=>{
      button.textContent=member?.bonus?'Ascolta la guida':'Accedi e inserisci il codice';
      button.disabled=false;
      const label=button.closest('.episode').querySelector('.availability-label');
      label.textContent=member?.bonus?'Bonus attivato':'Bonus del libro';
    });
    refreshProduct();
  }
  async function updateSession(next) {
    const revision=++authRevision;
    session=next; member=null; clearMedia(); draw();
    if (!next) { tell(config.memberReady?'Accedi con la tua email.':'Accesso temporaneamente non disponibile. Non viene raccolta alcuna email.'); return; }
    try { const result=await request('member'); if(revision!==authRevision)return; member=result; tell('Accesso confermato.'); draw(); }
    catch(error) { if(revision!==authRevision)return; session=null;member=null;draw();tell(error.message); }
  }
  async function download(orderId,kit) {
    const response=await fetch(`/api/shop?${new URLSearchParams({action:'download',order:orderId,kit})}`,{headers:{Authorization:`Bearer ${session.access_token}`},signal:AbortSignal.timeout(30000)});
    if (!response.ok) { const result=await response.json(); throw new Error(result.error || 'Download non disponibile.'); }
    const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url; link.download=`Shift-Flow-${kit}.pdf`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function drawOrders() {
    const area=$('#memberOrders'); area.replaceChildren();
    const orders=member.orders || [];
    if (!orders.length) { area.textContent='Non hai ancora acquisti sul sito.'; return; }
    orders.forEach(order=>{
      const product=products.find(p=>p.id===order.product); if(!product)return;
      const row=document.createElement('div'); row.className='member-order';
      const title=document.createElement('strong'); title.textContent=product.title;
      const text=document.createElement('p'); text.textContent=`${priceLabel({price:order.amount/100})} · ${({paid:'Pagamento confermato',pending:'Pagamento da completare',processing:'Pagamento in elaborazione',expired:'Checkout scaduto',failed:'Pagamento non riuscito',revoked:'Accesso revocato'})[order.state] || 'Da verificare'}`;
      row.append(title,text);
      if(order.state==='paid') (product.bundleItems || [product.id]).forEach(kit=>{
        const b=document.createElement('button'); b.className='text-link'; b.textContent=`Scarica ${products.find(p=>p.id===kit).title}`;
        b.addEventListener('click',async()=>{b.disabled=true;try{await download(order.id,kit);}catch(e){tell(e.message);}finally{b.disabled=false;}}); row.append(b);
      });
      if(['pending','processing'].includes(order.state)) {
        const b=document.createElement('button'); b.className='text-link'; b.textContent='Verifica pagamento';
        b.addEventListener('click',async()=>{b.disabled=true;try{await request('order',{query:{id:order.id}}); await updateSession(session);}catch(e){tell(e.message);}finally{b.disabled=false;}});row.append(b);
      }
      area.append(row);
    });
  }
  async function submit(form,work) {
    const button=form.querySelector('button[type=submit]');button.disabled=true;
    try { await work(); } catch(error) { tell(error.name==='TimeoutError'?'Il servizio sta impiegando troppo tempo. Riprova.':error.message); }
    finally { button.disabled=false; }
  }
  $('#memberEmailForm').addEventListener('submit',event=>{event.preventDefault();submit(event.currentTarget,async()=>{
    if(!auth)throw new Error('Accesso non disponibile.');
    email=$('#memberEmail').value.trim();
    const {error}=await auth.signInWithOtp({email,options:{shouldCreateUser:true}});
    if(error)throw new Error('Invio non completato. Controlla l’email o riprova tra un minuto.');
    $('#memberEmailForm').hidden=true;$('#memberOtpForm').hidden=false;$('#memberOtp').value='';$('#memberOtp').focus();tell('Inserisci il codice ricevuto via email. Controlla anche la posta indesiderata.');
  });});
  $('#changeMemberEmail').addEventListener('click',()=>{draw();tell('Puoi scegliere un’altra email.');});
  $('#memberOtpForm').addEventListener('submit',event=>{event.preventDefault();submit(event.currentTarget,async()=>{
    const {data,error}=await auth.verifyOtp({email,token:$('#memberOtp').value.trim(),type:'email'});
    if(error || !data.session)throw new Error('Codice non valido o scaduto. Richiedi un nuovo accesso.');
    await updateSession(data.session);
  });});
  $('#bookCodeForm').addEventListener('submit',event=>{event.preventDefault();submit(event.currentTarget,async()=>{
    member=await request('redeem',{body:{code:$('#bookCode').value}});$('#bookCode').value='';draw();tell('Codice del libro attivato.');
  });});
  $('#memberLogout').addEventListener('click',async()=>{try{const {error}=await auth.signOut({scope:'local'});if(error)throw error;await updateSession(null);}catch{tell('Uscita non completata. Riprova.');}});
  window.addEventListener('shift-flow-product',()=>{$('#useReaderDiscount').checked=false;refreshProduct();});
  $('#useReaderDiscount').addEventListener('change',refreshProduct);
  $('#purchasePending').addEventListener('click',async()=>{
    const product=products.find(p=>p.id===$('#productDialog').dataset.product);
    if(!config.checkoutReady || !product || product.category==='libro')return;
    if(!session) { open(); return; }
    const button=$('#purchasePending');button.disabled=true;
    try {
      const result=await request('checkout',{body:{product:product.id,discount:member?.discount==='available' && product.id!=='bundle' && $('#useReaderDiscount').checked}});
      const url=new URL(result.url);if(url.protocol!=='https:' || url.hostname!=='checkout.stripe.com')throw new Error('Checkout non valido.');
      location.assign(url.href);
    } catch(error) {$('#productStatus').textContent=error.message;button.disabled=false;}
  });
  document.querySelectorAll('[data-bonus-play]').forEach(button=>button.addEventListener('click',async()=>{
    if(!member?.bonus) {open();return;}
    button.disabled=true;
    const card=button.closest('.episode'), message=card.querySelector('.bonus-message');
    try {
      const result=await request('media',{query:{id:button.dataset.bonusPlay}});
      const url=new URL(result.url);if(url.origin!==config.authUrl || !url.pathname.startsWith('/storage/v1/object/sign/shift-flow-bonus/'))throw new Error('Guida non disponibile.');
      clearMedia();const player=document.createElement(result.type==='video/mp4'?'video':'audio');player.controls=true;player.preload='none';player.src=url.href;player.setAttribute('aria-label',card.querySelector('h3').textContent);card.append(player);message.textContent='La riproduzione è disponibile per il tuo account.';
      await player.play().catch(()=>{});
    } catch(error) {message.textContent=error.message;}
    finally {button.disabled=false;}
  }));
  function orderRoute() {
    const match=/^#ordine\/([a-f0-9-]{36})$/i.exec(location.hash);
    if(!match)return;open();
    if(session) request('order',{query:{id:match[1]}}).then(()=>updateSession(session)).catch(e=>tell(e.message));
    else tell('Accedi con la stessa email usata per l’acquisto per verificare il pagamento e scaricare i file.');
  }
  window.addEventListener('hashchange',orderRoute);
  try {
    config=await request('config');
    if(config.memberReady) {
      const privacyUrl=new URL(config.privacyUrl);if(privacyUrl.protocol!=='https:' || privacyUrl.origin!==location.origin)throw new Error('Informativa non disponibile.');
      privacyLink.href=privacyUrl.href;privacyLink.hidden=false;
      const {createClient}=await import('@supabase/supabase-js');
      auth=createClient(config.authUrl,config.authKey,{auth:{detectSessionInUrl:false}}).auth;
      auth.onAuthStateChange((_event,next)=>{setTimeout(()=>updateSession(next),0);});
      const {data}=await auth.getSession();await updateSession(data.session);
    } else {draw();tell('Accesso temporaneamente non disponibile. Non viene raccolta alcuna email.');}
  } catch {draw();tell('Accesso temporaneamente non disponibile. Riprova più tardi.');}
  orderRoute();
}
