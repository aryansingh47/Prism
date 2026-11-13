/* Prism Travels: progressive-enhancement client for first-party enquiries and accounts.
   Never stores passwords or personal data in localStorage. Requires Hostinger PHP API. */
(() => {
  'use strict';
  let session = null;
  const authRoot = document.getElementById('prism-account-root');
  const enquiryForm = document.getElementById('prism-travel-form');
  const staffRoot = document.getElementById('prism-staff-panel');
  const endpoint = name => `api/${name}.php`;

  async function loadSession(reload = false) {
    if (session && !reload) return session;
    const res = await fetch(endpoint('session'), { credentials: 'same-origin', cache: 'no-store' });
    let data;
    try { data = await res.json(); } catch { throw new Error('Account and enquiry services require PHP hosting. They are not available on a static file preview.'); }
    if (!res.ok || !data.ok) throw new Error(data.message || 'Service unavailable.');
    session = data;
    return data;
  }
  async function api(path, data) {
    const state = await loadSession();
    const res = await fetch(endpoint(path), {
      method: 'POST', credentials:'same-origin', cache:'no-store',
      headers: { 'Content-Type':'application/json', 'X-CSRF-Token': state.csrf },
      body:JSON.stringify(data)
    });
    let result;
    try { result=await res.json(); } catch { throw new Error('Unexpected server response. Please try again later.'); }
    if (!res.ok || !result.ok) {
      if (result.code === 'CSRF') session = null;
      throw new Error(result.message || 'Request unsuccessful.');
    }
    return result;
  }
  function message(el, msg, kind) {
    if (!el) return;
    el.textContent=msg;
    el.classList.toggle('is-error',kind==='error');
    el.classList.toggle('is-success',kind==='success');
  }
  function toObject(form) {
    const out = Object.fromEntries(new FormData(form).entries());
    for (const key of ['consent','terms','flexible_dates']) out[key] = form.elements[key]?.checked === true;
    return out;
  }
  function node(tag, className, value) {
    const el=document.createElement(tag);
    if (className) el.className=className;
    if (value!==undefined) el.textContent=String(value);
    return el;
  }
  function editNav(user) {
    document.querySelectorAll('[data-account-link]').forEach(link => {
      if (user) link.textContent = 'My Account';
      else link.textContent = 'Log In / Sign Up';
    });
  }
  async function initialiseEnquiry() {
    const resultEl=document.getElementById('prism-form-status');
    let ready=true;
    try {
      const state=await loadSession();
      editNav(state.user);
      if (state.user) {
        ['first_name','last_name','email'].forEach(key => {
          const field=enquiryForm.elements[key];
          if (field && !field.value) field.value=state.user[key] || '';
        });
      }
    } catch (error) {
      ready=false;
      message(resultEl,'Online enquiries are not yet configured on this server. Please contact the Prism team directly.','error');
    }
    enquiryForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;
      if (!ready) { message(resultEl,'Online enquiries are unavailable until server setup is completed.','error');return; }
      const button=enquiryForm.querySelector('button[type=submit]');
      button.disabled=true;
      message(resultEl,'Sending your enquiry…');
      try {
        const result=await api('enquiries',toObject(enquiryForm));
        message(resultEl,`${result.message} Reference: ${result.reference}. Keep this for your records.`,'success');
        enquiryForm.reset();
        resultEl.scrollIntoView({behavior:'smooth',block:'center'});
      } catch (error) {
        message(resultEl,error.message,'error');
      } finally { button.disabled=false; }
    });
  }
  function authTab(tab) {
    const tabs=authRoot.querySelectorAll('[data-auth-tab][role=tab]');
    const forms=authRoot.querySelectorAll('[data-auth-form]');
    tabs.forEach(t=>{const active=t.dataset.authTab===tab;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',String(active));});
    forms.forEach(f=>{f.hidden=f.dataset.authForm!==tab;});
    message(authRoot.querySelector('[data-account-message]'),'');
  }
  async function showDashboard() {
    const state=await loadSession();
    if (!state.user) return;
    const dashboard=document.getElementById('prism-account-dashboard');
    authRoot.querySelector('.prism-auth-tabs').hidden=true;
    authRoot.querySelectorAll('[data-auth-form]').forEach(f=>f.hidden=true);
    dashboard.hidden=false;
    document.getElementById('prism-welcome').textContent=`Welcome, ${state.user.first_name}.`;
    authRoot.querySelector('[data-staff-link]').hidden=!state.user.staff;
    editNav(state.user);
    const history=document.getElementById('prism-enquiry-history');
    history.replaceChildren(node('p','', 'Loading your enquiries…'));
    try {
      const res=await fetch(endpoint('enquiries'),{credentials:'same-origin',cache:'no-store'});
      const data=await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Unable to load enquiries.');
      history.replaceChildren();
      if (!data.enquiries?.length) {
        history.append(node('p','', 'You have no enquiries linked to this account yet. Guest enquiries submitted before sign-up are not automatically linked.'));
      } else {
        data.enquiries.forEach(item=>{
          const card=node('article','prism-history-card');
          card.append(node('strong','',`#${item.id} · ${item.interest}`));
          card.append(node('p','',`${item.destination || 'Destination to be confirmed'} · ${item.status}`));
          card.append(node('small','',new Date((item.created_at||'').replace(' ','T')+'Z').toLocaleDateString() || ''));
          history.append(card);
        });
      }
    } catch (error) {history.replaceChildren(node('p','prism-form-alert is-error',error.message));}
  }
  async function initialiseAccount() {
    const notice=authRoot.querySelector('[data-account-message]');
    authRoot.querySelector('[data-logout]').addEventListener('click',async()=>{
      try {await api('auth',{action:'logout'});session=null;location.href='account.html';}
      catch(error){message(notice,error.message,'error');}
    });
    const params=new URLSearchParams(location.search);
    try {
      const state=await loadSession();
      if (state.user) {await showDashboard();return;}
      const verify=params.get('verified');
      if (verify==='1') message(notice,'Email verified. You can now log in.','success');
      if (verify==='invalid') message(notice,'The verification link is invalid or has expired.','error');
    } catch (error) {message(notice,error.message,'error');return;}
    const reset=params.get('reset');
    if (reset) { authTab('reset'); message(notice,'Choose a new password.'); }
    authRoot.querySelectorAll('[data-auth-tab]').forEach(button=>button.addEventListener('click',()=>authTab(button.dataset.authTab)));
    authRoot.querySelectorAll('[data-auth-form]').forEach(form => form.addEventListener('submit',async event=>{
      event.preventDefault();
      if (!form.reportValidity()) return;
      const action=form.dataset.authForm;
      const button=form.querySelector('button[type=submit]'); button.disabled=true;
      message(notice,'Working on your request…');
      try {
        const payload=toObject(form);
        payload.action=action==='forgot'?'forgot':action;
        if (action==='reset') payload.token=reset;
        const result=await api('auth',payload);
        if (result.csrf) session.csrf=result.csrf;
        if (action==='login') {session=null;await loadSession(true);await showDashboard();}
        else if (action==='reset') {history.replaceState(null,'','account.html');authTab('login');message(notice,result.message,'success');}
        else {form.reset();message(notice,result.message,'success');}
      } catch (error) {message(notice,error.message,'error');}
      finally {button.disabled=false;}
    }));
  }
  async function initialiseStaff() {
    const status=staffRoot.querySelector('[data-staff-message]');
    const list=document.getElementById('prism-staff-list');
    async function refresh() {
      list.replaceChildren(node('p','', 'Loading enquiries…'));
      try {
        const state=await loadSession();
        if (!state.user?.staff) throw new Error('Staff access requires a verified, authorised Prism account.');
        const res=await fetch(endpoint('admin'),{credentials:'same-origin',cache:'no-store'});
        const data=await res.json();
        if (!res.ok || !data.ok) throw new Error(data.message || 'Unable to load staff records.');
        list.replaceChildren();
        if (!data.enquiries.length) {list.append(node('p','', 'No enquiries yet.'));return;}
        for (const item of data.enquiries) {
          const card=node('article','prism-staff-enquiry');
          const header=node('div','prism-staff-enquiry__head');
          header.append(node('strong','',`#${item.id} · ${item.first_name} ${item.last_name}`));
          header.append(node('small','',item.created_at));card.append(header);
          for (const [label,value] of Object.entries({Email:item.email,Phone:item.phone,Company:item.company,Interest:item.interest,From:item.departure_city,Destination:item.destination,Dates:`${item.start_date||'Flexible'} – ${item.end_date||'Flexible'}`,Travellers:`${item.adults} adults, ${item.children} children`,Budget:item.budget?`${item.currency} ${item.budget}`:'Not specified',Accommodation:item.accommodation,'Preferred contact':item.contact_method,Message:item.message})) {
            if (value) {const row=node('p','');row.append(node('b','',label+': '),document.createTextNode(value));card.append(row);}
          }
          const wrap=node('div','prism-staff-status');wrap.append(node('label','', 'Status'));
          const select=node('select');select.setAttribute('aria-label',`Status for enquiry ${item.id}`);
          ['new','contacted','closed'].forEach(value=>{const option=node('option','',value);option.value=value;option.selected=value===item.status;select.append(option);});
          select.addEventListener('change',async()=>{
            select.disabled=true;
            try {await api('admin',{id:Number(item.id),status:select.value});item.status=select.value;message(status,`Enquiry #${item.id} updated.`,'success');}
            catch(err){select.value=item.status;message(status,err.message,'error');}
            finally {select.disabled=false;}
          });
          wrap.append(select);card.append(wrap);list.append(card);
        }
      } catch (error) {list.replaceChildren();message(status,error.message,'error');}
    }
    staffRoot.querySelector('[data-staff-refresh]').addEventListener('click',refresh);
    refresh();
  }
  if (enquiryForm) initialiseEnquiry();
  if (authRoot) initialiseAccount();
  if (staffRoot) initialiseStaff();
})();
