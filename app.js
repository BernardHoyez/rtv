// ============================================================
// RTV — Radio & TV en Direct  v3
// BernardHoyez.github.io/rtv
// ============================================================

const BASE = '/rtv';

// ── PROXY CLOUDFLARE ─────────────────────────────────────────
// Après déploiement du worker, remplacez cette URL par la vôtre :
// ex: 'https://rtv-proxy.bernard.workers.dev'
// Tant que non configuré, on tente d'abord sans proxy.
const CF_PROXY = '';   // <-- collez votre URL workers.dev ici après déploiement

// Proxy de secours public (sans réécriture Referer, moins fiable pour TV)
const PUBLIC_PROXY = 'https://corsproxy.io/?';

function proxyUrl(url) {
  if (CF_PROXY) return `${CF_PROXY}?url=${encodeURIComponent(url)}`;
  return PUBLIC_PROXY + encodeURIComponent(url);
}

// ── CHAÎNES ──────────────────────────────────────────────────
// useProxy: true  → passe directement par le proxy (TV avec CORS strict)
// adSkip:   true  → détection silence pour sauter les pubs (radios privées)
// fallbackUrl     → URL de secours automatique
// hlsQuality      → 'max' (défaut) | 'auto' | numéro de niveau

const DEFAULT_CHANNELS = [

  // ── RADIO FRANCE — flux directs, pas de pub ni CORS ──────
  { id: 'france-inter',    name: 'France Inter',    emoji: '🎙', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
  { id: 'france-info',     name: 'France Info',     emoji: '📻', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' },
  { id: 'france-culture',  name: 'France Culture',  emoji: '🎭', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3' },
  { id: 'france-musique',  name: 'France Musique',  emoji: '🎵', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
  { id: 'fip',             name: 'FIP',             emoji: '🎶', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
  { id: 'mouv',            name: "Mouv'",            emoji: '🎤', type: 'radio', category: 'Radio France',
    url: 'https://icecast.radiofrance.fr/mouv-midfi.mp3' },

  // ── RADIOS PRIVÉES ────────────────────────────────────────
  { id: 'rtl',       name: 'RTL',          emoji: '🔵', type: 'radio', category: 'Radios Privées',
    url: 'https://streaming.radio.rtl.fr/rtl-1-44-128',
    fallbackUrl: 'https://rtl2.ice.infomaniak.ch/rtl-1-44-128',
    adSkip: true },
  { id: 'europe1',   name: 'Europe 1',     emoji: '🔴', type: 'radio', category: 'Radios Privées',
    url: 'https://europe1.lmn.fm/europe1.mp3',
    fallbackUrl: 'https://e1.cdn.euradionantes.fr/europe1.mp3',
    useProxy: true, adSkip: true },
  { id: 'rmc',       name: 'RMC',          emoji: '⚽', type: 'radio', category: 'Radios Privées',
    url: 'https://rmc.bfmtv.com/rmcstream.mp3',
    useProxy: true, adSkip: true },
  { id: 'nrj',       name: 'NRJ',          emoji: '⚡', type: 'radio', category: 'Radios Privées',
    url: 'https://scdn.nrjaudio.fm/fr/30001/mp3_128.mp3?origine=fluxradios',
    fallbackUrl: 'https://nrj.ice.infomaniak.ch/nrj-high.mp3',
    adSkip: true },
  { id: 'nostalgie', name: 'Nostalgie',    emoji: '🕰', type: 'radio', category: 'Radios Privées',
    url: 'https://scdn.nrjaudio.fm/fr/30604/mp3_128.mp3?origine=fluxradios',
    fallbackUrl: 'https://nostalgie.ice.infomaniak.ch/nostalgie-high.mp3' },
  { id: 'virgin',    name: 'Virgin Radio', emoji: '💿', type: 'radio', category: 'Radios Privées',
    url: 'https://virginia.ice.infomaniak.ch/virgin-radio-high.mp3' },

  // ── TV — flux HLS, proxy requis depuis GitHub Pages ──────
  // Les URLs SFR/ncdn sont les plus stables mais bloquent le CORS sans Referer correct
  { id: 'bfmtv',    name: 'BFM TV',    emoji: '📺', type: 'tv', category: 'Info TV',
    url: 'https://ncdn-live-bfm.pfd.sfr.net/shls/LIVE$BFM_TV/index.m3u8?start=LIVE&end=END',
    fallbackUrl: 'https://bfmtvalive1-lh.akamaihd.net/i/bfmtvalive_1@96982/master.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'cnews',    name: 'CNews',     emoji: '📡', type: 'tv', category: 'Info TV',
    url: 'https://ncdn-live-cnews.pfd.sfr.net/shls/LIVE$CNEWS/index.m3u8?start=LIVE&end=END',
    fallbackUrl: 'https://cnewslive-lh.akamaihd.net/i/cnewslive_1@491220/master.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'lci',      name: 'LCI',       emoji: '🗞', type: 'tv', category: 'Info TV',
    url: 'https://ncdn-live-lci.pfd.sfr.net/shls/LIVE$LCI/index.m3u8?start=LIVE&end=END',
    fallbackUrl: 'https://lci-replay.tf1.fr/lci-live/live_lci-1600.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'tf1info',  name: 'TF1 Info',  emoji: '📰', type: 'tv', category: 'Info TV',
    url: 'https://ncdn-live-tf1info.pfd.sfr.net/shls/LIVE$TF1_INFO/index.m3u8?start=LIVE&end=END',
    useProxy: true, hlsQuality: 'max' },
  { id: 'euronews', name: 'Euronews',  emoji: '🇪🇺', type: 'tv', category: 'Info TV',
    url: 'https://euronews.cdn.enstream.ch/live/FR/euronews_fr/index.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'france24', name: 'France 24', emoji: '🌐', type: 'tv', category: 'Info TV',
    url: 'https://f24hls-i.akamaihd.net/hls/live/221147/F24_FR_HI_HLS/master.m3u8',
    fallbackUrl: 'https://f24hls-i.akamaihd.net/hls/live/221147/F24_FR_LO_HLS/master.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'arte',     name: 'Arte',      emoji: '🎨', type: 'tv', category: 'TV Culture',
    url: 'https://live6.akamaized.net/hls/live/2024693/artelive_fr/master.m3u8',
    fallbackUrl: 'https://artelive-lh.akamaihd.net/i/artelive_fr@393591/master.m3u8',
    useProxy: true, hlsQuality: 'max' },
  { id: 'france5',  name: 'France 5',  emoji: '🔬', type: 'tv', category: 'TV Culture',
    url: 'https://simulcast.france.tv/stream/france_5/index.m3u8',
    useProxy: true, hlsQuality: 'max' },

  // ── RADIO INTERNATIONALE ──────────────────────────────────
  { id: 'rfi',             name: 'RFI',               emoji: '🌍', type: 'radio', category: 'International',
    url: 'https://rfifr.ice.infomaniak.ch/rfifr-high.mp3' },
  { id: 'bbc-world',       name: 'BBC World Service', emoji: '🇬🇧', type: 'radio', category: 'International',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
  { id: 'dw',              name: 'Deutsche Welle',    emoji: '🇩🇪', type: 'radio', category: 'International',
    url: 'https://rssl.dw.com/francefrancais.mp3',
    useProxy: true },

  // ── MUSIQUE ───────────────────────────────────────────────
  { id: 'radio-classique', name: 'Radio Classique',   emoji: '🎻', type: 'radio', category: 'Musique',
    url: 'https://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3' },
  { id: 'jazz-radio',      name: 'Jazz Radio',        emoji: '🎷', type: 'radio', category: 'Musique',
    url: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
  { id: 'tsfjazz',         name: 'TSF Jazz',          emoji: '🎺', type: 'radio', category: 'Musique',
    url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3' },
];

// ── STATE ─────────────────────────────────────────────────────
let channels       = [];
let favorites      = new Set();
let currentChannel = null;
let currentTab     = 'all';
let searchQuery    = '';
let hls            = null;
let isPlaying      = false;
let adSkipCtx      = null;

// ── DOM REFS ──────────────────────────────────────────────────
const channelList     = document.getElementById('channel-list');
const videoEl         = document.getElementById('video-player');
const audioEl         = document.getElementById('audio-player');
const channelName     = document.getElementById('channel-name');
const channelLogo     = document.getElementById('channel-logo');
const channelTypeBadge= document.getElementById('channel-type-badge');
const favBtn          = document.getElementById('fav-btn');
const playPauseBtn    = document.getElementById('play-pause-btn');
const volumeSlider    = document.getElementById('volume');
const volIcon         = document.getElementById('vol-icon');
const loadingSpinner  = document.getElementById('loading-spinner');
const loadingMsg      = document.getElementById('loading-msg');
const playerError     = document.getElementById('player-error');
const errorMsg        = document.getElementById('error-msg');
const retryBtn        = document.getElementById('retry-btn');
const placeholder     = document.getElementById('player-placeholder');
const progressWrap    = document.getElementById('progress-wrap');
const progressFill    = document.getElementById('progress-fill');
const fullscreenBtn   = document.getElementById('fullscreen-btn');
const pipBtn          = document.getElementById('pip-btn');
const installBanner   = document.getElementById('install-banner');
const installBtn      = document.getElementById('install-btn');
const installDismiss  = document.getElementById('install-dismiss');
const m3uInput        = document.getElementById('m3u-input');
const importBtn       = document.getElementById('import-btn');
const searchInput     = document.getElementById('search');
const sidebar         = document.getElementById('sidebar');
const menuToggle      = document.getElementById('menu-toggle');
const adSkipBanner    = document.getElementById('ad-skip-banner');
const adSkipCounter   = document.getElementById('ad-skip-counter');

// ── INIT ──────────────────────────────────────────────────────
function init() {
  loadStorage();
  channels = [...DEFAULT_CHANNELS, ...loadCustomChannels()];
  renderList();
  bindEvents();
  registerSW();
  checkPIP();
}

function loadStorage() {
  try {
    const f = localStorage.getItem('rtv-favorites');
    if (f) favorites = new Set(JSON.parse(f));
  } catch(e) {}
}
function saveFavorites() {
  localStorage.setItem('rtv-favorites', JSON.stringify([...favorites]));
}
function loadCustomChannels() {
  try { return JSON.parse(localStorage.getItem('rtv-custom-channels') || '[]'); }
  catch(e) { return []; }
}
function saveCustomChannels(list) {
  const custom = list.filter(c => !DEFAULT_CHANNELS.find(d => d.id === c.id));
  localStorage.setItem('rtv-custom-channels', JSON.stringify(custom));
}

// ── RENDER ────────────────────────────────────────────────────
function renderList() {
  let list = channels;
  if (currentTab === 'radio')  list = list.filter(c => c.type === 'radio');
  else if (currentTab === 'tv')    list = list.filter(c => c.type === 'tv');
  else if (currentTab === 'favs')  list = list.filter(c => favorites.has(c.id));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.category||'').toLowerCase().includes(q));
  }
  if (!list.length) { channelList.innerHTML = `<div class="empty-state">Aucune chaîne trouvée</div>`; return; }

  const grouped = {};
  list.forEach(c => { const cat = c.category||'Autres'; (grouped[cat]=grouped[cat]||[]).push(c); });

  let html = '';
  for (const [cat, items] of Object.entries(grouped)) {
    if (currentTab !== 'favs' && !searchQuery)
      html += `<div class="section-header">${cat}</div>`;
    items.forEach(c => {
      const isFav = favorites.has(c.id);
      const isActive = currentChannel?.id === c.id;
      const proxyTag = c.useProxy ? ' <span class="proxy-tag">proxy</span>' : '';
      html += `
        <div class="channel-item${isActive?' active':''}" data-id="${c.id}">
          <div class="channel-emoji">${c.emoji||'📻'}</div>
          <div class="channel-info">
            <div class="channel-item-name">${escHtml(c.name)}${proxyTag}</div>
            <div class="channel-item-cat">${escHtml(c.category||'')}</div>
          </div>
          <span class="type-badge ${c.type}">${c.type==='tv'?'TV':'Radio'}</span>
          <button class="fav-star${isFav?' active':''}" data-fav="${c.id}">${isFav?'★':'☆'}</button>
        </div>`;
    });
  }
  channelList.innerHTML = html;
}

function escHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── PLAY ──────────────────────────────────────────────────────
function playChannel(ch) {
  currentChannel = ch;
  renderList(); updateNowPlaying();
  stopMedia();
  showLoading(true, 'Connexion…');
  hideError(); hidePlaceholder(); hideAdSkip();
  _doPlay(ch, ch.useProxy);
}

function _doPlay(ch, withProxy) {
  const url = withProxy ? proxyUrl(ch.url) : ch.url;
  const isHLS = /\.m3u8|isml|manifest/.test(ch.url);
  if (ch.type === 'tv' || isHLS) playVideo(url, ch);
  else playAudio(url, ch);
}

// ── VIDEO ─────────────────────────────────────────────────────
function playVideo(url, ch) {
  videoEl.style.display = 'block';
  audioEl.src = '';
  progressWrap.removeAttribute('hidden');

  if (hls) { hls.destroy(); hls = null; }

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      maxBufferLength: 15,
      maxMaxBufferLength: 30,
      startLevel: -1,          // laisser hls.js choisir au départ
      capLevelToPlayerSize: false,
    });
    hls.loadSource(url);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      // Forcer le niveau de qualité maximale
      const levels = data.levels;
      if (levels && levels.length > 1) {
        hls.currentLevel = levels.length - 1;   // niveau le plus haut
        hls.loadLevel    = levels.length - 1;
      }
      videoEl.volume = parseFloat(volumeSlider.value);
      videoEl.play().catch(e => tryFallback(e, ch, 'video'));
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        if (!ch._usedFallback && ch.fallbackUrl) {
          showLoading(true, 'Flux principal indisponible, flux de secours…');
          setTimeout(() => {
            hls.destroy(); hls = null;
            playVideo(ch.fallbackUrl, { ...ch, url: ch.fallbackUrl, fallbackUrl: null, _usedFallback: true, useProxy: false });
          }, 600);
        } else if (!ch._usedProxy && (CF_PROXY || PUBLIC_PROXY)) {
          showLoading(true, 'Tentative via proxy…');
          setTimeout(() => {
            hls.destroy(); hls = null;
            playVideo(proxyUrl(ch.url), { ...ch, _usedProxy: true });
          }, 600);
        } else {
          showError('Flux TV indisponible (CORS). Déployez le proxy Cloudflare pour accéder à cette chaîne.', true);
        }
      }
    });

  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari — HLS natif
    videoEl.src = url;
    videoEl.volume = parseFloat(volumeSlider.value);
    videoEl.play().catch(e => tryFallback(e, ch, 'video'));
  } else {
    showError('HLS non supporté sur ce navigateur');
  }
}

