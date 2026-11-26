/* Prism homepage: loop through all destination flyers every three seconds. */
(() => {
  'use strict';
  const slider = document.querySelector('[data-prism-slider]');
  const controls = document.querySelector('[data-prism-slider-controls]');
  if (!slider || !controls) return;
  const slides = [...slider.querySelectorAll('[data-prism-slide]')];
  const dots = [...controls.querySelectorAll('[data-slide-to]')];
  const number = controls.querySelector('[data-slide-number]');
  const pause = controls.querySelector('[data-slide-pause]');
  if (slides.length < 2 || dots.length !== slides.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer = null;
  let paused = reducedMotion.matches;
  const pad = (value) => String(value).padStart(2, '0');
  const show = (next) => {
    active = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
    if (number) number.textContent = `${pad(active + 1)} / ${pad(slides.length)}`;
  };
  const stop = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (paused || document.hidden) return;
    timer = setInterval(() => show(active + 1), 3000);
  };
  const navigate = (index) => { show(index); start(); };
  const updatePause = () => {
    if (!pause) return;
    pause.textContent = paused ? '▶' : '❚❚';
    pause.setAttribute('aria-label', paused ? 'Resume slideshow' : 'Pause slideshow');
    pause.setAttribute('aria-pressed', String(paused));
  };
  controls.querySelector('[data-slide-prev]')?.addEventListener('click', () => navigate(active - 1));
  controls.querySelector('[data-slide-next]')?.addEventListener('click', () => navigate(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));
  pause?.addEventListener('click', () => { paused = !paused; updatePause(); start(); });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener?.('change', (event) => {
    paused = event.matches; updatePause(); start();
  });
  show(0); updatePause(); start();
})();
