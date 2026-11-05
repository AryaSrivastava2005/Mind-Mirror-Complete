const {test}=require('node:test');const assert=require('node:assert/strict');
const {createChatService}=require('../utils/llm-chat');
const ok=text=>({ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]})});
test('LLM uses bounded private context, safe API request and session isolation',async()=>{
 const calls=[];let clock=0;
 const service=createChatService({now:()=>clock,config:()=>({key:'test-only-key',model:'test-model'}),fetcher:async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return ok('Let’s explore one small step.');}});
 assert.equal((await service.reply('a','user-a','I have exams.')).status,200);
 await service.reply('a','user-a','What should I do first?');
 assert.deepEqual(calls[1].body.input.map(m=>m.role),['user','assistant','user']);
 assert.equal(calls[0].body.store,false);assert.equal(calls[0].body.max_output_tokens,650);
 assert.equal(calls[0].url,'https://api.openai.com/v1/responses');
 assert.equal(calls[0].options.redirect,'error');assert.match(calls[0].body.instructions,/Never diagnose/);
 assert.deepEqual(service.state('b').messages,[]);
 for(let i=0;i<6;i++)await service.reply('a','user-a','Next '+i);
 assert.equal(service.state('a').messages.length,12);
 assert.ok(service.clear('a'));assert.equal(service.state('a').messages.length,0);
 await service.reply('b','user-b','Hello');clock=31*60000;assert.equal(service.state('b').messages.length,0);
});
test('LLM outages do not store failed turns or expose provider errors',async()=>{
 const service=createChatService({config:()=>({key:'test',model:'test'}),fetcher:async()=>({ok:false,status:401})});
 const r=await service.reply('a','u','Hello');assert.equal(r.status,503);assert.equal(service.state('a').messages.length,0);
 const empty=createChatService({config:()=>({key:'test',model:'test'}),fetcher:async()=>ok('')});assert.equal((await empty.reply('a','u','Hi')).status,503);
 const offline=createChatService({config:()=>({key:''}),fetcher:()=>{throw new Error('Must not call network');}});
 assert.equal((await offline.reply('a','u','Help with results')).mode,'basic');
});
test('chat rejects concurrent turns, reset during reply, and excess requests',async()=>{
 let finish;const service=createChatService({config:()=>({key:'test',model:'test'}),fetcher:()=>new Promise(resolve=>{finish=resolve;})});
 const first=service.reply('a','u','Hello');assert.equal((await service.reply('a','u','Again')).status,409);assert.equal(service.clear('a'),false);finish(ok('Hi'));await first;
 const limited=createChatService({config:()=>({key:''})});for(let i=0;i<10;i++)assert.equal((await limited.reply('a','u','Hi')).status,200);
 limited.clear('a');assert.equal((await limited.reply('a','u','More')).status,429);
});