// ── AUDIO ─────────────────────────────────────────────────────
function playAudio(url, ch) {
  videoEl.style.display = 'none';
  stopAdSkip();
  audioEl.src = url;
  audioEl.volume = parseFloat(volumeSlider.value);
  audioEl.play().catch(e => tryFallback(e, ch, 'audio'));
  audioEl.addEventListener('playing', () => {
    if (ch.adSkip) startAdSkipDetection();
  }, { once: true });
}

function tryFallback(err, ch, mode) {
  console.warn('Erreur lecture:', err?.message || err);
  // 1. fallbackUrl direct
  if (!ch._usedFallback && ch.fallbackUrl) {
    showLoading(true, 'Flux de secours…');
    const next = { ...ch, url: ch.fallbackUrl, fallbackUrl: null, _usedFallback: true, useProxy: false };
    setTimeout(() => mode === 'video' ? playVideo(ch.fallbackUrl, next) : playAudio(ch.fallbackUrl, next), 400);
    return;
  }
  // 2. proxy
  if (!ch._usedProxy) {
    showLoading(true, 'Tentative via proxy CORS…');
    const pUrl = proxyUrl(ch.url);
    const next = { ...ch, _usedProxy: true };
    setTimeout(() => mode === 'video' ? playVideo(pUrl, next) : playAudio(pUrl, next), 400);
    return;
  }
  showLoading(false);
  showError('Flux indisponible — CORS ou service arrêté', true);
}

