import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { quote, readiness, matchesBookCode, validatePaidSession } from '../server/shop-policy.js';
import { createShopService } from '../server/shop-service.js';
import { memberMarkup } from '../src/member-markup.js';
import handler from '../api/shop.js';
import StripeClient from 'stripe';

const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
const baseEnv={MEMBERS_ENABLED:'true',MEMBERS_PRIVACY_READY:'true',MEMBERS_PRIVACY_URL:'https://shift-flow-project.vercel.app/privacy',SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLIC_KEY:'public-placeholder',SUPABASE_SERVICE_ROLE_KEY:'private-placeholder',STRIPE_SECRET_KEY:'rk_test_placeholder',STRIPE_WEBHOOK_SECRET:'webhook-placeholder',BLOB_READ_WRITE_TOKEN:'blob-placeholder',SHOP_PRICE_IDS:JSON.stringify({planning:'price_plan',recupero:'price_rec',energia:'price_energy',bundle:'price_bundle'}),SHOP_PRODUCT_IDS:JSON.stringify({planning:'prod_plan',recupero:'prod_rec',energia:'prod_energy',bundle:'prod_bundle'}),BOOK_CODE_HASH:createHash('sha256').update('TEST-BOOK-ONLY').digest('hex')};

test('approved prices, discount rounding, exclusions and code normalization are server-side',()=>{
  assert.equal(quote('planning').amount,490);assert.equal(quote('recupero',true).amount,368);assert.equal(quote('bundle').amount,1190);
  assert.deepEqual(quote('bundle').files,['planning','recupero','energia']);
  for(const id of ['libro','../full.pdf','unknown'])assert.throws(()=>quote(id));
  assert.throws(()=>quote('bundle',true));
  assert.equal(matchesBookCode('  test-book-only  ',baseEnv.BOOK_CODE_HASH),true);
  for(const code of ['wrong','',{},null,'a'.repeat(100)]) assert.equal(matchesBookCode(code,baseEnv.BOOK_CODE_HASH),false);
  assert.equal(matchesBookCode('TEST-BOOK-ONLY','not-a-hash'),false);
});
test('missing configuration, privacy signoff, sandbox and tax setup fail closed',()=>{
  assert.equal(readiness({}).member,false);assert.equal(readiness(baseEnv).checkout,false);
  assert.equal(readiness({...baseEnv,MEMBERS_PRIVACY_READY:'false'}).member,false);
  assert.equal(readiness({...baseEnv,MEMBERS_PRIVACY_URL:undefined}).member,false);
  const live={...baseEnv,STRIPE_SECRET_KEY:'rk_live_placeholder',SHOP_LIVE_ENABLED:'true',SHOP_LEGAL_READY:'true'};
  assert.equal(readiness(live).checkout,true);
  assert.equal(readiness({...live,STRIPE_AUTOMATIC_TAX:'true'}).checkout,false);
  assert.equal(readiness({...live,STRIPE_AUTOMATIC_TAX:'true',TAX_REGISTRATION_CONFIRMED:'true'}).checkout,true);
});
test('webhook validation requires exact owner, product, total, price, quantity and mode',()=>{
  const order={id:'order',user_id:alice,product:'planning',discount:false};
  const session={mode:'payment',livemode:false,currency:'eur',amount_total:490,client_reference_id:'order',metadata:{order_id:'order',user_id:alice,product_id:'planning'},line_items:{data:[{quantity:1,amount_total:490,price:{id:'price_plan',unit_amount:490,currency:'eur',product:'prod_plan'}}],has_more:false},payment_status:'paid'};
  assert.equal(validatePaidSession(session,order,'price_plan',false),true);
  assert.equal(validatePaidSession({...session,payment_status:'unpaid'},order,'price_plan',false),false);
  for(const edit of [{amount_total:1},{currency:'usd'},{mode:'subscription'},{livemode:true},{metadata:{...session.metadata,user_id:bob}},{client_reference_id:'different'},{line_items:{data:[],has_more:false}},{line_items:{...session.line_items,has_more:true}}]) assert.throws(()=>validatePaidSession({...session,...edit},order,'price_plan',false));
  const discounted=structuredClone(session);discounted.amount_total=368;discounted.line_items.data[0].amount_total=368;discounted.line_items.data[0].price.unit_amount=368;
  assert.equal(validatePaidSession(discounted,{...order,discount:true},'prod_plan',false),true);
  assert.throws(()=>validatePaidSession(discounted,{...order,discount:true},'prod_other',false));
});
test('actual PostgreSQL migration: redemption, single reservation, cancellation, paid consumption, revocation and RLS',async(t)=>{
  const pg=new PGlite();t.after(()=>pg.close());
  await pg.exec('create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role;');
  await pg.exec(await readFile(new URL('../supabase/migrations/001_shift_flow.sql',import.meta.url),'utf8'));
  await pg.query('insert into auth.users values ($1),($2)',[alice,bob]);
  async function call(name,args){return (await pg.query(`select * from public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')})`,args)).rows[0];}
  for(let i=0;i<5;i++)assert.equal((await call('sf_allow_attempt',[alice])).sf_allow_attempt,true);
  assert.equal((await call('sf_allow_attempt',[alice])).sf_allow_attempt,false);
  await assert.rejects(call('sf_start_order',[alice,'planning',true]),/discount_unavailable/);
  await call('sf_redeem',[alice]);await call('sf_redeem',[alice]);
  const first=await call('sf_start_order',[alice,'planning',true]);assert.equal(first.amount,368);
  assert.equal((await call('sf_start_order',[alice,'planning',true])).id,first.id);
  await assert.rejects(call('sf_start_order',[alice,'recupero',true]),/discount_reserved/);
  await assert.rejects(call('sf_start_order',[alice,'bundle',true]),/discount_unavailable/);
  await call('sf_attach_session',[first.id,'cs_test_first']);
  await call('sf_transition',[first.id,'cs_test_first','processing']);
  await assert.rejects(call('sf_start_order',[alice,'planning',true]),/discount_reserved/);
  await call('sf_transition',[first.id,'cs_test_first','failed']);
  const second=await call('sf_start_order',[alice,'recupero',true]);assert.notEqual(second.id,first.id);
  await call('sf_attach_session',[second.id,'cs_test_second']);
  await call('sf_transition',[second.id,'cs_test_second','expired']);
  assert.equal((await pg.query('select discount_used_at from sf_members where user_id=$1',[alice])).rows[0].discount_used_at,null);
  const paid=await call('sf_start_order',[alice,'energia',true]);await call('sf_attach_session',[paid.id,'cs_test_paid']);
  await call('sf_fulfill',[paid.id,'cs_test_paid','pi_paid']);await call('sf_fulfill',[paid.id,'cs_test_paid','pi_paid']);
  await call('sf_transition',[paid.id,'cs_test_paid','expired']);
  assert.equal((await pg.query('select state from sf_orders where id=$1',[paid.id])).rows[0].state,'paid');
  await assert.rejects(call('sf_start_order',[alice,'planning',true]),/discount_unavailable/);
  assert.ok((await pg.query('select redeemed_at,discount_used_at from sf_members where user_id=$1',[alice])).rows[0].redeemed_at);
  await call('sf_revoke',['pi_paid']);assert.equal((await pg.query('select state from sf_orders where id=$1',[paid.id])).rows[0].state,'revoked');
  await call('sf_redeem',[bob]);const bundle=await call('sf_start_order',[bob,'bundle',false]);assert.equal(bundle.amount,1190);
  await call('sf_attach_session',[bundle.id,'cs_test_bundle']);await call('sf_revoke',['pi_early']);await call('sf_fulfill',[bundle.id,'cs_test_bundle','pi_early']);
  assert.equal((await pg.query('select state from sf_orders where id=$1',[bundle.id])).rows[0].state,'revoked');
  assert.equal((await pg.query('select discount_used_at from sf_members where user_id=$1',[bob])).rows[0].discount_used_at,null);
  for(const role of ['anon','authenticated']) {
    await pg.exec(`set role ${role}`);
    await assert.rejects(pg.query('select * from sf_members'),/permission denied/);
    await assert.rejects(call('sf_redeem',[bob]),/permission denied/);
    await pg.exec('reset role');
  }
});
test('server auth never trusts a decoded token or unconfirmed email',async()=>{
  for(const value of [{data:{user:null},error:new Error('bad')},{data:{user:{id:alice,email:'reader@example.test'}}}]) {
    const shop=createShopService(baseEnv,{database:{auth:{getUser:async()=>value}}});
    await assert.rejects(shop.user('Bearer test.jwt.token'),error=>error.status===401);
  }
  const shop=createShopService(baseEnv,{database:{auth:{getUser:async()=>({data:{user:{id:alice,email_confirmed_at:'now'}}})}}});
  assert.equal((await shop.user('Bearer test.jwt.token')).id,alice);
  await assert.rejects(shop.user(''),error=>error.status===401);
  await assert.rejects(shop.checkout({id:alice},'planning',false,'https://example.test'),error=>error.status===503);
});
test('private files enforce ownership, successful payment and exact product entitlement',async()=>{
  let dbOrder={id:alice,user_id:alice,product:'planning',discount:false,state:'paid'};
  let blobCalls=0;
  const query={select(){return this},eq(){return this},async maybeSingle(){return {data:dbOrder}}};
  const shop=createShopService(baseEnv,{database:{from:()=>query},blobGet:async path=>{blobCalls++;assert.match(path,/settimana-flessibile/);return {statusCode:200,stream:new ReadableStream(),blob:{size:1000}};}});
  await assert.rejects(shop.download({id:bob},alice,'planning'),error=>error.status===404);
  await assert.rejects(shop.download({id:alice},alice,'recupero'),error=>error.status===403);
  await assert.rejects(shop.download({id:alice},alice,'../escape'),error=>error.status===403);
  dbOrder={...dbOrder,state:'pending'};await assert.rejects(shop.download({id:alice},alice,'planning'),error=>error.status===403);
  dbOrder={...dbOrder,state:'revoked'};await assert.rejects(shop.download({id:alice},alice,'planning'),error=>error.status===403);
  assert.equal(blobCalls,0);dbOrder={...dbOrder,state:'paid'};
  assert.match((await shop.download({id:alice},alice,'planning')).filename,/\.pdf$/);assert.equal(blobCalls,1);
});
test('bonus media requires both confirmed account and server book grant; no public sources',async()=>{
  const query={select(){return this},eq(){return this},order(){return this},limit(){return Promise.resolve({data:[]})},maybeSingle(){return Promise.resolve({data:null})}};
  const shop=createShopService(baseEnv,{database:{from:()=>query}});
  await assert.rejects(shop.media({id:alice},'sonno'),error=>error.status===403);
  await assert.rejects(shop.media({id:alice},'unknown'),error=>error.status===404);
  const html=memberMarkup();assert.doesNotMatch(html,/TEST-BOOK-ONLY|sk_test_|rk_test_|area lettore/i);assert.match(html,/una volta per account/);
});
test('public unconfigured API returns no credentials and rejects mutations',async()=>{
  const original=process.env.MEMBERS_ENABLED;delete process.env.MEMBERS_ENABLED;
  const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},end(body){this.body=JSON.parse(body)}});
  try {
    const res=response();await handler({method:'GET',url:'/api/shop?action=config',headers:{}},res);
    assert.deepEqual(res.body,{memberReady:false,codeReady:false,checkoutReady:false});assert.equal(res.headers['Cache-Control'],'private, no-store');
    const denied=response();await handler({method:'POST',url:'/api/shop?action=redeem',headers:{origin:'https://evil.test'}},denied);assert.equal(denied.statusCode,403);
  } finally {if(original===undefined)delete process.env.MEMBERS_ENABLED;else process.env.MEMBERS_ENABLED=original;}
});

