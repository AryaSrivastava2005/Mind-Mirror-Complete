const {getChatbotReply} = require('./chatbot');
const INSTRUCTIONS = `You are Mind Mirror, an AI assistant for a self-reflection website, not a human or therapist.
Respond warmly and naturally in the user's language (including Hindi or Hinglish). Usually use 2–4 short paragraphs, acknowledge the user's specific situation, offer one practical next step, and ask at most one relevant follow-up. Avoid repetitive disclaimers, canned sympathy, judgement and excessive lists. Answer general everyday questions as well as website questions; be honest about uncertainty.
Support reflection on emotions, study, routines, relationships, music and stress. Never diagnose mental illness or infer a person's mental health, personality or exact emotional state from a song or an informal test score. Do not prescribe medication or claim to provide therapy. Do not encourage dependency or claim exclusive understanding. Encourage real-world support when appropriate. For immediate self-harm or danger, respond compassionately, encourage local emergency help and contacting someone trusted nearby; do not provide harmful instructions. Do not affirm delusional beliefs. You cannot contact emergency services yourself.
Site facts: The Tests sidebar has Stress Analysis and Mental Health Analysis (60 items each, five frequency answers). Sample Tests has Personality (15 five-point items), Basic Psychological (15 Agree/Disagree), and Leadership, Stress & Teamwork (15 Agree/Disagree). All completed tests save to the dashboard. These original questionnaires are not clinically validated. Percentages reflect agreement, not measured ability or health. Music & Mood searches the iTunes catalog and gives genre/type reflection prompts; the listener reports their own feeling. Music check-ins save only with consent. Dark Mode is in the navigation bar. Accounts/results use server-side JSON in this local prototype, readable by server administrators.
You cannot access accounts, results, passwords, the page contents, files, live web data or music catalog through this chat. Only messages typed in this chat are supplied. Do not pretend to have inspected results or taken actions. Ask users to share only the relevant non-sensitive detail if needed. Do not ask for passwords or API keys. Chat is kept temporarily in server memory, not account history. Give plain text without HTML, Markdown tables or links you cannot verify.`;
function createChatService({fetcher=(...args)=>fetch(...args), config=()=>({key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4.1-mini'}), now=Date.now}={}) {
 const sessions=new Map(),limits=new Map();const ttl=30*60*1000;
 function prune(){const t=now();for(const [k,s] of sessions)if(!s.busy && t-s.updated>ttl)sessions.delete(k);for(const [k,s] of limits)if(t-s.start>=60000)limits.delete(k);}
 function state(id){prune();return {mode:config().key?'llm':'basic',messages:sessions.get(id)?.messages||[]};}
 function clear(id){const s=sessions.get(id);if(s?.busy)return false;sessions.delete(id);return true;}
 async function reply(id,userId,message){
  prune();const t=now();let s=sessions.get(id);
  if(s?.busy)return {status:409,error:'A reply is already on its way. Please wait.'};
  let limit=limits.get(userId);if(!limit){if(limits.size>=1000)return {status:429,error:'Chat is busy. Please try again shortly.'};limit={start:t,count:0};limits.set(userId,limit);}
  if(limit.count>=10)return {status:429,error:'Please wait a minute before sending more messages.'};limit.count++;
  if(!s){if(sessions.size>=500)return {status:503,error:'Chat is busy. Please try again shortly.'};s={messages:[],updated:t,busy:false};sessions.set(id,s);}
  s.busy=true;s.updated=t;
  try {
   const {key,model}=config();let text,mode;
   if(!key){text=getChatbotReply(message);mode='basic';}
   else {
    mode='llm';const response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,store:false,instructions:INSTRUCTIONS,input:[...s.messages.slice(-12),{role:'user',content:message}],max_output_tokens:650})});
    if(!response.ok)return {status:503,error:'The AI service is unavailable. Please try again later. The site owner can check the API key, model access and billing.'};
    const data=await response.json();
    text=(data.output||[]).filter(i=>i.type==='message').flatMap(i=>i.content||[]).map(c=>c.type==='output_text'?c.text:c.type==='refusal'?c.refusal:'').filter(v=>typeof v==='string').join('\n').trim();
    if(!text || data.status==='failed')return {status:503,error:'The AI could not finish a reply. Please try again.'};
    text=text.slice(0,8000);
   }
   s.messages=[...s.messages,{role:'user',content:message},{role:'assistant',content:text}].slice(-12);s.updated=now();
   return {status:200,reply:text,mode};
  }catch{return {status:503,error:'The connection to the AI timed out or failed. Please try again.'};}finally{s.busy=false;}
 }
 return {state,clear,reply};
}
module.exports={createChatService,INSTRUCTIONS};