function stopMedia() {
  stopAdSkip();
  if (hls) { hls.destroy(); hls = null; }
  videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'none';
  audioEl.pause(); audioEl.src = '';
  setPlaying(false);
  progressFill.style.width = '0%';
  progressWrap.setAttribute('hidden', '');
}

function setPlaying(val) {
  isPlaying = val;
  playPauseBtn.textContent = val ? '⏸' : '▶';
  playPauseBtn.classList.toggle('playing', val);
}

function updateNowPlaying() {
  if (!currentChannel) return;
  channelName.textContent  = currentChannel.name;
  channelLogo.textContent  = currentChannel.emoji || '📻';
  channelTypeBadge.textContent = currentChannel.type === 'tv' ? '📺 Chaîne TV' : '📻 Radio';
  favBtn.classList.toggle('active', favorites.has(currentChannel.id));
  favBtn.textContent = favorites.has(currentChannel.id) ? '★' : '♡';
  playPauseBtn.disabled = false;
}

function showLoading(v, msg) { loadingSpinner.hidden = !v; if (msg && loadingMsg) loadingMsg.textContent = msg; }
function hideError()       { playerError.hidden = true; }
function hidePlaceholder() { placeholder.style.display = 'none'; }
function hideAdSkip()      { if (adSkipBanner) adSkipBanner.hidden = true; }
function showError(msg, retry) {
  playerError.hidden = false;
  errorMsg.textContent = msg || 'Flux indisponible';
  if (retryBtn) retryBtn.style.display = retry ? 'inline-block' : 'none';
  showLoading(false);
}

