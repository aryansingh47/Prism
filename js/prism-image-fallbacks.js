/* Automatic local fallback on photo loading error, including dynamically loaded package images. */
(() => {
  'use strict';
  const fallback = (document.body?.dataset.prismRoot || '') + 'assets/prism-landscape-fallback.svg';
  document.querySelectorAll('.pkg-photo-strip img, .pkg-card__image-link img').forEach(img => {
    if (img.dataset.prismFallbackAttached) return;
    img.dataset.prismFallbackAttached = '1';
    const restore = () => {
      if (img.dataset.prismFallbackUsed) return;
      img.dataset.prismFallbackUsed = '1';
      img.src = fallback;
      img.alt = 'Illustrative landscape — photo currently unavailable';
      img.closest('.pkg-photo-strip, .pkg-card__image-link')?.classList.add('has-fallback-image');
    };
    img.addEventListener('error', restore, { once: true });
    if (img.complete && img.naturalWidth === 0) restore();
  });
})();
