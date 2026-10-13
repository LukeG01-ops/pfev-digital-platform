import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { timingSafeEqual } from 'node:crypto';
import { createShopService } from '../server/shop-service.js';
import { ShopError } from '../server/shop-policy.js';

export const config={api:{bodyParser:false}};
async function rawBody(req) {
  const chunks=[]; let size=0;
  for await (const chunk of req) {
    size+=Buffer.byteLength(chunk); if (size>65536) throw new ShopError(413,'Richiesta troppo grande.'); chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
function privateTest(req,env) {
  const actual=req.headers['x-shop-test-token'], expected=env.SHOP_TEST_TOKEN;
  if (typeof actual!=='string' || typeof expected!=='string' || expected.length<32) return false;
  const a=Buffer.from(actual),b=Buffer.from(expected); return a.length===b.length && timingSafeEqual(a,b);
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const env=process.env, shop=createShopService(env);
  const origin=env.PUBLIC_SITE_ORIGIN || 'https://shift-flow-project.vercel.app';
  const url=new URL(req.url,origin), action=url.searchParams.get('action');
  function send(status,value) { res.statusCode=status; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(value)); }
  try {
    if (req.method==='GET' && action==='config') {
      return send(200,{memberReady:shop.ready.member,codeReady:shop.ready.code,checkoutReady:shop.ready.checkout,
        ...(shop.ready.member?{authUrl:env.SUPABASE_URL,authKey:env.SUPABASE_PUBLIC_KEY,privacyUrl:env.MEMBERS_PRIVACY_URL}:{}),
      });
    }
    if (action==='webhook' && req.method==='POST') return send(200,await shop.webhook(await rawBody(req),req.headers['stripe-signature']));
    if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow','GET, POST'); throw new ShopError(405,'Metodo non supportato.'); }
    if (req.method==='POST' && req.headers.origin!==origin) throw new ShopError(403,'Origine non consentita.');
    const u=await shop.user(req.headers.authorization);
    if (req.method==='GET' && action==='member') return send(200,await shop.member(u));
    if (req.method==='GET' && action==='order') return send(200,await shop.order(u,url.searchParams.get('id')));
    if (req.method==='GET' && action==='media') return send(200,await shop.media(u,url.searchParams.get('id')));
    if (req.method==='GET' && action==='download') {
      const file=await shop.download(u,url.searchParams.get('order'),url.searchParams.get('kit'));
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition',`attachment; filename="${file.filename}"`);
      await pipeline(Readable.fromWeb(file.stream),res); return;
    }
    if (req.method==='POST' && ['redeem','checkout'].includes(action)) {
      let body; try { body=JSON.parse((await rawBody(req)).toString('utf8')); } catch(e) { if (e instanceof ShopError) throw e; throw new ShopError(400,'Richiesta non valida.'); }
      if (!body || typeof body!=='object' || Array.isArray(body)) throw new ShopError(400,'Richiesta non valida.');
      return send(200,action==='redeem'?await shop.redeem(u,body.code):await shop.checkout(u,body.product,body.discount,origin,privateTest(req,env)));
    }
    throw new ShopError(404,'Operazione non trovata.');
  } catch(error) {
    if (res.headersSent) { res.destroy(); return; }
    // Never expose SDK errors, tokens, email addresses, or configuration values.
    send(error instanceof ShopError?error.status:503,{error:error instanceof ShopError?error.message:'Servizio temporaneamente non disponibile. Riprova tra poco.'});
  }
}