// ── AD SKIP — DÉTECTION DE SILENCE ───────────────────────────
const SILENCE_THRESHOLD = 0.015;
const SILENCE_DURATION  = 1500;
const AD_MAX_WAIT       = 30000;
let silenceStart = null, adForceTimer = null;
let adSkipAnalyser = null, adSkipSource = null, adSkipRafId = null, adSkipActive = false;

function startAdSkipDetection() {
  stopAdSkip();
  try {
    adSkipCtx      = new (window.AudioContext || window.webkitAudioContext)();
    adSkipSource   = adSkipCtx.createMediaElementSource(audioEl);
    adSkipAnalyser = adSkipCtx.createAnalyser();
    adSkipAnalyser.fftSize = 2048;
    adSkipSource.connect(adSkipAnalyser);
    adSkipAnalyser.connect(adSkipCtx.destination);
    adSkipActive = true; silenceStart = null;
    adForceTimer = setTimeout(() => { if (adSkipActive) reloadStreamAfterAd(); }, AD_MAX_WAIT);
    checkSilence();
  } catch(e) { console.warn('AdSkip AudioContext:', e); }
}

function checkSilence() {
  if (!adSkipActive || !adSkipAnalyser) return;
  const buf = new Float32Array(adSkipAnalyser.fftSize);
  adSkipAnalyser.getFloatTimeDomainData(buf);
  const rms = Math.sqrt(buf.reduce((s,v) => s + v*v, 0) / buf.length);
  if (rms < SILENCE_THRESHOLD) {
    if (!silenceStart) silenceStart = Date.now();
    const elapsed = Date.now() - silenceStart;
    if (elapsed >= SILENCE_DURATION) { reloadStreamAfterAd(); return; }
    const rem = Math.ceil((SILENCE_DURATION - elapsed) / 1000);
    showAdSkipBanner(`Pub détectée — rechargement dans ${rem}s…`);
  } else {
    silenceStart = null; hideAdSkip();
  }
  adSkipRafId = requestAnimationFrame(checkSilence);
}

