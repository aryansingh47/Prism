/* Prism Travels: homepage photo carousel. No dependencies. */
(() => {
  'use strict';
  const slider = document.querySelector('[data-prism-slider]');
  const controls = document.querySelector('[data-prism-slider-controls]');
  if (!slider || !controls) return;

  const slides = [...slider.querySelectorAll('[data-prism-slide]')];
  const dots = [...controls.querySelectorAll('[data-slide-to]')];
  const number = controls.querySelector('[data-slide-number]');
  if (slides.length !== 6 || dots.length !== slides.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = slider.closest('.hero');
  let active = 0;
  let timer = null;
  let pointerInside = false;
  let focusInside = false;

  const show = (nextIndex) => {
    active = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
    if (number) number.textContent = `${String(active + 1).padStart(2, '0')} / 06`;
  };
  const stop = () => { if (timer !== null) { clearInterval(timer); timer = null; } };
  const start = () => {
    stop();
    if (document.hidden || pointerInside || focusInside || reducedMotion.matches) return;
    timer = setInterval(() => show(active + 1), 6500);
  };
  const navigate = (index) => { show(index); start(); };

  controls.querySelector('[data-slide-prev]')?.addEventListener('click', () => navigate(active - 1));
  controls.querySelector('[data-slide-next]')?.addEventListener('click', () => navigate(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));

  hero?.addEventListener('mouseenter', () => { pointerInside = true; stop(); });
  hero?.addEventListener('mouseleave', () => { pointerInside = false; start(); });
  hero?.addEventListener('focusin', () => { focusInside = true; stop(); });
  hero?.addEventListener('focusout', (event) => {
    if (!hero.contains(event.relatedTarget)) { focusInside = false; start(); }
  });
  document.addEventListener('visibilitychange', start);
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', start);
  show(0);
  start();
})();
