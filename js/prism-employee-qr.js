/* Contact data stays in the browser. No fetch, analytics, or persistence. */
(function (root) {
  'use strict';
  const company = 'Prism Travel and Advisory Limited';
  const website = 'https://tripbyprism.co.in';
  const utf8 = new TextEncoder();
  function clean(value, label, max, required = false) {
    const text = String(value ?? '').trim();
    if ((required && !text) || [...text].length > max || /[\u0000-\u001f\u007f-\u009f]/u.test(text)) throw new Error('Check ' + label + '.');
    return text;
  }
  const escapeText = text => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
  function fold(line) {
    let out = '', size = 0;
    for (const char of line) {
      const n = utf8.encode(char).length;
      if (size + n > 75) { out += '\r\n '; size = 1; }
      out += char; size += n;
    }
    return out;
  }
  function buildCard(values) {
    const first = clean(values.first, 'first name', 50, true);
    const last = clean(values.last, 'last name', 50, true);
    const title = clean(values.title, 'designation', 70, true);
    const phone = clean(values.phone, 'work mobile', 24, true).replace(/[\s().-]/g, '');
    if (!/^\+[1-9]\d{9,14}$/.test(phone)) throw new Error('Use an international phone number, e.g. +91 followed by 10 digits.');
    const email = clean(values.email, 'work email', 100, true);
    if (!/^[^\s@;,\\]+@[^\s@;,\\]+\.[^\s@;,\\]+$/.test(email)) throw new Error('Enter a valid work email.');
    const social = [values.social1, values.social2].filter(x => String(x ?? '').trim()).map(x => {
      const raw = clean(x, 'social URL', 150); let url;
      try { url = new URL(raw); } catch { throw new Error('Enter a valid HTTPS social URL.'); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Social links must use HTTPS and contain no credentials.');
      return url.href;
    });
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeText(last)};${escapeText(first)};;;`, `FN:${escapeText(first+' '+last)}`, `ORG:${company}`, `TITLE:${escapeText(title)}`, `TEL;TYPE=WORK,CELL:${phone}`, `EMAIL;TYPE=INTERNET,WORK:${email}`, `URL:${website}`];
    if (values.address) lines.push('ADR;TYPE=WORK:;;HSIIDC IT Park\\, Sector-22;Panchkula;Haryana;134109;India');
    for (const url of [...new Set(social)]) if (url !== website) lines.push('URL:' + url);
    lines.push('END:VCARD');
    const card = lines.map(fold).join('\r\n') + '\r\n';
    if (utf8.encode(card).length > 700) throw new Error('Contact details are too long for a practical printed QR. Shorten optional links or omit the address.');
    return { card, name: first+' '+last, filename: ('prism-'+first+'-'+last).normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').toLowerCase().replace(/-+$/,'') || 'prism-employee' };
  }
  function svgFor(matrix) {
    const size = matrix.length + 8;
    let path = '';
    for (let y = 0; y < matrix.length; y++) for (let x = 0; x < matrix.length; x++) if (matrix[y][x]) path += `M${x+4} ${y+4}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }
  root.PrismEmployeeQr = { buildCard, svgFor };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('employee-qr-form');
  if (!form) return;
  const status = document.getElementById('qr-status'), result = document.getElementById('qr-result'), placeholder = document.getElementById('qr-placeholder'), image = document.getElementById('qr-image');
  let current = null, previewUrl = null;
  function clear() {
    current = null; result.hidden = true; placeholder.hidden = false;
    image.removeAttribute('src');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null; status.textContent = ''; status.className = '';
  }
  function report(message, error = false) { status.textContent = message; status.className = error ? 'qr-error' : ''; }
  form.addEventListener('input', clear);
  form.addEventListener('reset', clear);
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const fields = Object.fromEntries(new FormData(form));
      if (!fields.approved) throw new Error('Confirm approval before generating a QR code.');
      const data = buildCard(fields);
      const matrix = root.PrismQrEncoder(data.card);
      const svg = svgFor(matrix);
      current = {...data, matrix, svg};
      previewUrl = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'})); image.src = previewUrl;
      document.getElementById('qr-employee').textContent = data.name;
      document.getElementById('qr-print-size').textContent = `Suggested print width: at least ${Math.max(30,Math.ceil((matrix.length+8)*0.45))} mm including white border. Test at final size.`;
      placeholder.hidden = true; result.hidden = false; report('QR code generated.');
    } catch (error) { clear(); report(error.message || 'QR generation failed.', true); }
  });
  function download(blob, name) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }
  function pngFor(matrix) {
    const size = matrix.length + 8, scale = Math.ceil(1200 / size);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size*scale;
    const ctx = canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#000';
    for (let y=0;y<matrix.length;y++) for(let x=0;x<matrix.length;x++) if(matrix[y][x]) ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed.')),'image/png'));
  }
  result.querySelectorAll('[data-export]').forEach(button=>button.addEventListener('click', async()=>{
    if (!current) return;
    const snapshot=current; button.disabled=true;
    try {
      const ext=button.dataset.export;
      const blob=ext==='png'?await pngFor(snapshot.matrix):ext==='svg'?new Blob([snapshot.svg],{type:'image/svg+xml'}):new Blob([snapshot.card],{type:'text/vcard;charset=utf-8'});
      if (current===snapshot) download(blob, snapshot.filename+'.'+ext);
    } catch(error) {report(error.message || 'Export failed.',true);} finally {button.disabled=false;}
  }));
  // Do not restore employee data from a back/forward cache on a shared workstation.
  window.addEventListener('pagehide', ()=>{form.reset();clear();});
  window.addEventListener('pageshow', event=>{if(event.persisted) location.reload();});
})(globalThis);