function reloadStreamAfterAd() {
  stopAdSkip();
  if (!currentChannel) return;
  showLoading(true, 'Rechargement après pub…');
  const src = audioEl.src;
  audioEl.pause();
  setTimeout(() => {
    audioEl.src = src;
    audioEl.play().catch(console.warn);
    if (currentChannel.adSkip) audioEl.addEventListener('playing', () => startAdSkipDetection(), { once: true });
  }, 400);
}

function showAdSkipBanner(msg) {
  if (!adSkipBanner) return;
  adSkipBanner.hidden = false;
  if (adSkipCounter) adSkipCounter.textContent = msg;
}

function stopAdSkip() {
  adSkipActive = false;
  if (adSkipRafId)    { cancelAnimationFrame(adSkipRafId); adSkipRafId = null; }
  if (adForceTimer)   { clearTimeout(adForceTimer); adForceTimer = null; }
  if (adSkipSource)   { try { adSkipSource.disconnect(); } catch(e){} adSkipSource = null; }
  if (adSkipAnalyser) { try { adSkipAnalyser.disconnect(); } catch(e){} adSkipAnalyser = null; }
  if (adSkipCtx && adSkipCtx.state !== 'closed') { adSkipCtx.close().catch(()=>{}); adSkipCtx = null; }
  silenceStart = null; hideAdSkip();
}

