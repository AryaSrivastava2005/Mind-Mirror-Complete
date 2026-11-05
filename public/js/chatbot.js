document.addEventListener('DOMContentLoaded',()=>{
 const fab=document.getElementById('chatbotFab'),panel=document.getElementById('chatbotPanel');if(!fab||!panel)return;
 const form=document.getElementById('chatbotForm'),input=document.getElementById('chatbotInput'),messages=document.getElementById('chatbotMessages'),status=document.getElementById('chatbotStatus'),mode=document.getElementById('chatbotMode'),reset=document.getElementById('chatbotReset');
 let busy=false,loaded=false;
 const controls=[document.getElementById('chatbotSend'),reset,...panel.querySelectorAll('[data-prompt]')];
 function setBusy(value){busy=value;controls.forEach(b=>b.disabled=value);input.disabled=value;messages.setAttribute('aria-busy',String(value));}
 function add(text,role){const el=document.createElement('div');el.className=role==='user'?'user-message':'bot-message';el.textContent=text;messages.append(el);messages.scrollTop=messages.scrollHeight;}
 function welcome(){add('Hi, I’m Mind Mirror’s AI assistant. We can talk through what’s on your mind, explore a small next step, or discuss your test results. Where would you like to start?','assistant');}
 function setMode(value){mode.textContent=value==='llm'?'AI conversation':'Basic guide · AI key not configured';}
 async function request(url,body){const response=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').content}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(40000)});let data;try{data=await response.json();}catch{throw new Error(response.status===403?'Your session expired. Reload this page.':'Chat is unavailable. Please try again.');}if(!response.ok)throw new Error(data.error||'Chat is unavailable. Please try again.');return data;}
 async function open(){panel.hidden=false;panel.classList.add('open');fab.setAttribute('aria-expanded','true');if(!loaded){setBusy(true);try{const data=await request('/chatbot/history');messages.replaceChildren();setMode(data.mode);if(data.messages.length)data.messages.forEach(m=>add(m.content,m.role));else welcome();loaded=true;status.textContent='';}catch(e){status.textContent=e.message;}finally{setBusy(false);}}input.focus();}
 function close(){panel.classList.remove('open');panel.hidden=true;fab.setAttribute('aria-expanded','false');fab.focus();}
 async function send(text){if(busy)return;const clean=text.trim();if(!clean)return;setBusy(true);status.textContent='Thinking…';add(clean,'user');input.value='';try{const data=await request('/chatbot',{message:clean});setMode(data.mode);add(data.reply,'assistant');status.textContent='';}catch(e){status.textContent=e.message+' Your message is below if you want to retry.';input.value=clean;}finally{setBusy(false);input.focus();}}
 fab.onclick=()=>panel.hidden?open():close();document.getElementById('chatbotClose').onclick=close;
 panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 form.onsubmit=e=>{e.preventDefault();send(input.value);};input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(input.value);}});
 panel.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>send(b.dataset.prompt));
 reset.onclick=async()=>{if(busy)return;setBusy(true);try{await request('/chatbot/reset',{});messages.replaceChildren();welcome();status.textContent='New conversation started.';}catch(e){status.textContent=e.message;}finally{setBusy(false);input.focus();}};
});
