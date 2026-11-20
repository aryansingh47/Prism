(function () {
  'use strict';

  const config = Object.assign(
    {
      chatbotName: 'Porter',
      apiBase: 'api',
      assetsBase: 'assets',
      contactUrl: 'contact.html#enquiry-form',
      whatsappUrl: 'https://wa.me/919217711610',
      avatar: 'assets/porter-avatar.png',
      packageBrowseUrl: 'packages.html',
      healthUrl: 'api/porter-health.php',
      rootBase: '',
    },
    window.PRISM_PORTER_CONFIG || {}
  );

  const state = {
    open: false,
    history: loadSession('prism_porter_history', []),
    welcomeInjected: false,
    mode: 'chat',
    sending: false,
  };

  const root = document.createElement('div');
  root.className = 'porter-root';
  root.innerHTML = `
    <button class="porter-launcher" type="button" aria-expanded="false" aria-controls="porter-panel">
      <span class="porter-launcher__avatar-wrap"><img src="${escapeHtml(config.avatar)}" alt="" class="porter-launcher__avatar"></span>
      <span class="porter-launcher__text"><strong>Chat with ${escapeHtml(config.chatbotName)}</strong><small>Your AI travel assistant</small></span>
    </button>
    <section class="porter-panel" id="porter-panel" hidden aria-label="${escapeHtml(config.chatbotName)} travel assistant">
      <header class="porter-panel__header">
        <div class="porter-panel__brand">
          <img src="${escapeHtml(config.avatar)}" alt="" class="porter-panel__avatar">
          <div>
            <strong>${escapeHtml(config.chatbotName)}</strong>
            <span>AI Travel Assistant</span>
          </div>
        </div>
        <div class="porter-panel__header-actions">
          <button class="porter-icon-button" type="button" data-porter-mode="chat" aria-label="Open chat" title="Open chat">💬</button>
          <button class="porter-icon-button" type="button" data-porter-mode="enquiry" aria-label="Open enquiry form" title="Open enquiry form">📝</button>
          <button class="porter-icon-button" type="button" data-porter-minimise aria-label="Minimise chat" title="Minimise">—</button>
        </div>
      </header>
      <nav class="porter-tabs" aria-label="Porter actions">
        <button class="porter-tab is-active" type="button" data-porter-mode="chat">Chat</button>
        <button class="porter-tab" type="button" data-porter-mode="enquiry">Plan My Trip</button>
        <a class="porter-tab porter-tab--link" href="${escapeHtml(config.contactUrl)}">Human Help</a>
      </nav>
      <div class="porter-panel__body">
        <section class="porter-view porter-view--chat is-active" data-porter-view="chat">
          <div class="porter-messages" data-porter-messages aria-live="polite" aria-label="Conversation"></div>
          <div class="porter-suggestions" data-porter-suggestions></div>
        </section>
        <section class="porter-view porter-view--enquiry" data-porter-view="enquiry" hidden>
          <div class="porter-enquiry-intro">
            <h3>Share your trip details.</h3>
            <p>Send a polished enquiry straight to the Prism team. Porter will log it instantly and a consultant can follow up.</p>
          </div>
          <form class="porter-enquiry-form" data-porter-enquiry-form novalidate>
            <div class="porter-form-grid">
              <label><span>Name *</span><input name="name" required autocomplete="name"></label>
              <label><span>Email *</span><input name="email" type="email" required autocomplete="email"></label>
              <label><span>Phone / WhatsApp</span><input name="phone" autocomplete="tel"></label>
              <label><span>Origin city</span><input name="origin" placeholder="e.g. Chandigarh"></label>
              <label><span>Destination / package *</span><input name="destination" required placeholder="e.g. Munnar or Goa Beach Escape"></label>
              <label><span>Travel dates</span><input name="travel_dates" placeholder="e.g. 22–26 December"></label>
              <label><span>Duration</span><input name="duration" placeholder="e.g. 4 nights / 5 days"></label>
              <label><span>Travellers</span><input name="travellers" placeholder="e.g. 2 adults + 1 child"></label>
              <label><span>Budget</span><input name="budget" placeholder="e.g. ₹60,000–₹80,000"></label>
              <label><span>Trip type</span>
                <select name="trip_type">
                  <option value="">Select one</option>
                  <option>Family holiday</option>
                  <option>Honeymoon / couple</option>
                  <option>Friends / group</option>
                  <option>Corporate / MICE</option>
                  <option>Wellness / slow travel</option>
                  <option>Adventure / winter</option>
                </select>
              </label>
              <label class="porter-form-grid__full"><span>Notes</span><textarea name="notes" rows="4" placeholder="Tell us about your preferences, hotel style, children, special dates, or anything else that matters."></textarea></label>
            </div>
            <div class="porter-form-status" data-porter-form-status aria-live="polite"></div>
            <div class="porter-form-actions">
              <button class="button porter-submit" type="submit">Send enquiry ↗</button>
              <a class="porter-whatsapp-link" href="${escapeHtml(config.whatsappUrl)}" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
            </div>
          </form>
        </section>
      </div>
      <footer class="porter-panel__footer porter-composer">
        <form class="porter-composer__form" data-porter-chat-form>
          <label class="sr-only" for="porter-input">Type your message</label>
          <textarea id="porter-input" name="message" rows="1" placeholder="Ask about packages, destinations, budgets or winter getaways…" required></textarea>
          <button class="porter-send" type="submit" aria-label="Send message">➤</button>
        </form>
      </footer>
    </section>
  `;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    document.body.appendChild(root);
    bindUi();
    if (state.history.length) {
      renderStoredHistory();
      state.welcomeInjected = true;
    }
    showSuggestions(defaultSuggestions());
    healthCheck();
  }

  function bindUi() {
    const launcher = root.querySelector('.porter-launcher');
    const panel = root.querySelector('.porter-panel');
    const chatForm = root.querySelector('[data-porter-chat-form]');
    const enquiryForm = root.querySelector('[data-porter-enquiry-form]');

    launcher.addEventListener('click', () => {
      state.open = !state.open;
      panel.hidden = !state.open;
      launcher.setAttribute('aria-expanded', String(state.open));
      root.classList.toggle('is-open', state.open);
      if (state.open) {
        injectWelcome();
        focusComposer();
      }
    });

    root.querySelector('[data-porter-minimise]').addEventListener('click', () => {
      state.open = false;
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
    });

    root.querySelectorAll('[data-porter-mode]').forEach((node) => {
      node.addEventListener('click', () => setMode(node.getAttribute('data-porter-mode')));
    });

    chatForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const textarea = chatForm.querySelector('textarea');
      const message = textarea.value.trim();
      if (!message || state.sending) return;
      textarea.value = '';
      autoresize(textarea);
      await sendMessage(message);
    });

    const textarea = chatForm.querySelector('textarea');
    textarea.addEventListener('input', () => autoresize(textarea));
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
      }
    });

    enquiryForm.addEventListener('submit', submitEnquiry);
  }

  function setMode(mode) {
    state.mode = mode === 'enquiry' ? 'enquiry' : 'chat';
    root.querySelectorAll('.porter-tab[data-porter-mode], .porter-icon-button[data-porter-mode]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-porter-mode') === state.mode);
    });
    root.querySelectorAll('[data-porter-view]').forEach((view) => {
      const match = view.getAttribute('data-porter-view') === state.mode;
      view.hidden = !match;
      view.classList.toggle('is-active', match);
    });
    root.querySelector('.porter-panel__footer').hidden = state.mode !== 'chat';
    if (state.mode === 'chat') {
      focusComposer();
    }
  }

  function injectWelcome() {
    if (state.welcomeInjected) return;
    state.welcomeInjected = true;
    addAssistantMessage(
      `Hello — I’m ${config.chatbotName}, Prism’s intelligent travel assistant. I can help you explore destinations, compare packages, shortlist winter getaways, understand indicative pricing and send a polished enquiry to the Prism team.`,
      {
        suggestions: defaultSuggestions(),
      }
    );
  }

  function renderStoredHistory() {
    state.history.forEach((item) => {
      if (item.role === 'user') {
        addUserMessage(item.content, false);
      } else {
        addAssistantMessage(item.content, { cards: item.cards || [], suggestions: item.suggestions || [] }, false);
      }
    });
  }

  async function sendMessage(message) {
    state.sending = true;
    const priorHistory = state.history.slice(-12);
    addUserMessage(message, true);
    const loadingId = addLoading();

    try {
      const response = await fetch(resolvePath(config.apiBase + '/porter-chat.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: priorHistory }),
      });
      const data = await response.json();
      removeLoading(loadingId);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Porter could not respond right now.');
      }

      addAssistantMessage(data.reply, { cards: data.cards || [], suggestions: data.suggestions || [] }, true);
    } catch (error) {
      removeLoading(loadingId);
      addAssistantMessage(
        'I’m sorry — I’m having trouble responding right now. You can try again, open the enquiry form, or speak to Prism directly via the Contact page or WhatsApp.',
        {
          suggestions: ['Open the enquiry form', 'Show me winter packages', 'Talk to the Prism team'],
        },
        true
      );
      console.error(error);
    } finally {
      state.sending = false;
    }
  }

  function addUserMessage(text, persist) {
    renderMessage('user', text);
    if (persist) {
      state.history.push({ role: 'user', content: text });
      persistHistory();
    }
  }

  function addAssistantMessage(text, meta, persist = true) {
    renderMessage('assistant', text, meta);
    if (persist) {
      state.history.push({ role: 'assistant', content: text, cards: meta.cards || [], suggestions: meta.suggestions || [] });
      persistHistory();
    }
    if (meta.suggestions && meta.suggestions.length) {
      showSuggestions(meta.suggestions);
    }
  }

  function renderMessage(role, text, meta) {
    const container = root.querySelector('[data-porter-messages]');
    const message = document.createElement('article');
    message.className = 'porter-message porter-message--' + role;

    const bubble = document.createElement('div');
    bubble.className = 'porter-message__bubble';
    bubble.innerHTML = formatText(text);
    message.appendChild(bubble);

    if (meta && Array.isArray(meta.cards) && meta.cards.length) {
      const cards = document.createElement('div');
      cards.className = 'porter-cards';
      meta.cards.forEach((card) => cards.appendChild(renderCard(card)));
      message.appendChild(cards);
    }

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
  }

  function renderCard(card) {
    const item = document.createElement('a');
    item.className = 'porter-card';
    item.href = resolveSitePath(card.href || config.packageBrowseUrl);
    item.innerHTML = `
      ${card.badge ? `<span class="porter-card__badge">${escapeHtml(card.badge)}</span>` : ''}
      <strong>${escapeHtml(card.title || 'Package')}</strong>
      ${card.subtitle ? `<small>${escapeHtml(card.subtitle)}</small>` : ''}
      ${card.description ? `<p>${escapeHtml(card.description)}</p>` : ''}
      <span class="porter-card__cta">${escapeHtml(card.cta_label || 'View package')} →</span>
    `;
    return item;
  }

  function showSuggestions(items) {
    const holder = root.querySelector('[data-porter-suggestions]');
    holder.innerHTML = '';
    (items || []).slice(0, 6).forEach((text) => {
      const button = document.createElement('button');
      button.className = 'porter-chip';
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', () => {
        if (text.toLowerCase().includes('enquiry form') || text.toLowerCase().includes('plan')) {
          setMode('enquiry');
          return;
        }
        if (text.toLowerCase().includes('talk to the prism team')) {
          window.location.href = resolveSitePath(config.contactUrl);
          return;
        }
        sendMessage(text);
      });
      holder.appendChild(button);
    });
  }

  function addLoading() {
    const container = root.querySelector('[data-porter-messages]');
    const message = document.createElement('article');
    const id = 'loading-' + Math.random().toString(36).slice(2);
    message.className = 'porter-message porter-message--assistant';
    message.dataset.loadingId = id;
    message.innerHTML = '<div class="porter-message__bubble porter-message__bubble--loading"><span></span><span></span><span></span></div>';
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  function removeLoading(id) {
    const node = root.querySelector('[data-loading-id="' + id + '"]');
    if (node) node.remove();
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = root.querySelector('[data-porter-form-status]');
    status.textContent = 'Sending your enquiry…';
    status.className = 'porter-form-status is-pending';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.page = window.location.pathname;

    try {
      const response = await fetch(resolvePath(config.apiBase + '/porter-enquiry.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        const message = data.errors ? Object.values(data.errors).join(' ') : data.error || 'Unable to send the enquiry right now.';
        throw new Error(message);
      }

      status.textContent = `Enquiry sent successfully. Reference: ${data.reference}. Prism will follow up soon.`;
      status.className = 'porter-form-status is-success';
      form.reset();
      setMode('chat');
      addAssistantMessage(`Your enquiry has been sent successfully. Your reference is ${data.reference}. A Prism consultant should follow up with you soon.`, {
        suggestions: ['Show me winter packages', 'Compare Goa and Kerala', 'Talk to the Prism team'],
      }, true);
    } catch (error) {
      status.textContent = error.message || 'Something went wrong while sending the enquiry.';
      status.className = 'porter-form-status is-error';
    }
  }

  function focusComposer() {
    const textarea = root.querySelector('#porter-input');
    if (textarea) textarea.focus();
  }

  function autoresize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  }

  function healthCheck() {
    fetch(resolvePath(config.healthUrl), { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) return;
        root.classList.toggle('porter--offline-ai', !data.has_api_key);
      })
      .catch(() => undefined);
  }

  function persistHistory() {
    saveSession('prism_porter_history', state.history.slice(-20));
  }

  function defaultSuggestions() {
    return [
      'Show me your best winter packages',
      'Compare Jaipur and Munnar',
      'I need a family holiday under ₹80,000',
      'Help me plan my trip',
    ];
  }

  function formatText(text) {
    return escapeHtml(text).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
  }

  function resolvePath(path) {
    if (/^(https?:)?\/\//.test(path)) return path;
    if (path.startsWith('/')) return path;
    return path;
  }

  function resolveSitePath(path) {
    if (/^(https?:)?\/\//.test(path)) return path;
    if (path.startsWith('/')) return path;
    const rootBase = config.rootBase || '';
    if (rootBase && !path.startsWith('../') && !path.startsWith('./')) {
      return rootBase + path;
    }
    return path;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadSession(key, fallback) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveSession(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* no-op */
    }
  }
})();