// ── EVENTS ────────────────────────────────────────────────────
function bindEvents() {
  channelList.addEventListener('click', e => {
    const fEl = e.target.closest('[data-fav]');
    if (fEl) { e.stopPropagation(); toggleFav(fEl.dataset.fav); return; }
    const item = e.target.closest('[data-id]');
    if (item) { const ch = channels.find(c => c.id === item.dataset.id); if (ch) { playChannel(ch); closeSidebar(); } }
  });

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); currentTab = btn.dataset.tab; renderList();
    });
  });

  searchInput.addEventListener('input', e => { searchQuery = e.target.value.trim(); renderList(); });
  favBtn.addEventListener('click', () => { if (currentChannel) toggleFav(currentChannel.id); });

  playPauseBtn.addEventListener('click', () => {
    const el = (currentChannel?.type === 'tv' || hls) ? videoEl : audioEl;
    el.paused ? el.play().catch(console.warn) : el.pause();
  });

  retryBtn?.addEventListener('click', () => { if (currentChannel) playChannel(currentChannel); });

  volumeSlider.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    videoEl.volume = v; audioEl.volume = v;
    volIcon.textContent = v === 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
  });

  [videoEl, audioEl].forEach(el => {
    el.addEventListener('playing',    () => { showLoading(false); setPlaying(true); hideAdSkip(); });
    el.addEventListener('waiting',    () => showLoading(true, 'Mise en mémoire tampon…'));
    el.addEventListener('pause',      () => setPlaying(false));
    el.addEventListener('canplay',    () => showLoading(false));
    el.addEventListener('timeupdate', updateProgress);
    el.addEventListener('error', () => {
      if (currentChannel) tryFallback(null, currentChannel, currentChannel.type === 'tv' ? 'video' : 'audio');
    });
  });

  fullscreenBtn.addEventListener('click', () => {
    const el = videoEl.style.display !== 'none' ? videoEl : document.getElementById('media-wrap');
    document.fullscreenElement ? document.exitFullscreen?.() : el.requestFullscreen?.();
  });

  pipBtn?.addEventListener('click', async () => {
    try {
      document.pictureInPictureElement
        ? await document.exitPictureInPicture()
        : videoEl.style.display !== 'none' && await videoEl.requestPictureInPicture();
    } catch(e) { console.warn(e); }
  });

  importBtn.addEventListener('click', () => m3uInput.click());
  m3uInput.addEventListener('change', e => { const f = e.target.files[0]; if (f) importM3U(f); m3uInput.value = ''; });

  installBtn?.addEventListener('click', () => { deferredPrompt?.prompt(); installBanner.hidden = true; });
  installDismiss?.addEventListener('click', () => { localStorage.setItem('rtv-install-dismissed','1'); installBanner.hidden = true; });

  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('main').addEventListener('click', closeSidebar);
}

