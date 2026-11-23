/* First-party Prism partner onboarding. No private business data is stored in localStorage. */
(() => {
  'use strict';
  const root = document.querySelector('[data-partner-app]');
  const admin = document.querySelector('#partner-review');
  if (!root && !admin) return;
  const endpoint = 'api/partners.php';
  let csrfToken = '';
  function status(message, error = false, target = root?.querySelector('[data-status]') || admin?.querySelector('[data-admin-status]')) {
    if (!target) return;
    target.textContent = message;
    target.classList.toggle('is-error', error);
    target.classList.toggle('is-success', !error && !!message);
  }
  async function get(action = 'session') {
    const res = await fetch(`${endpoint}?action=${encodeURIComponent(action)}`, { credentials: 'same-origin', cache: 'no-store' });
    const body = await res.json();
    if (!res.ok || !body.ok) throw Error(body.message || 'Unable to load the partner service.');
    if (body.csrf) csrfToken = body.csrf;
    return body;
  }
  async function post(data) {
    const res = await fetch(endpoint, {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(data)
    });
    let body;
    try { body = await res.json(); } catch { throw Error('Unexpected server response. Please try again.'); }
    if (!res.ok || !body.ok) {
      if (body.code === 'CSRF') await get();
      throw Error(body.message || 'Request unsuccessful.');
    }
    return body;
  }
  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }
  function dataOf(form) {
    const obj = Object.fromEntries(new FormData(form).entries());
    if (form.elements.consent) obj.consent = form.elements.consent.checked === true;
    return obj;
  }
  function checkPhone(form) {
    const input = form.elements.phone;
    if (!input) return true;
    const digits = input.value.replace(/\D/g, '').length;
    input.setCustomValidity(digits >= 10 && digits <= 15 ? '' : 'Please enter a phone number with 10–15 digits.');
    return input.reportValidity();
  }
  function toggleForm(name) {
    if (!root) return;
    root.querySelectorAll('[data-form="register"], [data-form="login"], [data-form="reset_password"]').forEach(form => { form.hidden = form.dataset.form !== name; });
    root.querySelectorAll('[data-tab]').forEach(tab => {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(on));
    });
    status('');
  }
  function tag(text) { const span = make('span', text, 'partner-status-tag'); return span; }
  function renderOffer(offer, own = true) {
    const card = make('article', undefined, 'partner-offer');
    const head = make('div', undefined, 'partner-offer__top');
    head.append(make('strong', offer.name), tag(offer.status)); card.append(head);
    card.append(make('p', offer.description));
    const details = [offer.offer_type, offer.capacity ? `Capacity ${offer.capacity}` : '', offer.indicative_price ? `Indicative ₹${Number(offer.indicative_price).toLocaleString('en-IN')}` : ''].filter(Boolean).join(' · ');
    card.append(make('small', details));
    if (own) {
      const del = make('button', 'Remove offering', 'partner-secondary'); del.type = 'button';
      del.addEventListener('click', async () => {
        if (!window.confirm('Remove this offering from Prism?')) return;
        del.disabled = true;
        try { await post({ action: 'delete_offer', id: Number(offer.id) }); await refresh(); status('Offering removed.'); }
        catch (e) { status(e.message, true); del.disabled = false; }
      }); card.append(del);
    }
    return card;
  }
  function renderDashboard(data) {
    const p = data.partner;
    root.querySelector('[data-dashboard]').hidden = !p;
    root.querySelectorAll('[data-form="register"], [data-form="login"], [data-form="reset_password"], .partner-tabs').forEach(el => { el.hidden = !!p; });
    if (!p) return;
    root.querySelector('[data-business-name]').textContent = p.business_name;
    root.querySelector('[data-partner-state]').textContent = `${p.category.replaceAll('_', ' ')} · ${p.city}, ${p.state}`;
    const panel = root.querySelector('[data-application-status]'); panel.replaceChildren();
    panel.append(tag(p.status));
    if (!p.email_verified_at) panel.append(make('p', 'Please verify your email address using the link we sent before our team can approve your business.'));
    else if (p.status === 'pending') panel.append(make('p', 'Your business is under manual review. A Prism representative will contact you if further details are needed.'));
    else if (p.status === 'approved') panel.append(make('p', 'Your business has been approved for the partner network. You may submit service offerings for further review.'));
    else panel.append(make('p', 'Your supplier status has been updated. Contact Prism if you need further assistance.'));
    if (p.reviewer_note) panel.append(make('p', `Review note: ${p.reviewer_note}`));
    const workspace = root.querySelector('[data-offer-workspace]'); workspace.hidden = !(p.status === 'approved' && !!p.email_verified_at);
    const list = root.querySelector('[data-offer-list]'); list.replaceChildren();
    if (!data.offers.length) list.append(make('p', 'No offerings submitted yet.', 'partner-muted'));
    else data.offers.forEach(o => list.append(renderOffer(o)));
  }
  async function refresh() { const data = await get('session'); if (root) renderDashboard(data); }
  async function bootPartner() {
    try { await refresh(); } catch (e) { status(e.message, true); return; }
    const resetToken = new URLSearchParams(window.location.search).get('reset');
    if (resetToken) {
      if (/^[a-f0-9]{64}$/.test(resetToken)) {
        root.querySelector('[data-form="reset_password"] [name="token"]').value = resetToken;
        toggleForm('reset_password');
      } else status('The reset link is invalid.', true);
      history.replaceState({}, '', 'partners.html');
    }
    const flag = new URLSearchParams(window.location.search).get('verified');
    if (flag === '1') status('Email verified. Please sign in; your business may still be awaiting staff approval.');
    if (flag === 'invalid') status('That verification link is invalid or expired. Request a new link from Partner sign in.', true);
    root.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => toggleForm(button.dataset.tab)));
    const category = root.querySelector('[name="category"]');
    function categoryUpdate() {
      const eligible = ['hotel', 'motel', 'resort'].includes(category.value);
      const field = root.querySelector('[data-rating-field]'); field.hidden = !eligible;
      if (!eligible) field.querySelector('select').value = '';
    }
    category.addEventListener('change', categoryUpdate); categoryUpdate();
    root.querySelectorAll('form[data-form]').forEach(form => form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || !checkPhone(form)) return;
      const button = form.querySelector('button[type="submit"]'); button.disabled = true;
      status('Submitting…');
      try {
        const response = await post({ ...dataOf(form), action: form.dataset.form });
        status(response.message || 'Request completed.');
        if (form.dataset.form === 'register') { form.reset(); categoryUpdate(); toggleForm('login'); status(response.message); }
        else if (form.dataset.form === 'login') await refresh();
        else if (form.dataset.form === 'reset_password') { form.reset(); toggleForm('login'); status(response.message); }
        else if (form.dataset.form === 'create_offer') { form.reset(); await refresh(); status(response.message); }
      } catch (e) { status(e.message, true); }
      finally { button.disabled = false; }
    }));
    root.querySelector('[data-logout]').addEventListener('click', async () => {
      try { await post({ action: 'logout' }); await refresh(); toggleForm('login'); }
      catch (e) { status(e.message, true); }
    });
    root.querySelector('[data-forgot]').addEventListener('click', async () => {
      const email = root.querySelector('[data-forgot-email]').value.trim();
      if (!email) { status('Enter the registered email address.', true); return; }
      try { const response = await post({ action: 'request_reset', email }); status(response.message); }
      catch (e) { status(e.message, true); }
    });
    root.querySelector('[data-resend]').addEventListener('click', async () => {
      const email = root.querySelector('[data-resend-email]').value.trim();
      if (!email) { status('Please enter your email address.', true); return; }
      try { const response = await post({ action: 'resend_verification', email }); status(response.message); }
      catch (e) { status(e.message, true); }
    });
  }
  function controls(type, id, statusOptions, field, state, note = '') {
    const container = make('div', undefined, 'partner-admin-actions');
    const selector = make('select'); selector.setAttribute('aria-label', `Review status of ${type} ${id}`);
    for (const option of statusOptions) {
      const el = make('option', option, undefined); el.value = option; selector.append(el);
    }
    selector.value = state; container.append(selector);
    const noteBox = type === 'partner' ? make('textarea') : null;
    if (noteBox) { noteBox.rows = 2; noteBox.maxLength = 500; noteBox.value = note; noteBox.placeholder = 'Optional internal review note'; container.append(noteBox); }
    const button = make('button', 'Save review', 'partner-secondary'); button.type = 'button'; container.append(button);
    button.addEventListener('click', async () => {
      if (!window.confirm(`Set ${type} #${id} to ${selector.value}?`)) return;
      button.disabled = true;
      try {
        await post({ action: type === 'partner' ? 'admin_partner' : 'admin_offer', id: Number(id), status: selector.value, reviewer_note: noteBox?.value || '' });
        status('Review saved.'); await bootAdmin(true);
      } catch (e) { status(e.message, true); button.disabled = false; }
    });
    return container;
  }
  async function bootAdmin(reload = false) {
    try {
      await get('session');
      const data = await get('admin');
      const partners = admin.querySelector('[data-admin-partners]'); partners.replaceChildren();
      if (!data.partners.length) partners.append(make('p', 'No partner applications yet.'));
      data.partners.forEach(p => {
        const card = make('article', undefined, 'partner-admin-card');
        const title = make('h3', p.business_name); card.append(title);
        card.append(tag(p.status), make('p', `${p.category} · ${p.city}, ${p.state} · ${p.star_rating ? `${p.star_rating}-star` : 'Unrated'}`));
        card.append(make('p', `Contact: ${p.contact_name} · ${p.email} · ${p.phone}`));
        card.append(make('p', `Address: ${p.address}`));
        card.append(make('p', `Registration: ${p.registration_id || 'Not supplied'}`));
        card.append(make('p', p.description));
        card.append(make('small', p.email_verified_at ? 'Email verified' : 'Email not yet verified'));
        card.append(controls('partner', p.id, ['pending', 'approved', 'rejected', 'suspended'], 'status', p.status, p.reviewer_note)); partners.append(card);
      });
      const offers = admin.querySelector('[data-admin-offers]'); offers.replaceChildren();
      if (!data.offers.length) offers.append(make('p', 'No service offerings submitted.'));
      data.offers.forEach(o => {
        const card = make('article', undefined, 'partner-admin-card');
        card.append(make('h3', o.name));
        card.append(tag(o.status), make('p', `Supplier: ${o.business_name} · ${o.offer_type}`));
        card.append(make('p', o.description));
        card.append(controls('offer', o.id, ['pending', 'approved', 'rejected'], 'status', o.status)); offers.append(card);
      });
      if (!reload) status('Signed in as an authorised Prism staff member.');
    } catch (e) { status(e.message, true); admin.querySelector('[data-admin-partners]').replaceChildren(make('p', 'Sign in with an authorised staff account through the Prism Account page.')); }
  }
  if (root) bootPartner();
  if (admin) bootAdmin();
})();
