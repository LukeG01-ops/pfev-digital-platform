import { createClient } from '@supabase/supabase-js';
import StripeClient from 'stripe';
import { get } from '@vercel/blob';
import { kitPaths, mediaIds, quote, matchesBookCode, readiness, validatePaidSession, ShopError } from './shop-policy.js';

export function createShopService(env, dependencies = {}) {
  const ready = readiness(env);
  let db, stripe;
  const database = () => db ||= (dependencies.database || createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(10000)})}}));
  const payments = () => stripe ||= (dependencies.stripe || new StripeClient(env.STRIPE_SECRET_KEY, {maxNetworkRetries:2,timeout:15000,appInfo:{name:'Shift Flow',version:'1.0.0',url:'https://shift-flow-project.vercel.app'}}));
  function map(name) {
    try { const value=JSON.parse(env[name]); if (!value || typeof value !== 'object') throw new Error(); return value; }
    catch { throw new ShopError(503, 'Configurazione dello shop incompleta.'); }
  }
  async function rpc(name, args) {
    const { data, error } = await database().rpc(name,args);
    if (error) {
      if (/discount_(unavailable|reserved|already_consumed)/.test(error.message)) throw new ShopError(409,'Lo sconto non è disponibile oppure è già riservato a un pagamento.');
      throw new ShopError(503,'Operazione non completata. Riprova tra poco.');
    }
    return Array.isArray(data) ? data[0] : data;
  }
  async function user(authorization) {
    if (!ready.member) throw new ShopError(503,'Accesso temporaneamente non disponibile.');
    const token = /^Bearer ([A-Za-z0-9._-]+)$/.exec(authorization || '')?.[1];
    if (!token) throw new ShopError(401,'Accedi per continuare.');
    const {data,error}=await database().auth.getUser(token);
    if (error || !data?.user?.id || !data.user.email_confirmed_at) throw new ShopError(401,'Accedi e conferma la tua email per continuare.');
    return data.user;
  }
  async function member(u) {
    const [{data:m,error:me},{data:orders,error:oe}]=await Promise.all([
      database().from('sf_members').select('redeemed_at,discount_used_at').eq('user_id',u.id).maybeSingle(),
      database().from('sf_orders').select('id,product,amount,discount,state,session_id,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(100),
    ]);
    if (me || oe) throw new ShopError(503,'Impossibile leggere gli acquisti.');
    return {email:u.email,bonus:!!m?.redeemed_at,discount:m?.discount_used_at?'used':orders.some(o=>o.discount && ['pending','processing'].includes(o.state))?'reserved':m?.redeemed_at?'available':'locked',orders};
  }
  async function redeem(u,code) {
    if (!ready.code) throw new ShopError(503,'Il codice del libro non è ancora attivo.');
    if (!await rpc('sf_allow_attempt',{p_user:u.id})) throw new ShopError(429,'Troppi tentativi. Riprova tra 15 minuti.');
    if (!matchesBookCode(code,env.BOOK_CODE_HASH)) throw new ShopError(400,'Codice non riconosciuto. Controlla quello riportato nel libro.');
    await rpc('sf_redeem',{p_user:u.id});
    return member(u);
  }
  async function orderById(id) {
    if (!/^[a-f0-9-]{36}$/i.test(id || '')) throw new ShopError(404,'Ordine non trovato.');
    const {data,error}=await database().from('sf_orders').select('*').eq('id',id).maybeSingle();
    if (error || !data) throw new ShopError(404,'Ordine non trovato.');
    return data;
  }
  async function syncSession(sessionId) {
    if (!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId || '')) throw new ShopError(400,'Sessione non valida.');
    const session=await payments().checkout.sessions.retrieve(sessionId,{expand:['line_items']});
    const order=await orderById(session.metadata?.order_id);
    const paid=validatePaidSession(session,order,order.discount?map('SHOP_PRODUCT_IDS')[order.product]:map('SHOP_PRICE_IDS')[order.product],ready.live);
    await rpc('sf_attach_session',{p_order:order.id,p_session:session.id});
    if (paid) {
      const intent=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
      if (!intent) throw new ShopError(409,'Conferma del pagamento incompleta.');
      await rpc('sf_fulfill',{p_order:order.id,p_session:session.id,p_intent:intent});
    } else if (session.status==='expired') await rpc('sf_transition',{p_order:order.id,p_session:session.id,p_state:'expired'});
    else if (session.status==='complete') await rpc('sf_transition',{p_order:order.id,p_session:session.id,p_state:'processing'});
    return session;
  }
  async function checkout(u,product,discount,origin,privateTest=false) {
    if (!ready.checkout && !(privateTest && ready.configured && !ready.live && (env.STRIPE_AUTOMATIC_TAX!=='true' || env.TAX_REGISTRATION_CONFIRMED==='true'))) throw new ShopError(503,'Gli acquisti non sono ancora disponibili.');
    if (typeof discount !== 'boolean') throw new ShopError(400,'Scelta dello sconto non valida.');
    const q=quote(product,discount);
    const priceId=map('SHOP_PRICE_IDS')[product], productId=map('SHOP_PRODUCT_IDS')[product];
    if (!/^price_[A-Za-z0-9_]+$/.test(priceId || '') || !/^prod_[A-Za-z0-9_]+$/.test(productId || '')) throw new ShopError(503,'Prodotto non configurato.');
    // Verify server price configuration against Stripe before accepting an order.
    const price=await payments().prices.retrieve(priceId);
    if (!price.active || price.type!=='one_time' || price.currency!=='eur' || price.unit_amount!==quote(product).amount || price.livemode!==ready.live || price.product!==productId) throw new ShopError(503,'Prezzo del prodotto non disponibile.');
    let order=await rpc('sf_start_order',{p_user:u.id,p_product:product,p_discount:discount});
    if (order.session_id) {
      const existing=await syncSession(order.session_id);
      if (existing.status==='open' && existing.url) return {url:existing.url};
      if (existing.status==='expired') order=await rpc('sf_start_order',{p_user:u.id,p_product:product,p_discount:discount});
      else throw new ShopError(409,'Questo ordine è già in elaborazione o completato. Controlla i tuoi acquisti.');
    }
    if (Date.now()-Date.parse(order.created_at)>23*60*60*1000 && !order.session_id) throw new ShopError(409,'Questo tentativo richiede una verifica prima di essere ripetuto.');
    const line=discount?{price_data:{currency:'eur',product:productId,unit_amount:q.amount,tax_behavior:'inclusive'},quantity:1}:{price:priceId,quantity:1};
    const metadata={order_id:order.id,user_id:u.id,product_id:product,integration_identifier:'shift-flow-checkout-nqplzvte'};
    const session=await payments().checkout.sessions.create({mode:'payment',line_items:[line],customer_email:u.email,client_reference_id:order.id,
      metadata,payment_intent_data:{metadata},success_url:`${origin}/#ordine/${order.id}`,cancel_url:`${origin}/#prodotto/${product}`,
      ...(env.STRIPE_AUTOMATIC_TAX==='true'?{automatic_tax:{enabled:true}}:{}),
    },{idempotencyKey:`sf-order-${order.id}`});
    await rpc('sf_attach_session',{p_order:order.id,p_session:session.id});
    // Do not release the reservation on network ambiguity: a session may already exist.
    if (!session.url || !/^https:\/\/checkout\.stripe\.com\//.test(session.url)) throw new ShopError(503,'Checkout non disponibile.');
    return {url:session.url};
  }
  async function ownOrder(u,id,refresh=false) {
    let order=await orderById(id);
    if (order.user_id!==u.id) throw new ShopError(404,'Ordine non trovato.');
    if (refresh && order.session_id && ['pending','processing'].includes(order.state)) { await syncSession(order.session_id); order=await orderById(id); }
    return order;
  }
  async function order(u,id) {
    const o=await ownOrder(u,id,true);
    return {id:o.id,product:o.product,amount:o.amount,state:o.state,files:o.state==='paid'?quote(o.product,o.discount).files:[]};
  }
  async function download(u,id,kit) {
    const o=await ownOrder(u,id);
    if (o.state!=='paid' || !quote(o.product,o.discount).files.includes(kit)) throw new ShopError(403,'Questo file non è disponibile per il tuo account.');
    const blob=await (dependencies.blobGet || get)(kitPaths[kit],{access:'private',token:env.BLOB_READ_WRITE_TOKEN,useCache:false});
    if (!blob || blob.statusCode!==200 || blob.blob.size>4_000_000) throw new ShopError(503,'File non disponibile.');
    return {stream:blob.stream,filename:kitPaths[kit].split('/').at(-1)};
  }
  async function media(u,id) {
    if (!mediaIds.includes(id)) throw new ShopError(404,'Guida non trovata.');
    if (!(await member(u)).bonus) throw new ShopError(403,'Inserisci prima il codice del libro.');
    const asset=map('BONUS_MEDIA_JSON')[id];
    if (!asset || !['audio/mpeg','video/mp4'].includes(asset.type) || !/^[a-z0-9-]+\/(?:[a-z0-9-]+\/)*[a-z0-9.-]+\.(?:mp3|mp4)$/.test(asset.path || '')) throw new ShopError(404,'La guida non è ancora disponibile all’ascolto.');
    const {data,error}=await database().storage.from('shift-flow-bonus').createSignedUrl(asset.path,300);
    if (error || !data?.signedUrl) throw new ShopError(503,'Ascolto temporaneamente non disponibile.');
    return {url:data.signedUrl,type:asset.type};
  }
  async function webhook(raw,signature) {
    if (!ready.configured) throw new ShopError(503,'Webhook non configurato.');
    let event;
    try { event=payments().webhooks.constructEvent(raw,signature,env.STRIPE_WEBHOOK_SECRET); }
    catch { throw new ShopError(400,'Firma del webhook non valida.'); }
    if (event.livemode!==ready.live) throw new ShopError(400,'Ambiente non corrispondente.');
    const object=event.data.object;
    if (['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type) && object.metadata?.integration_identifier==='shift-flow-checkout-nqplzvte') {
      const session=await syncSession(object.id);
      if (event.type==='checkout.session.async_payment_failed' && session.payment_status!=='paid') await rpc('sf_transition',{p_order:session.metadata.order_id,p_session:session.id,p_state:'failed'});
    } else if (event.type==='charge.refunded' && object.refunded===true || event.type==='charge.dispute.created') {
      const charge=event.type==='charge.dispute.created'?await payments().charges.retrieve(typeof object.charge==='string'?object.charge:object.charge.id):object;
      const intent=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id;
      if (intent) await rpc('sf_revoke',{p_intent:intent});
    }
    return {received:true};
  }
  return {ready,user,member,redeem,checkout,order,download,media,webhook};
}