test('checkout and signed webhook lifecycle against PostgreSQL, with mocked Stripe transport',async(t)=>{
  const pg=new PGlite();t.after(()=>pg.close());
  await pg.exec('create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role;');
  await pg.exec(await readFile(new URL('../supabase/migrations/001_shift_flow.sql',import.meta.url),'utf8'));
  await pg.query('insert into auth.users values($1)',[alice]);
  const database={
    async rpc(name,args) {try{const result=await pg.query(`select * from ${name}(${Object.keys(args).map((_,i)=>`$${i+1}`).join(',')})`,Object.values(args));return {data:result.rows[0]};}catch(error){return {error};}},
    from(table) {let field,value;return {select(){return this},eq(f,v){field=f;value=v;return this},async maybeSingle(){const result=await pg.query(`select * from ${table} where ${field}=$1`,[value]);return {data:result.rows[0]};}};},
  };
  const signatures=new StripeClient('test-only-placeholder');
  let sequence=0;const sessions=new Map();let priceMismatch=false;
  const stripe={webhooks:signatures.webhooks,prices:{retrieve:async()=>({active:true,type:'one_time',currency:'eur',unit_amount:priceMismatch?100:490,livemode:false,product:'prod_plan'})},checkout:{sessions:{
    async create(params,options){
      assert.equal(params.mode,'payment');assert.equal(params.payment_method_types,undefined);assert.equal(params.automatic_tax,undefined);
      assert.ok(options.idempotencyKey.includes(params.metadata.order_id));
      assert.equal(params.line_items[0].price_data.unit_amount,368);assert.equal(params.allow_promotion_codes,undefined);
      const id=`cs_test_session${++sequence}`;
      const session={id,url:`https://checkout.stripe.com/c/pay/${id}`,mode:'payment',livemode:false,currency:'eur',amount_total:368,client_reference_id:params.client_reference_id,metadata:params.metadata,payment_status:'unpaid',status:'open',payment_intent:null,line_items:{data:[{quantity:1,amount_total:368,price:{id:'price_inline',unit_amount:368,currency:'eur',product:'prod_plan'}}],has_more:false}};
      sessions.set(id,session);return session;
    },async retrieve(id){return sessions.get(id);},
  }}};
  const shop=createShopService(baseEnv,{database,stripe});
  const u={id:alice,email:'reader@example.test'};
  await assert.rejects(shop.checkout(u,'planning',true,'https://example.test'),e=>e.status===503);
  await database.rpc('sf_redeem',{p_user:alice});
  priceMismatch=true;await assert.rejects(shop.checkout(u,'planning',true,'https://example.test',true),e=>e.status===503);priceMismatch=false;
  const first=await shop.checkout(u,'planning',true,'https://example.test',true);assert.match(first.url,/checkout.stripe.com/);
  assert.equal((await shop.checkout(u,'planning',true,'https://example.test',true)).url,first.url);assert.equal(sequence,1);
  const session=sessions.get('cs_test_session1');
  async function event(type,signature=true) {
    const raw=JSON.stringify({id:'evt_test_lifecycle',type,livemode:false,data:{object:session}});
    const header=signature?signatures.webhooks.generateTestHeaderString({payload:raw,secret:baseEnv.STRIPE_WEBHOOK_SECRET}):'t=1,v1=invalid';
    return shop.webhook(Buffer.from(raw),header);
  }
  await assert.rejects(event('checkout.session.completed',false),e=>e.status===400);
  session.status='complete';await event('checkout.session.completed');
  assert.equal((await pg.query('select state from sf_orders where session_id=$1',[session.id])).rows[0].state,'processing');
  assert.equal((await pg.query('select discount_used_at from sf_members where user_id=$1',[alice])).rows[0].discount_used_at,null);
  await assert.rejects(shop.checkout(u,'planning',true,'https://example.test',true),e=>e.status===409);
  session.payment_status='paid';session.payment_intent='pi_confirmed';
  await event('checkout.session.async_payment_succeeded');await event('checkout.session.async_payment_succeeded');
  assert.equal((await pg.query('select state from sf_orders where session_id=$1',[session.id])).rows[0].state,'paid');
  assert.ok((await pg.query('select discount_used_at from sf_members where user_id=$1',[alice])).rows[0].discount_used_at);
  await assert.rejects(shop.checkout(u,'planning',true,'https://example.test',true),e=>e.status===409);
});
