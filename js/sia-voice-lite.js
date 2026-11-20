/* SIA Voice Pilot – Live audio over WebRTC. No separate Node service or quota ledger.
   Access is verified by api/sia-voice-session.php; client timer is NOT a hard cap. */
(() => {
  'use strict';
  const cfg = window.PRISM_PORTER_CONFIG || {};
  const base = cfg.rootBase || '';
  const api = (cfg.apiBase || (base + 'api')).replace(/\/$/, '');
  const svg = (name) => {
    const shapes = {
      mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
      muted: '<path d="m3 3 18 18M9 9v2a3 3 0 0 0 5 2M15 9V5a3 3 0 0 0-5.7-1.3M5 10a7 7 0 0 0 12 4.9M12 17v5M8 22h8"/>',
      audio: '<path d="m11 5-5 4H2v6h4l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
      silent: '<path d="m11 5-5 4H2v6h4l5 4V5ZM16 9l5 6m0-6-5 6"/>',
      end: '<path d="M3 14c5-5 13-5 18 0l-2 5-4-2v-3H9v3l-4 2-2-5Z"/>',
      back: '<path d="m15 18-6-6 6-6"/>',
    };
    return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]}</svg>`;
  };
  const state = { open: false, active: false, starting: false, peer: null, stream: null,
    audio: null, channel: null, timer: null, duration: 0, micMuted: false,
    speakerMuted: false, generation: 0, lastSpeaker: '', turn: 0, transcript: new Map() };
  const MAX_PREVIEW_SECONDS = 120; // Browser convenience only; NOT provider-enforced.
  const q = (selector) => document.querySelector('.porter-root ' + selector);
  const time = (sec) => `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;
  const setStatus = (message, mode = '') => {
    const el = q('[data-sia-voice-status]');
    if (el) el.textContent = message;
    const pane = q('[data-sia-voice-pane]');
    if (pane) pane.dataset.mode = mode;
  };

  function init(attempt = 0) {
    const root = document.querySelector('.porter-root');
    if (!root || !root.querySelector('[data-sia-resize]')) {
      if (attempt < 30) window.setTimeout(() => init(attempt + 1), 80);
      return;
    }
    if (root.querySelector('[data-sia-voice-toggle]')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'porter-header__control sia-voice-toggle';
    toggle.setAttribute('data-sia-voice-toggle', '');
    toggle.setAttribute('aria-label', 'SIA voice conversation');
    toggle.title = 'Speak with SIA';
    toggle.innerHTML = svg('mic');
    root.querySelector('[data-sia-resize]').before(toggle);

    const pane = document.createElement('section');
    pane.className = 'sia-voice-pane';
    pane.dataset.siaVoicePane = '';
    pane.hidden = true;
    pane.setAttribute('aria-label', 'SIA voice conversation');
    pane.innerHTML = `
      <div class="sia-voice-top">
        <button type="button" data-sia-voice-back class="sia-voice-back">${svg('back')} Back to chat</button>
        <span class="sia-voice-tag">VOICE PREVIEW · MEMBERS ONLY</span>
      </div>
      <div class="sia-voice-content">
        <img src="${base}assets/sia-avatar.png" alt="SIA, Prism's virtual travel concierge" class="sia-voice-portrait">
        <h2>Talk travel with SIA.</h2>
        <p data-sia-voice-status role="status" aria-live="polite">Sign in with a verified Prism account to begin.</p>
        <div class="sia-voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sia-voice-clock">Current call <strong data-sia-voice-clock>00:00</strong></div>
        <div class="sia-voice-member-message" data-sia-voice-members hidden>
          <p>Voice preview is available to invited Prism members who have verified their email.</p>
          <a href="${base}account.html">Log in / Sign up</a>
        </div>
        <label class="sia-voice-consent"><input type="checkbox" data-sia-voice-consent> <span>I understand SIA uses an AI-generated voice and that my microphone audio is sent to OpenAI. Voice sessions are billed by OpenAI; this preview does not yet have a server-enforced monthly limit. <a href="${base}privacy.html" target="_blank" rel="noopener noreferrer">Privacy notice</a>.</span></label>
        <div class="sia-voice-buttons">
          <button type="button" data-sia-voice-start class="sia-voice-start">${svg('mic')} Start speaking</button>
          <button type="button" data-sia-voice-mute class="sia-voice-round" aria-label="Mute microphone" title="Mute microphone" disabled>${svg('mic')}</button>
          <button type="button" data-sia-voice-speaker class="sia-voice-round" aria-label="Mute SIA audio" title="Mute SIA audio" disabled>${svg('audio')}</button>
          <button type="button" data-sia-voice-end class="sia-voice-round sia-voice-end" aria-label="End conversation" title="End conversation" disabled>${svg('end')}</button>
        </div>
        <p class="sia-voice-note">For this test release, calls close locally after two minutes. That timer is not a server-side or billing cap.</p>
      </div>
      <div data-sia-voice-captions class="sia-voice-captions" aria-label="Voice transcript when available" aria-live="polite"></div>
      <audio data-sia-voice-audio autoplay playsinline></audio>
    `;
    root.querySelector('.porter-main').appendChild(pane);
    state.audio = q('[data-sia-voice-audio]');
    toggle.addEventListener('click', () => state.open ? closePanel() : openPanel());
    q('[data-sia-voice-back]').addEventListener('click', closePanel);
    q('[data-sia-voice-start]').addEventListener('click', startVoice);
    q('[data-sia-voice-end]').addEventListener('click', () => stopVoice('Conversation ended. You can use text chat at any time.'));
    q('[data-sia-voice-mute]').addEventListener('click', () => {
      state.micMuted = !state.micMuted;
      state.stream?.getAudioTracks().forEach(track => { track.enabled = !state.micMuted; });
      q('[data-sia-voice-mute]').innerHTML = svg(state.micMuted ? 'muted' : 'mic');
      q('[data-sia-voice-mute]').setAttribute('aria-label', state.micMuted ? 'Unmute microphone' : 'Mute microphone');
    });
    q('[data-sia-voice-speaker]').addEventListener('click', () => {
      state.speakerMuted = !state.speakerMuted;
      state.audio.muted = state.speakerMuted;
      q('[data-sia-voice-speaker]').innerHTML = svg(state.speakerMuted ? 'silent' : 'audio');
      q('[data-sia-voice-speaker]').setAttribute('aria-label', state.speakerMuted ? 'Unmute SIA audio' : 'Mute SIA audio');
    });
    root.querySelector('[data-porter-close]')?.addEventListener('click', closePanel);
    window.addEventListener('pagehide', () => stopVoice(null));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (state.active || state.starting)) stopVoice('Call ended when the page was hidden.');
    });
  }

  function updateControls() {
    q('[data-sia-voice-start]').disabled = state.active || state.starting;
    q('[data-sia-voice-mute]').disabled = !state.active;
    q('[data-sia-voice-speaker]').disabled = !state.active;
    q('[data-sia-voice-end]').disabled = !state.active && !state.starting;
    q('[data-sia-voice-pane]').classList.toggle('is-speaking', state.active);
  }
  async function openPanel() {
    state.open = true;
    const root = document.querySelector('.porter-root');
    root.classList.add('sia-voice-active');
    q('[data-sia-voice-pane]').hidden = false;
    setStatus('Checking your account…');
    try {
      const response = await fetch(api + '/session.php', { credentials:'same-origin', cache:'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('Prism account service is unavailable.');
      const isMember = Boolean(data.user);
      q('[data-sia-voice-members]').hidden = isMember;
      q('[data-sia-voice-start]').disabled = !isMember;
      setStatus(isMember ? 'Ready for your voice conversation.' : 'Please log in and verify your email to use SIA Voice.');
    } catch(error) {
      q('[data-sia-voice-start]').disabled = true;
      setStatus(error.message || 'Account service is unavailable.', 'error');
    }
  }
  function closePanel() {
    stopVoice(null);
    state.open = false;
    const root = document.querySelector('.porter-root');
    root?.classList.remove('sia-voice-active');
    const pane = q('[data-sia-voice-pane]'); if (pane) pane.hidden = true;
  }
  async function startVoice() {
    if (state.starting || state.active) return;
    if (!q('[data-sia-voice-consent]').checked) {
      setStatus('Please accept the voice and privacy notice before starting.', 'error'); return;
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      setStatus('A supported browser and secure HTTPS connection are required.', 'error'); return;
    }
    const generation = ++state.generation;
    state.starting = true;
    updateControls();
    try {
      setStatus('Requesting microphone permission…');
      const sessionRes = await fetch(api + '/session.php', { credentials:'same-origin',cache:'no-store' });
      const session = await sessionRes.json();
      if (!sessionRes.ok || !session.ok || !session.user || !session.csrf) throw new Error('Sign in and verify your Prism account first.');
      if (generation !== state.generation) return;
      state.stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
      if (generation !== state.generation) return;
      const peer = new RTCPeerConnection();
      state.peer = peer;
      state.stream.getTracks().forEach(track => peer.addTrack(track,state.stream));
      peer.ontrack = (event) => {
        state.audio.srcObject = event.streams[0] || new MediaStream([event.track]);
        state.audio.play().catch(() => setStatus('Tap to enable sound playback on your device.'));
      };
      peer.onconnectionstatechange = () => {
        if ((peer.connectionState === 'failed' || peer.connectionState === 'closed') && state.active) {
          stopVoice('Your voice connection ended.');
        }
      };
      const channel = peer.createDataChannel('oai-events');
      state.channel = channel;
      channel.onmessage = handleEvent;
      channel.onclose = () => { if (state.active) stopVoice('Voice connection ended.'); };
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      if (peer.iceGatheringState !== 'complete') {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Audio negotiation timed out.')),12000);
          const cb = () => { if (peer.iceGatheringState === 'complete') { clearTimeout(timer); peer.removeEventListener('icegatheringstatechange',cb); resolve(); }};
          peer.addEventListener('icegatheringstatechange',cb); cb();
        });
      }
      if (generation !== state.generation) return;
      setStatus('Connecting SIA…');
      const response = await fetch(api + '/sia-voice-session.php', {
        method:'POST', credentials:'same-origin', cache:'no-store',
        headers:{ 'Content-Type':'application/json', 'X-CSRF-Token':session.csrf },
        body: JSON.stringify({sdp: peer.localDescription?.sdp || offer.sdp})
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Unable to start a voice call.');
      if (generation !== state.generation) return;
      await peer.setRemoteDescription({type:'answer',sdp:result.sdp});
      state.active = true;
      state.duration = 0;
      state.micMuted = false;
      state.speakerMuted = false;
      state.audio.muted = false;
      state.timer = window.setInterval(() => {
        state.duration += 1;
        q('[data-sia-voice-clock]').textContent = time(state.duration);
        if (state.duration >= MAX_PREVIEW_SECONDS) stopVoice('Two-minute voice preview ended. You can start another call if invited.');
      },1000);
      q('[data-sia-voice-captions]').replaceChildren();
      setStatus('Connected — speak naturally to SIA.', 'live');
      updateControls();
    } catch(error) {
      if (generation === state.generation) setStatus(error.message || 'Could not connect SIA Voice.', 'error');
      stopVoice(null);
    } finally {
      state.starting = false; updateControls();
    }
  }
  function handleEvent(message) {
    let event; try { event = JSON.parse(message.data); } catch { return; }
    if (event.type === 'session.started') {
      setStatus('SIA is listening. Speak whenever you’re ready.', 'live'); return;
    }
    if (event.type === 'session.closed') {
      stopVoice('Session ended. You can continue by text.'); return;
    }
    if (event.type === 'error') {
      setStatus('SIA reported a connection error. Try again if the issue persists.', 'error'); return;
    }
    // Transcript names may evolve across Live model revisions; captions are best effort.
    const speaker = event.type === 'session.input_transcript.delta' ? 'You' :
      event.type === 'session.output_transcript.delta' ? 'SIA' : null;
    if (!speaker) return;
    const part = typeof event.delta === 'string' ? event.delta : (event.delta?.text || '');
    if (!part) return;
    if (speaker !== state.lastSpeaker) { state.lastSpeaker = speaker; state.turn++; }
    const key = speaker + '-' + (event.item_id || state.turn);
    let element = state.transcript.get(key);
    if (!element) {
      element = document.createElement('p');
      const label = document.createElement('strong'); label.textContent = speaker + ': ';
      const span = document.createElement('span'); span.dataset.voiceLine = '';
      element.append(label,span);
      q('[data-sia-voice-captions]').append(element);
      state.transcript.set(key,element);
    }
    const span = element.querySelector('[data-voice-line]');
    span.textContent = (span.textContent + part).slice(-3000);
    const captions = q('[data-sia-voice-captions]');
    if (captions.children.length > 30) captions.firstElementChild.remove();
    captions.scrollTop = captions.scrollHeight;
  }
  function stopVoice(message) {
    ++state.generation;
    if (state.timer) clearInterval(state.timer); state.timer = null;
    if (state.channel) { try { state.channel.close(); } catch {} } state.channel = null;
    if (state.stream) state.stream.getTracks().forEach(track => track.stop()); state.stream = null;
    if (state.peer) { try { state.peer.close(); } catch {} } state.peer = null;
    if (state.audio) { state.audio.pause(); state.audio.srcObject = null; }
    state.active = false; state.starting = false;
    state.transcript.clear(); state.lastSpeaker = ''; state.turn = 0;
    updateControls();
    if (message && state.open) setStatus(message);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',() => init(), {once:true});
  else init();
})();
