import { createHash, timingSafeEqual } from 'node:crypto';

export const kitIds = ['planning', 'recupero', 'energia'];
export const mediaIds = ['rientro', 'sonno', 'pausa', 'energia'];
export const kitPaths = {
  planning: 'kits/v1.1/Shift-Flow-settimana-flessibile.pdf',
  recupero: 'kits/v1.1/Shift-Flow-spazio-al-recupero.pdf',
  energia: 'kits/v1.1/Shift-Flow-ascolta-la-tua-energia.pdf',
};
export class ShopError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function quote(product, discount = false) {
  if (!kitIds.includes(product) && product !== 'bundle') throw new ShopError(400, 'Prodotto non valido.');
  if (discount && product === 'bundle') throw new ShopError(400, 'Lo sconto del libro non si applica al bundle.');
  return { amount: product === 'bundle' ? 1190 : discount ? 368 : 490, currency: 'eur', files: product === 'bundle' ? kitIds : [product] };
}
export function matchesBookCode(code, hash) {
  if (typeof code !== 'string' || code.length > 80 || !/^[a-f0-9]{64}$/i.test(hash || '')) return false;
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,40}$/.test(normalized)) return false;
  return timingSafeEqual(createHash('sha256').update(normalized).digest(), Buffer.from(hash, 'hex'));
}
export function readiness(env) {
  let privacyReady=false;
  try {const url=new URL(env.MEMBERS_PRIVACY_URL);privacyReady=url.origin===(env.PUBLIC_SITE_ORIGIN || 'https://shift-flow-project.vercel.app') && url.protocol==='https:' && !url.username && !url.password && (url.pathname!=='/' || !!url.hash);} catch {}
  const member = env.MEMBERS_ENABLED === 'true' && env.MEMBERS_PRIVACY_READY === 'true' && privacyReady && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(env.SUPABASE_URL || '') && !!env.SUPABASE_PUBLIC_KEY && !!env.SUPABASE_SERVICE_ROLE_KEY;
  const configured = member && !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET && !!env.BLOB_READ_WRITE_TOKEN && !!env.SHOP_PRICE_IDS && !!env.SHOP_PRODUCT_IDS;
  const live = /^(?:sk|rk)_live_/.test(env.STRIPE_SECRET_KEY || '');
  const taxReady = env.STRIPE_AUTOMATIC_TAX !== 'true' || env.TAX_REGISTRATION_CONFIRMED === 'true';
  const checkout = configured && live && taxReady && env.SHOP_LIVE_ENABLED === 'true' && env.SHOP_LEGAL_READY === 'true';
  return { member, configured, live, checkout, code: member && /^[a-f0-9]{64}$/i.test(env.BOOK_CODE_HASH || '') };
}
export function validatePaidSession(session, order, priceId, live) {
  const items = session.line_items?.data;
  const item = items?.[0];
  const q = quote(order.product, order.discount);
  const price = item?.price;
  if (session.mode !== 'payment' || session.livemode !== live || session.currency !== 'eur' || session.amount_total !== q.amount ||
      session.metadata?.order_id !== order.id || session.metadata?.user_id !== order.user_id || session.metadata?.product_id !== order.product ||
      session.client_reference_id !== order.id || items?.length !== 1 || session.line_items.has_more || item.quantity !== 1 ||
      item.amount_total !== q.amount || price?.currency !== 'eur' || price?.unit_amount !== q.amount ||
      (order.discount ? (typeof price.product === 'string' ? price.product : price.product?.id) !== priceId : price?.id !== priceId)) {
    throw new ShopError(409, 'Il pagamento non corrisponde all’ordine.');
  }
  return session.payment_status === 'paid';
}
