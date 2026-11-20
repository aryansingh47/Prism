/* SIA 1.0 · Prism Travels · guest-friendly conversational travel concierge. */
(() => {
  'use strict';
  const cfg = Object.assign({
    chatbotName: 'SIA', apiBase: 'api', rootBase: '',
    avatar: 'assets/porter-avatar.png', contactUrl: 'contact.html#enquiry-form',
    whatsappUrl: 'https://wa.me/919217711610', packageBrowseUrl: 'packages.html',
    healthUrl: 'api/porter-health.php'
  }, window.PRISM_PORTER_CONFIG || {});
  // Keep the existing endpoint paths for backwards compatibility; SIA is the public brand.
  // Older HTML files may still declare Porter in PRISM_PORTER_CONFIG. Override it here.
  cfg.chatbotName = 'SIA';
  cfg.avatar = (cfg.rootBase || '') + 'assets/sia-avatar.png';

  const svg = (type, size = 19) => {
    const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
    const paths = {
      chat: '<path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.7-.8L3 21l1.8-4.8A8.5 8.5 0 1 1 20 11.5Z"/><path d="M8 11.5h8"/>',
      close: '<path d="M5 5 19 19M19 5 5 19"/>',
      send: '<path d="m3 20 18-8L3 4l3 8-3 8Z"/><path d="M6 12h15"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
      compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
      form: '<path d="M8 3h8l4 4v14H4V3h4Z"/><path d="M16 3v5h4M8 12h8M8 16h6"/>',
      user: '<path d="M20 20a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>',
      whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.7 7.1L3 20l1.4-5.3A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.4 3 3 5.5 6.5 6.5"/>',
      map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      expand: '<path d="M8 3H3v5M3 3l7 7M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7M16 21h5v-5M21 21l-7-7"/>',
      restore: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M3 9V5a2 2 0 0 1 2-2h4M21 15v4a2 2 0 0 1-2 2h-4"/>',
      minimize: '<path d="M5 12h14"/>'
    };
    return `<svg ${common}>${paths[type] || paths.info}</svg>`;
  };
  const state = { open:false, expanded:false, view:'chat', busy:false, history:[], started:false, pending:null, generation:0, lastFocus:null };
  const app = document.createElement('div');
  app.className = 'porter-root';
  const base = cfg.rootBase || '';
  const withinSite = (path) => {
    if (!path) return base + 'packages.html';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/') || path.startsWith('../')) return path;
    return base + path;
  };
  const endpoint = (file) => cfg.apiBase.replace(/\/$/,'') + '/' + file;
  const asset = (value) => value;

  function init(){
    app.innerHTML = `
      <button type="button" class="porter-launcher" aria-label="Ask SIA, Prism's travel assistant" aria-expanded="false" aria-controls="porter-panel">
        <img src="${asset(cfg.avatar)}" alt="" width="49" height="49" class="porter-launcher__figure">
        <span class="porter-launcher__copy"><strong>Ask SIA</strong><small>Your travel concierge</small></span>
        <span class="porter-launcher__arrow">${svg('arrow',17)}</span>
      </button>
      <section class="porter-panel" id="porter-panel" role="dialog" aria-label="SIA travel assistant" aria-modal="false" hidden>
        <header class="porter-header">
          <img class="porter-header__avatar" src="${asset(cfg.avatar)}" width="50" height="50" alt="">
          <div class="porter-header__title"><strong>SIA</strong><span><i class="porter-status-dot" data-porter-dot></i><span data-porter-status>Checking connection</span></span></div>
          <button type="button" class="porter-header__control" data-porter-new title="Start a new conversation" aria-label="New conversation">${svg('plus')}</button>
          <button type="button" class="porter-header__control" data-sia-resize title="Maximise chat" aria-label="Maximise chat" aria-pressed="false">${svg('expand')}</button>
          <button type="button" class="porter-header__control" data-porter-close title="Minimise chat" aria-label="Minimise chat">${svg('minimize')}</button>
        </header>
        <div class="porter-main">
          <section class="porter-chat-view" data-porter-chat-view>
            <div class="porter-messages" role="log" aria-live="polite" aria-relevant="additions text" data-porter-messages>
              <div class="porter-intro"><div class="porter-intro__eyebrow">YOUR JOURNEY STARTS HERE</div><h2>Where shall we take you?</h2><p>I'm SIA. Ask me about Prism packages, destinations, budgets or travel ideas. I can help you narrow down the possibilities. Please don’t share passwords or payment details here.</p></div>
              <div class="porter-starters" data-porter-starters>
                <button type="button" data-porter-prompt="Recommend a winter holiday for two people"><span>${svg('compass')}</span>Winter escapes</button>
                <button type="button" data-porter-prompt="Compare Jaipur and Munnar for a December holiday"><span>${svg('map')}</span>Compare two places</button>
                <button type="button" data-porter-prompt="Help me choose a holiday based on my budget"><span>${svg('chat')}</span>Plan around my budget</button>
              </div>
            </div>
            <div class="porter-compose-wrap">
              <form class="porter-compose" data-porter-chat-form>
                <label class="porter-sr-only" for="porter-message-input">Message SIA</label>
                <textarea id="porter-message-input" rows="1" maxlength="1700" placeholder="Ask SIA anything about your trip…" required></textarea>
                <button type="submit" class="porter-send" data-porter-send aria-label="Send message">${svg('send',19)}</button>
              </form>
              <p class="porter-disclaimer">Travel suggestions are indicative. Avoid sharing sensitive information in chat. <a href="${withinSite('privacy.html')}" target="_blank" rel="noopener">Privacy</a></p>
            </div>
          </section>
          <section class="porter-lead-view" data-porter-lead-view hidden>
            <div class="porter-lead-header"><span>PERSONALISED ASSISTANCE</span><h2>Tell us about your journey.</h2><p>We'll send your request to Prism's travel team. No account required.</p></div>
            <form class="porter-lead-form" data-porter-lead-form>
              <div class="porter-form-row"><label>First name *<input name="first_name" required maxlength="80" autocomplete="given-name"></label><label>Last name *<input name="last_name" required maxlength="80" autocomplete="family-name"></label></div>
              <label>Email address *<input type="email" name="email" required maxlength="254" autocomplete="email"></label>
              <div class="porter-form-row"><label>Phone / WhatsApp<input name="phone" maxlength="30" autocomplete="tel"></label><label>Travellers (adults) *<input name="adults" type="number" min="1" max="100" value="2" required></label></div>
              <div class="porter-form-row"><label>Destination or package *<input name="destination" required maxlength="160" placeholder="e.g. Goa, Munnar"></label><label>Leaving from<input name="departure_city" maxlength="100" placeholder="e.g. Chandigarh"></label></div>
              <div class="porter-form-row"><label>Departure date<input name="start_date" type="date"></label><label>Return date<input name="end_date" type="date"></label></div>
              <div class="porter-form-row"><label>Approx. total budget (INR)<input name="budget" type="number" min="0" step="500" placeholder="e.g. 80000"></label><label>Stay preference<select name="accommodation"><option value="">Not sure</option><option>Comfort / value</option><option>Premium</option><option>Luxury</option><option>Mixed</option></select></label></div>
              <label>What would you like us to plan? *<textarea name="message" rows="3" minlength="10" maxlength="4000" required placeholder="Describe your dates, interests, travellers and requirements"></textarea></label>
              <label>Preferred contact<select name="contact_method"><option>Email</option><option>WhatsApp</option><option>Phone</option></select></label>
              <label class="porter-consent"><input name="consent" type="checkbox" required><span>I agree that Prism may use these details to respond to my travel enquiry. <a href="${withinSite('privacy.html')}" target="_blank" rel="noopener">Privacy notice</a>.</span></label>
              <p class="porter-lead-status" data-porter-lead-status role="status" aria-live="polite"></p>
              <button type="submit" class="porter-lead-submit">Send my enquiry ${svg('arrow',17)}</button>
            </form>
          </section>
        </div>
        <footer class="porter-footer">
          <button type="button" class="porter-footer__action" data-porter-view="chat">${svg('chat',17)} <span>Chat</span></button>
          <button type="button" class="porter-footer__action" data-porter-view="enquiry">${svg('form',17)} <span>Plan an enquiry</span></button>
          <a class="porter-footer__action" href="${cfg.whatsappUrl}" target="_blank" rel="noopener noreferrer">${svg('user',17)} <span>Human help</span></a>
        </footer>
      </section>`;
    document.body.appendChild(app);
    app.querySelector('.porter-launcher').addEventListener('click', () => toggle(true));
    app.querySelector('[data-porter-close]').addEventListener('click', () => toggle(false));
    app.querySelector('[data-sia-resize]').addEventListener('click', () => setExpanded(!state.expanded));
    app.querySelector('[data-porter-new]').addEventListener('click', newConversation);
    app.querySelector('[data-porter-chat-form]').addEventListener('submit', submitMessage);
    app.querySelector('[data-porter-lead-form]').addEventListener('submit', submitLead);
    app.querySelectorAll('[data-porter-view]').forEach(el => el.addEventListener('click', () => showView(el.dataset.porterView)));
    app.querySelectorAll('[data-porter-prompt]').forEach(el => el.addEventListener('click', () => ask(el.dataset.porterPrompt)));
    const input=app.querySelector('#porter-message-input');
    input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) {e.preventDefault();app.querySelector('[data-porter-chat-form]').requestSubmit();} });
    input.addEventListener('input', () => { input.style.height='auto';input.style.height=Math.min(input.scrollHeight,105)+'px'; });
    document.addEventListener('keydown', e => {if (e.key==='Escape' && state.open) toggle(false);});
    const local = location.pathname.toLowerCase();
    if (local.includes('/packages/')) {
      const title=document.querySelector('h1')?.textContent?.trim();
      if(title) app.querySelector('[name=destination]').value=title;
    }
    refreshHealth();
  }
  function setExpanded(expanded) {
    state.expanded = Boolean(expanded);
    app.classList.toggle('is-expanded', state.expanded);
    const button = app.querySelector('[data-sia-resize]');
    button.innerHTML = svg(state.expanded ? 'restore' : 'expand');
    button.setAttribute('aria-pressed', String(state.expanded));
    button.setAttribute('aria-label', state.expanded ? 'Restore chat size' : 'Maximise chat');
    button.title = state.expanded ? 'Restore chat size' : 'Maximise chat';
    scrollBottom();
  }
  function toggle(open){
    state.open=open;
    const panel=app.querySelector('.porter-panel');
    const launcher=app.querySelector('.porter-launcher');
    panel.hidden=!open;launcher.hidden=open;
    launcher.setAttribute('aria-expanded',String(open));
    app.classList.toggle('is-open',open);
    if(open){state.lastFocus=document.activeElement;requestAnimationFrame(()=>app.querySelector(state.view==='enquiry'?'[name=first_name]':'#porter-message-input').focus());}
    else{launcher.focus();}
  }
  function showView(view){
    state.view=view==='enquiry'?'enquiry':'chat';
    if (state.view === 'enquiry') {
      const notes = app.querySelector('[name=message]');
      const messages = state.history.filter(x=>x.role==='user').slice(-2).map(x=>x.content);
      if (notes && !notes.value && messages.length) notes.value = messages.join(' | ').slice(0,4000);
    }
    app.querySelector('[data-porter-chat-view]').hidden=state.view!=='chat';
    app.querySelector('[data-porter-lead-view]').hidden=state.view!=='enquiry';
    app.querySelectorAll('[data-porter-view]').forEach(el=>el.classList.toggle('is-selected',el.dataset.porterView===state.view));
    app.querySelector(state.view==='chat'?'#porter-message-input':'[name=first_name]').focus();
  }
  function clearPrompts(){
    const intro=app.querySelector('.porter-intro');
    const starters=app.querySelector('[data-porter-starters]');
    if(intro) intro.hidden=true;
    if(starters) starters.hidden=true;
    state.started=true;
  }
  function addBubble(role,text,kind='normal'){
    const wrap=document.createElement('div');wrap.className='porter-bubble porter-bubble--'+role;
    if(kind==='error') wrap.classList.add('porter-bubble--error');
    const content=document.createElement('div');content.className='porter-bubble__content';content.textContent=text;
    wrap.appendChild(content);app.querySelector('[data-porter-messages]').appendChild(wrap);scrollBottom();
    return wrap;
  }
  function scrollBottom(){const el=app.querySelector('[data-porter-messages]');el.scrollTop=el.scrollHeight;}
  function addCards(items){
    if(!Array.isArray(items) || !items.length) return;
    const wrap=document.createElement('div');wrap.className='porter-cards';
    items.slice(0,2).forEach(card=>{
      const a=document.createElement('a');a.className='porter-card';a.href=withinSite(card.href);
      const title=document.createElement('strong');title.textContent=card.title||'View itinerary';a.appendChild(title);
      const details=document.createElement('span');details.textContent=[card.duration,card.price].filter(Boolean).join(' · ');a.appendChild(details);
      const more=document.createElement('small');more.textContent=(card.on_request?'Available on request · ':'')+'View itinerary ↗';a.appendChild(more);
      wrap.appendChild(a);
    });
    app.querySelector('[data-porter-messages]').appendChild(wrap);scrollBottom();
  }
  async function ask(text){
    if(state.busy) return;
    clearPrompts();showView('chat');
    const history=state.history.slice(-10);
    addBubble('user',text);state.history.push({role:'user',content:text});
    state.busy=true;app.querySelector('[data-porter-send]').disabled=true;
    const generation=state.generation;
    const pending=document.createElement('div');pending.className='porter-typing';pending.setAttribute('role','status');pending.setAttribute('aria-label','SIA is thinking');
    pending.innerHTML='<span></span><span></span><span></span>';
    app.querySelector('[data-porter-messages]').appendChild(pending);scrollBottom();
    const controller=new AbortController();state.pending=controller;
    try{
      const res=await fetch(endpoint('porter-chat.php'),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history}),signal:controller.signal});
      let json=null;try{json=await res.json();}catch{}
      if(!res.ok||!json?.ok)throw Object.assign(new Error(json?.message||'Unable to connect to SIA. Please try again.'),{code:json?.code||'NETWORK_ERROR'});
      if(generation!==state.generation)return;
      addBubble('assistant',json.reply);addCards(json.cards);
      state.history.push({role:'assistant',content:json.reply});
      setConnection('connected','AI connected · '+(json.model||'Terra'));
    }catch(err){
      if(err.name==='AbortError'||generation!==state.generation)return;
      const message=err.message||'SIA is unavailable at the moment.';
      addBubble('assistant',message+(err.code?' ('+err.code+')':''),'error');
      setConnection('error','Connection needs attention');
    }finally{
      pending.remove();state.busy=false;state.pending=null;
      app.querySelector('[data-porter-send]').disabled=false;scrollBottom();
    }
  }
  function submitMessage(e){e.preventDefault();const input=app.querySelector('#porter-message-input');const text=input.value.trim();if(!text||state.busy)return;input.value='';input.style.height='auto';ask(text);}
  function newConversation(){
    state.pending?.abort();state.generation++;state.busy=false;state.history=[];state.started=false;
    const original=app.querySelector('[data-porter-messages]');original.replaceChildren();
    const welcome=document.createElement('div');welcome.className='porter-intro';welcome.innerHTML='<div class="porter-intro__eyebrow">A FRESH JOURNEY</div><h2>Where would you like to go?</h2><p>Tell me what kind of holiday you have in mind.</p>';
    const starter=document.createElement('div');starter.className='porter-starters';
    [['Winter escapes','Recommend a winter holiday for two people','compass'],['Compare destinations','Compare Jaipur and Munnar','map'],['Budget planning','Help me choose a holiday based on my budget','chat']].forEach(([label,prompt,icon])=>{
      const b=document.createElement('button');b.type='button';b.innerHTML='<span>'+svg(icon)+'</span>'+label;b.onclick=()=>ask(prompt);starter.appendChild(b);
    });
    starter.dataset.porterStarters='';original.append(welcome,starter);showView('chat');
  }
  async function refreshHealth(){
    try{
      const r=await fetch(cfg.healthUrl,{credentials:'same-origin',cache:'no-store'});const data=await r.json();
      if(data?.ready)setConnection('ready','Ready to help');else setConnection('error','AI setup incomplete');
    }catch{setConnection('error','Connection unavailable');}
  }
  function setConnection(kind,label){
    const dot=app.querySelector('[data-porter-dot]');dot.dataset.kind=kind;
    app.querySelector('[data-porter-status]').textContent=label;
  }
  async function submitLead(event){
    event.preventDefault();const form=event.currentTarget;
    if(!form.reportValidity())return;
    const status=app.querySelector('[data-porter-lead-status]');const button=app.querySelector('.porter-lead-submit');
    status.textContent='Submitting your enquiry securely…';status.dataset.kind='pending';button.disabled=true;
    try{
      const sessionResponse=await fetch(endpoint('session.php'),{credentials:'same-origin',cache:'no-store'});
      const session=await sessionResponse.json();if(!sessionResponse.ok||!session?.ok||!session?.csrf)throw new Error('The Prism enquiry service is not ready on this server. Please contact our team directly.');
      const values=Object.fromEntries(new FormData(form).entries());
      const payload={
        first_name:values.first_name||'',last_name:values.last_name||'',email:values.email||'',phone:values.phone||'',
        company:'',interest:'Personal holiday',departure_city:values.departure_city||'',destination:values.destination||'',
        start_date:values.start_date||'',end_date:values.end_date||'',flexible_dates:!values.start_date,
        adults:Number(values.adults||2),children:0,budget:values.budget?Number(values.budget):null,currency:'INR',
        accommodation:values.accommodation||'',contact_method:values.contact_method||'Email',message:values.message||'',
        consent:values.consent==='on',website:''
      };
      const response=await fetch(endpoint('enquiries.php'),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf},body:JSON.stringify(payload)});
      const json=await response.json();if(!response.ok||!json?.ok)throw new Error(json?.message||'The enquiry could not be submitted.');
      status.textContent='Enquiry received. Reference: '+(json.reference||'Please check your email')+'. Our travel team will follow up.';
      status.dataset.kind='success';form.reset();
      addBubble('assistant','Your travel enquiry was submitted successfully. Reference: '+json.reference+'. Our team will review it and get in touch.');
      state.history.push({role:'assistant',content:'Your enquiry was submitted with reference '+json.reference});
    }catch(err){status.textContent=err.message||'Unable to send the enquiry. Please contact Prism directly.';status.dataset.kind='error';}
    finally{button.disabled=false;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