function closeSidebar() { if (window.innerWidth <= 700) sidebar.classList.remove('open'); }
function toggleFav(id) {
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  saveFavorites(); renderList();
  if (currentChannel?.id === id) { favBtn.classList.toggle('active', favorites.has(id)); favBtn.textContent = favorites.has(id) ? '★' : '♡'; }
}
function updateProgress() {
  const el = (hls || videoEl.src) ? videoEl : audioEl;
  if (el.duration && isFinite(el.duration)) progressFill.style.width = (el.currentTime / el.duration * 100) + '%';
}

// ── M3U IMPORT ────────────────────────────────────────────────
function importM3U(file) {
  const r = new FileReader();
  r.onload = e => {
    const parsed = parseM3U(e.target.result);
    if (!parsed.length) { alert('Aucune chaîne trouvée.'); return; }
    let added = 0;
    parsed.forEach(ch => { if (!channels.find(c => c.id === ch.id)) { channels.push(ch); added++; } });
    saveCustomChannels(channels); renderList();
    alert(`✅ ${added} chaîne(s) importée(s) !`);
  };
  r.readAsText(file);
}

function parseM3U(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = []; let cur = null;
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const name = line.match(/tvg-name="([^"]+)"/)?.[1] || line.match(/,(.+)$/)?.[1] || 'Chaîne';
      const cat  = line.match(/group-title="([^"]+)"/)?.[1];
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1];
      const id   = 'custom-' + name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,28) + '-' + Math.random().toString(36).slice(2,6);
      cur = { id, name, emoji: guessEmoji(name,cat), type: guessType(cat||name), category: cat||'Importées', url: null, logo: logo||null };
    } else if (line && !line.startsWith('#') && cur) { cur.url = line; result.push(cur); cur = null; }
  }
  return result;
}
function guessType(s='') { return /radio|music|fm|am/.test(s.toLowerCase()) ? 'radio' : 'tv'; }
function guessEmoji(n='', c='') {
  const s=(n+c).toLowerCase();
  if (/news|info|journal/.test(s)) return '📰'; if (/sport|foot/.test(s)) return '⚽';
  if (/music|jazz|class|rock|pop/.test(s)) return '🎵'; if (/film|cine/.test(s)) return '🎬';
  if (/arte|culture/.test(s)) return '🎨'; if (/kids|enfant/.test(s)) return '🧒';
  return '📺';
}

// ── SERVICE WORKER ────────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register(BASE + '/sw.js', { scope: BASE + '/' }).catch(console.error);
}

// ── PWA INSTALL ───────────────────────────────────────────────
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  if (!localStorage.getItem('rtv-install-dismissed')) installBanner.hidden = false;
});
window.addEventListener('appinstalled', () => { installBanner.hidden = true; deferredPrompt = null; });

function checkPIP() { if ('pictureInPictureEnabled' in document) pipBtn?.removeAttribute('hidden'); }

init();
