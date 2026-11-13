/* Prism Travels: no frameworks, cookies, analytics, or third-party scripts. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  // Mobile navigation + focus / Escape handling
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-main-nav]');
  if (menuButton && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1150) setMenu(false); });
  }

  // Subtle sticky header treatment and scroll-to-top control
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('[data-back-to-top]');
  const updateScroll = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 15);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 550);
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Year: automatically stays current
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  // Gentle scroll-in animation; fully visible when IntersectionObserver is unavailable.
  const animated = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -25px 0px' });
    animated.forEach(node => observer.observe(node));
  } else {
    animated.forEach(node => node.classList.add('is-in'));
  }

  // If an external photograph cannot load, use a locally bundled illustration.
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = 'assets/landscape-fallback.svg';
    });
  });

  // Shared filters for Destinations and Experiences; keyboard-friendly buttons.
  document.querySelectorAll('[data-filter-scope]').forEach(scope => {
    const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const search = scope.querySelector('[data-card-search]');
    const empty = scope.querySelector('[data-no-results]');
    const count = scope.querySelector('[data-result-count]');
    let category = 'all';
    const apply = () => {
      const query = (search ? search.value : '').trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matchCategory = category === 'all' || (card.dataset.category || '').split(' ').includes(category);
        const matchText = !query || (card.dataset.search || card.textContent).toLowerCase().includes(query);
        card.hidden = !(matchCategory && matchText);
        if (!card.hidden) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = `${visible} ${visible === 1 ? 'result' : 'results'}`;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter || 'all';
      buttons.forEach(b => {
        const active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      apply();
    }));
    if (search) search.addEventListener('input', apply);
    apply();
  });

  // No false claim that details are being sent: user copies a trip brief then opens Google Forms.
  const planner = document.querySelector('[data-trip-planner]');
  if (planner) {
    planner.addEventListener('submit', async event => {
      event.preventDefault();
      const form = new FormData(planner);
      const clean = key => String(form.get(key) || '').trim();
      const lines = [
        'MY TRIP BRIEF — PRISM TRAVELS',
        `Destination: ${clean('destination') || 'Open to suggestions'}`,
        `Travel period: ${clean('period') || 'Flexible'}`,
        `Travellers: ${clean('travellers') || 'To be confirmed'}`,
        `Travel style: ${clean('style') || 'Not specified'}`,
        `Additional details: ${clean('notes') || 'None yet'}`
      ];
      const brief = lines.join('\n');
      const output = planner.querySelector('[data-trip-result]');
      const status = planner.querySelector('[data-copy-status]');
      if (output) {
        output.textContent = brief;
        output.classList.add('is-visible');
      }
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(brief);
          copied = true;
        } else {
          const helper = document.createElement('textarea');
          helper.value = brief;
          helper.style.position = 'fixed'; helper.style.opacity = '0';
          document.body.appendChild(helper); helper.select();
          copied = document.execCommand('copy');
          helper.remove();
        }
      } catch (_error) { copied = false; }
      if (status) status.textContent = copied
        ? 'Trip brief copied. Open the enquiry form and paste it into the relevant details field.'
        : 'Trip brief prepared below. Copy it manually, then open the enquiry form.';
    });
  }
})();
