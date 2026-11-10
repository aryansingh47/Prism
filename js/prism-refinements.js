/* Prism Travels | Open the original Google Form within the Prism website.
   Works on GitHub Pages. The form retains Google's actual fields, validation,
   submission and response storage; no server or extra API credentials are needed.
*/
(() => {
  'use strict';
  const dialog = document.getElementById('prism-enquiry-dialog');
  if (!dialog) return;

  const frame = dialog.querySelector('[data-prism-form-frame]');
  const closeButton = dialog.querySelector('[data-prism-close]');
  let lastFocus = null;

  const openForm = () => {
    if (typeof dialog.showModal !== 'function') {
      window.open(frame.dataset.src.replace('?embedded=true', ''), '_blank', 'noopener,noreferrer');
      return;
    }
    lastFocus = document.activeElement;
    // Load the actual form only when someone opens it.
    if (!frame.src) frame.src = frame.dataset.src;
    dialog.showModal();
    document.body.classList.add('prism-modal-open');
    closeButton.focus();
  };

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    // Let Ctrl/Cmd-click, Shift-click and middle-click keep their usual behaviour.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    let url;
    try { url = new URL(anchor.href, window.location.href); }
    catch (_) { return; }
    const isOurForm = (url.hostname === 'forms.gle' && url.pathname === '/KLPB9NCuSUFpSni97') ||
      (url.hostname === 'docs.google.com' && url.pathname.includes('1FAIpQLSeUwECMuBSJUaQAIGwq6P1TnwYstjSdI3VRX1oLcaDQVZyu9Q'));
    if (!isOurForm) return;
    event.preventDefault();
    openForm();
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('prism-modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  });
})();
