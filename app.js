/**
 * app.js
 * TANCHJIM BUNNY STUDIO - Desktop & Mobile Responsive Controller
 * Tích hợp: Audio Signal Generator, A/B Bypass Compare, Shareable URL Profile, Touch-optimized Canvas.
 */

import { calculateTotalResponse, calculateBiquadCoefficients, getBiquadMagnitudeDb } from './dspMath.js';
import { TanchjimBunnyController } from './deviceProtocol.js';

const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const MIN_DB = -10;
const MAX_DB = 10;

const STORAGE_LAST_STATE = 'tanchjim_bunny_last_state_v5';
const STORAGE_USER_PRESETS = 'tanchjim_bunny_user_presets_v5';
const DEFAULT_FREQS = [40, 100, 250, 600, 1500, 3500, 7000, 12000];

const BUILTIN_PRESETS = {
  flat: { name: 'Flat (Nguyên bản)', bands: [] },
  fps: {
    name: 'Gaming FPS (Nghe bước chân)',
    bands: [
      { freq: 60, gain: -3.5, q: 1.0, enabled: true },
      { freq: 180, gain: -2.0, q: 1.2, enabled: true },
      { freq: 2200, gain: 3.5, q: 1.6, enabled: true },
      { freq: 4500, gain: 4.0, q: 1.8, enabled: true },
      { freq: 8500, gain: 2.0, q: 1.4, enabled: true },
    ],
  },
  harman: {
    name: 'Harman IE 2019 Target',
    bands: [
      { freq: 60, gain: 3.5, q: 0.8, enabled: true },
      { freq: 200, gain: -2.2, q: 1.3, enabled: true },
      { freq: 1500, gain: 1.2, q: 1.8, enabled: true },
      { freq: 3200, gain: 2.8, q: 2.0, enabled: true },
      { freq: 8000, gain: 1.5, q: 1.5, enabled: true },
    ],
  },
  vocal: {
    name: 'Vocal & Acoustic (Trong trẻo)',
    bands: [
      { freq: 110, gain: -2.0, q: 1.1, enabled: true },
      { freq: 900, gain: 1.5, q: 1.4, enabled: true },
      { freq: 2600, gain: 3.2, q: 1.8, enabled: true },
      { freq: 5200, gain: 1.8, q: 2.2, enabled: true },
    ],
  },
  bass: {
    name: 'Sub-Bass Boost (Trầm sâu)',
    bands: [
      { freq: 45, gain: 5.5, q: 0.9, enabled: true },
      { freq: 100, gain: 3.5, q: 1.1, enabled: true },
      { freq: 220, gain: -1.8, q: 1.5, enabled: true },
      { freq: 3500, gain: 1.2, q: 1.8, enabled: true },
    ],
  },
};

// DOM Elements
const canvas = document.getElementById('eqCanvas');
const ctx = canvas.getContext('2d');
const bandsContainer = document.getElementById('bandsContainer');
const hoverReadout = document.getElementById('hoverReadout');
const hidLogBox = document.getElementById('hidLogBox');
const chkAutoWrite = document.getElementById('chkAutoWrite');
const btnPullHardware = document.getElementById('btnPullHardware');
const presetSelect = document.getElementById('presetSelect');
const btnDeleteCustomPreset = document.getElementById('btnDeleteCustomPreset');
const headroomBadge = document.getElementById('headroomBadge');

function appendLog(msg) {
  const line = document.createElement('div');
  const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
  line.textContent = `[${time}] ${msg}`;
  hidLogBox.appendChild(line);
  hidLogBox.scrollTop = hidLogBox.scrollHeight;
}

function createEmptyBands() {
  return Array.from({ length: 8 }, (_, i) => ({
    type: 'PK',
    freq: DEFAULT_FREQS[i],
    gain: 0.0,
    q: 1.0,
    enabled: true,
  }));
}

// ============================================================================
// 1. KIỂM TRA NỀN TẢNG (DESKTOP / ANDROID / iOS) & LINK CHIA SẺ
// ============================================================================
function detectPlatformCompatibility() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.getElementById('deviceSubInfo').textContent =
      'Chế độ iOS Mobile: Chỉnh đồ thị, nghe thử tín hiệu & tạo link chia sẻ (WebHID hỗ trợ trên Chrome Mac/Android).';
    appendLog('[iOS] Phát hiện Safari/iOS: Đã bật chế độ Mobile Tuner & Audio Tester.');
  }
}

function loadBandsFromUrlHash() {
  try {
    if (window.location.hash.startsWith('#eq=')) {
      const encoded = window.location.hash.slice(4);
      const decoded = JSON.parse(atob(encoded));
      if (Array.isArray(decoded) && decoded.length === 8) {
        appendLog('[SHARE] Đã nạp cấu hình EQ từ đường link chia sẻ!');
        history.replaceState(null, '', window.location.pathname);
        return decoded;
      }
    }
  } catch (e) {
    console.warn('Hash không hợp lệ:', e);
  }
  return null;
}

function getUserPresets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER_PRESETS)) || {};
  } catch {
    return {};
  }
}

function saveUserPresets(presetsObj) {
  localStorage.setItem(STORAGE_USER_PRESETS, JSON.stringify(presetsObj));
}

function loadInitialBands() {
  const fromUrl = loadBandsFromUrlHash();
  if (fromUrl) return fromUrl;

  try {
    const raw = localStorage.getItem(STORAGE_LAST_STATE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 8) {
        appendLog('[AUTO-RESTORE] Đã khôi phục cấu hình EQ gần nhất.');
        return parsed;
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return createEmptyBands();
}

function persistBandsToLocal(currentBands) {
  try {
    localStorage.setItem(STORAGE_LAST_STATE, JSON.stringify(currentBands));
  } catch (e) {
    console.warn(e);
  }
}

let bands = loadInitialBands();
let isBypassed = false;
let draggingBandIndex = -1;
let hoveredBandIndex = -1;
let autoWriteTimer = null;

const bunnyController = new TanchjimBunnyController(appendLog);

bunnyController.onHardwareBandsRead = (hwBands) => {
  bands = hwBands;
  persistBandsToLocal(bands);
  renderPresetDropdown('current');
  renderBandCards();
  renderGraph();
};

function scheduleAutoWrite() {
  persistBandsToLocal(bands);
  updateHeadroomIndicator();
  if (!chkAutoWrite.checked || !bunnyController.isConnected()) return;

  clearTimeout(autoWriteTimer);
  autoWriteTimer = setTimeout(() => {
    const targetBands = isBypassed ? createEmptyBands() : bands;
    bunnyController.writeAndSaveBands(targetBands).catch((err) => appendLog(`[ERROR] ${err.message}`));
  }, 250);
}

// ============================================================================
// 2. TÍNH TOÁN HEADROOM AN TOÀN CHỐNG CLIPPING
// ============================================================================
function updateHeadroomIndicator() {
  const testFreqs = [30, 60, 120, 250, 500, 1000, 2500, 5000, 10000, 16000];
  const resp = calculateTotalResponse(bands, testFreqs);
  const maxPeak = Math.max(0, ...resp);

  if (maxPeak > 6.5) {
    headroomBadge.className = 'bg-amber-950/60 border border-amber-700/60 px-2.5 py-1 rounded-lg text-amber-300';
    headroomBadge.textContent = `Peak: +${maxPeak.toFixed(1)} dB (Nên giảm nhẹ Gain)`;
  } else {
    headroomBadge.className = 'bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-lg text-emerald-300';
    headroomBadge.textContent = `Headroom: Tốt (+${maxPeak.toFixed(1)} dB)`;
  }
}

// ============================================================================
// 3. BỘ PHÁT ÂM THANH KIỂM TRA EQ (WEB AUDIO API TONE & PINK NOISE)
// ============================================================================
let audioCtx = null;
let activeSource = null;
let activeTestType = null;

function stopTestAudio() {
  if (activeSource) {
    try { activeSource.stop(); } catch {}
    activeSource.disconnect();
    activeSource = null;
  }
  activeTestType = null;
  document.getElementById('toneStatus').textContent = 'Tắt';
  document.getElementById('toneStatus').className = 'text-[11px] font-mono text-slate-500';
  ['btnTestPink', 'btnTestSweep', 'btnTestBass'].forEach((id) => {
    document.getElementById(id).classList.remove('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
  });
}

function toggleTestAudio(type, btnId) {
  if (activeTestType === type) {
    stopTestAudio();
    return;
  }
  stopTestAudio();

  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.18; // Âm lượng an toàn bảo vệ tai
  masterGain.connect(audioCtx.destination);

  if (type === 'pink') {
    const bufferSize = audioCtx.sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(masterGain);
    noise.start();
    activeSource = noise;
  } else if (type === 'sweep') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(25, now);
    osc.frequency.exponentialRampToValueAtTime(16000, now + 8);
    osc.connect(masterGain);
    osc.start();
    osc.onended = () => stopTestAudio();
    activeSource = osc;
    setTimeout(() => { if (activeTestType === 'sweep') stopTestAudio(); }, 8100);
  } else if (type === 'bass') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 50;
    osc.connect(masterGain);
    osc.start();
    activeSource = osc;
  }

  activeTestType = type;
  document.getElementById('toneStatus').textContent = `Đang phát: ${type.toUpperCase()}`;
  document.getElementById('toneStatus').className = 'text-[11px] font-mono text-cyan-400 animate-pulse';
  document.getElementById(btnId).classList.add('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
}

document.getElementById('btnTestPink').addEventListener('click', () => toggleTestAudio('pink', 'btnTestPink'));
document.getElementById('btnTestSweep').addEventListener('click', () => toggleTestAudio('sweep', 'btnTestSweep'));
document.getElementById('btnTestBass').addEventListener('click', () => toggleTestAudio('bass', 'btnTestBass'));

// ============================================================================
// 4. SO SÁNH NHANH A/B (BYPASS EQ)
// ============================================================================
const btnBypassToggle = document.getElementById('btnBypassToggle');
btnBypassToggle.addEventListener('click', async () => {
  isBypassed = !isBypassed;
  const dot = document.getElementById('bypassDot');
  const txt = document.getElementById('bypassText');

  if (isBypassed) {
    dot.className = 'w-2 h-2 rounded-full bg-slate-500';
    txt.textContent = 'EQ: OFF (Gốc)';
    btnBypassToggle.classList.replace('text-cyan-300', 'text-slate-400');
    appendLog('[A/B] Đã tạm tắt EQ (nghe chất âm gốc của tai nghe).');
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-cyan-400';
    txt.textContent = 'EQ: ON';
    btnBypassToggle.classList.replace('text-slate-400', 'text-cyan-300');
    appendLog('[A/B] Đã bật lại cấu hình EQ.');
  }

  renderGraph();
  if (bunnyController.isConnected()) {
    const targetBands = isBypassed ? createEmptyBands() : bands;
    await bunnyController.writeAndSaveBands(targetBands);
  }
});

// ============================================================================
// 5. VẼ BIỂU ĐỒ CANVAS TƯƠNG TÁC (DESKTOP + TOUCH MOBILE)
// ============================================================================
const PADDING = { top: 20, right: 18, bottom: 26, left: 38 };

function freqToX(freq, width) {
  const plotW = width - PADDING.left - PADDING.right;
  const ratio = (Math.log10(freq) - Math.log10(MIN_FREQ)) / (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ));
  return PADDING.left + ratio * plotW;
}

function xToFreq(x, width) {
  const plotW = width - PADDING.left - PADDING.right;
  const ratio = Math.max(0, Math.min(1, (x - PADDING.left) / plotW));
  return Math.pow(10, Math.log10(MIN_FREQ) + ratio * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ)));
}

function dbToY(db, height) {
  const plotH = height - PADDING.top - PADDING.bottom;
  return PADDING.top + ((MAX_DB - db) / (MAX_DB - MIN_DB)) * plotH;
}

function yToDb(y, height) {
  const plotH = height - PADDING.top - PADDING.bottom;
  const ratio = Math.max(0, Math.min(1, (y - PADDING.top) / plotH));
  return MAX_DB - ratio * (MAX_DB - MIN_DB);
}

function renderGraph() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;

  ctx.fillStyle = '#080a0f';
  ctx.fillRect(0, 0, W, H);

  const gridFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  ctx.lineWidth = 1;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';

  gridFreqs.forEach((f) => {
    const x = freqToX(f, W);
    ctx.strokeStyle = [100, 1000, 10000].includes(f) ? '#1e2533' : '#11151f';
    ctx.beginPath();
    ctx.moveTo(x, PADDING.top);
    ctx.lineTo(x, H - PADDING.bottom);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, H - 8);
  });

  const gridDbs = [-10, -5, 0, 5, 10];
  ctx.textAlign = 'right';
  gridDbs.forEach((db) => {
    const y = dbToY(db, H);
    ctx.strokeStyle = db === 0 ? '#334155' : '#11151f';
    ctx.lineWidth = db === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, y);
    ctx.lineTo(W - PADDING.right, y);
    ctx.stroke();

    ctx.fillStyle = db === 0 ? '#94a3b8' : '#64748b';
    ctx.fillText(`${db > 0 ? '+' : ''}${db}`, PADDING.left - 6, y + 3);
  });

  const numSamples = 350;
  const sampleFreqs = [];
  for (let i = 0; i <= numSamples; i++) {
    const ratio = i / numSamples;
    sampleFreqs.push(Math.pow(10, Math.log10(MIN_FREQ) + ratio * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ))));
  }

  // Đường cong riêng của Band đang chạm
  const activeIdx = draggingBandIndex !== -1 ? draggingBandIndex : hoveredBandIndex;
  if (!isBypassed && activeIdx !== -1 && bands[activeIdx].enabled) {
    const b = bands[activeIdx];
    const singleCoeff = calculateBiquadCoefficients(b.freq, b.gain, b.q);
    ctx.beginPath();
    sampleFreqs.forEach((f, idx) => {
      const db = Math.max(MIN_DB, Math.min(MAX_DB, getBiquadMagnitudeDb(singleCoeff, f)));
      const x = freqToX(f, W);
      const y = dbToY(db, H);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Đường đáp tuyến chính
  const activeBands = isBypassed ? createEmptyBands() : bands;
  const responseDbs = calculateTotalResponse(activeBands, sampleFreqs);

  const gradient = ctx.createLinearGradient(0, PADDING.top, 0, H - PADDING.bottom);
  gradient.addColorStop(0, isBypassed ? 'rgba(148, 163, 184, 0.1)' : 'rgba(34, 211, 238, 0.28)');
  gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.02)');
  gradient.addColorStop(1, isBypassed ? 'rgba(148, 163, 184, 0.1)' : 'rgba(34, 211, 238, 0.28)');

  const zeroY = dbToY(0, H);
  ctx.beginPath();
  ctx.moveTo(freqToX(sampleFreqs[0], W), zeroY);
  sampleFreqs.forEach((f, idx) => {
    const clampedDb = Math.max(MIN_DB, Math.min(MAX_DB, responseDbs[idx]));
    ctx.lineTo(freqToX(f, W), dbToY(clampedDb, H));
  });
  ctx.lineTo(freqToX(sampleFreqs[sampleFreqs.length - 1], W), zeroY);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  sampleFreqs.forEach((f, idx) => {
    const clampedDb = Math.max(MIN_DB, Math.min(MAX_DB, responseDbs[idx]));
    const x = freqToX(f, W);
    const y = dbToY(clampedDb, H);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = isBypassed ? '#64748b' : '#22d3ee';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Vẽ các điểm Node (kích thước lớn hơn trên cảm ứng để dễ chạm ngón tay)
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const nodeRadius = isTouch ? 8.5 : 6;

  bands.forEach((band, index) => {
    const x = freqToX(band.freq, W);
    const y = dbToY(isBypassed ? 0 : band.gain, H);
    const isSelected = index === draggingBandIndex || index === hoveredBandIndex;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.22)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, isSelected ? nodeRadius + 2 : nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = isBypassed ? '#475569' : band.enabled ? (isSelected ? '#ffffff' : '#06b6d4') : '#334155';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#080a0f';
    ctx.stroke();

    ctx.fillStyle = isSelected ? '#fde047' : '#e2e8f0';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${index + 1}`, x, y - (nodeRadius + 5));
  });

  ctx.restore();
}

canvas.addEventListener('pointerdown', (e) => {
  if (isBypassed) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let closestIdx = -1;
  let minDist = 24; // Vùng chạm rộng 24px cho ngón tay điện thoại
  bands.forEach((band, idx) => {
    const dist = Math.hypot(mx - freqToX(band.freq, rect.width), my - dbToY(band.gain, rect.height));
    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });

  if (closestIdx !== -1) {
    draggingBandIndex = closestIdx;
    canvas.setPointerCapture(e.pointerId);
    renderGraph();
  }
});

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const cursorFreq = Math.round(xToFreq(mx, rect.width));
  const cursorDb = yToDb(my, rect.height).toFixed(1);
  hoverReadout.textContent = `${cursorFreq} Hz | ${cursorDb > 0 ? '+' : ''}${cursorDb} dB`;

  if (draggingBandIndex !== -1) {
    bands[draggingBandIndex].freq = Math.round(xToFreq(mx, rect.width));
    bands[draggingBandIndex].gain = Math.round(yToDb(my, rect.height) * 10) / 10;
    bands[draggingBandIndex].enabled = true;

    updateCardInputs(draggingBandIndex);
    renderGraph();
    return;
  }

  let hoverIdx = -1;
  bands.forEach((band, idx) => {
    if (Math.hypot(mx - freqToX(band.freq, rect.width), my - dbToY(band.gain, rect.height)) < 16) hoverIdx = idx;
  });

  if (hoverIdx !== hoveredBandIndex) {
    hoveredBandIndex = hoverIdx;
    canvas.style.cursor = hoverIdx !== -1 ? 'grab' : 'crosshair';
    renderGraph();
  }
});

canvas.addEventListener('pointerup', (e) => {
  if (draggingBandIndex !== -1) {
    draggingBandIndex = -1;
    canvas.releasePointerCapture(e.pointerId);
    renderPresetDropdown('current');
    renderGraph();
    scheduleAutoWrite();
  }
});

// ============================================================================
// 6. RENDER 8 BAND CARDS (TỐI ƯU CẢ MOBILE LẪN DESKTOP)
// ============================================================================
function renderBandCards() {
  bandsContainer.innerHTML = '';
  bands.forEach((band, idx) => {
    const card = document.createElement('div');
    card.className = 'bg-[#0e121a] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-3 hover:border-slate-700/90 transition shadow-md';
    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">#${idx + 1}</span>
          <span class="text-xs font-medium text-slate-300">Peak Filter</span>
        </div>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" data-idx="${idx}" data-field="enabled" ${band.enabled ? 'checked' : ''} class="w-4 h-4 accent-cyan-500 rounded cursor-pointer" />
          <span class="text-[11px] text-slate-400">Bật</span>
        </label>
      </div>

      <!-- Gain Slider & Input -->
      <div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Gain (dB)</span>
          <input type="number" step="0.1" min="-10" max="10" value="${band.gain.toFixed(1)}" data-idx="${idx}" data-field="gain"
            class="w-16 bg-slate-900 border border-slate-700/80 rounded-md px-2 py-0.5 text-right font-mono text-xs text-cyan-300 focus:border-cyan-500 outline-none" />
        </div>
        <input type="range" step="0.1" min="-10" max="10" value="${band.gain}" data-idx="${idx}" data-field="gainSlider"
          class="w-full h-2 bg-slate-800 rounded-lg cursor-pointer" />
      </div>

      <!-- Freq & Q Row -->
      <div class="grid grid-cols-2 gap-2 pt-0.5">
        <div>
          <label class="block text-[10px] uppercase text-slate-500 mb-1">Freq (Hz)</label>
          <input type="number" step="1" min="20" max="20000" value="${band.freq}" data-idx="${idx}" data-field="freq"
            class="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:border-cyan-500 outline-none" />
        </div>
        <div>
          <label class="block text-[10px] uppercase text-slate-500 mb-1">Q-Factor</label>
          <input type="number" step="0.05" min="0.1" max="15" value="${band.q}" data-idx="${idx}" data-field="q"
            class="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:border-cyan-500 outline-none" />
        </div>
      </div>
    `;
    bandsContainer.appendChild(card);
  });
}

function updateCardInputs(idx) {
  const freqInput = bandsContainer.querySelector(`input[data-idx="${idx}"][data-field="freq"]`);
  const gainInput = bandsContainer.querySelector(`input[data-idx="${idx}"][data-field="gain"]`);
  const gainSlider = bandsContainer.querySelector(`input[data-idx="${idx}"][data-field="gainSlider"]`);
  if (freqInput) freqInput.value = bands[idx].freq;
  if (gainInput) gainInput.value = bands[idx].gain.toFixed(1);
  if (gainSlider) gainSlider.value = bands[idx].gain;
}

bandsContainer.addEventListener('input', (e) => {
  const target = e.target;
  const idx = Number(target.dataset.idx);
  const field = target.dataset.field;
  if (Number.isNaN(idx) || !field) return;

  if (field === 'enabled') {
    bands[idx].enabled = target.checked;
  } else if (field === 'gainSlider') {
    const val = parseFloat(target.value);
    bands[idx].gain = val;
    const gainInput = bandsContainer.querySelector(`input[data-idx="${idx}"][data-field="gain"]`);
    if (gainInput) gainInput.value = val.toFixed(1);
  } else {
    let val = parseFloat(target.value);
    if (!Number.isNaN(val)) {
      if (field === 'gain') {
        val = Math.max(MIN_DB, Math.min(MAX_DB, val));
        const gainSlider = bandsContainer.querySelector(`input[data-idx="${idx}"][data-field="gainSlider"]`);
        if (gainSlider) gainSlider.value = val;
      }
      bands[idx][field] = val;
    }
  }
  renderPresetDropdown('current');
  renderGraph();
  scheduleAutoWrite();
});

// ============================================================================
// 7. QUẢN LÝ PROFILE CÁ NHÂN & CHIA SẺ LINK
// ============================================================================
function renderPresetDropdown(selectedValue = 'current') {
  const userPresets = getUserPresets();
  presetSelect.innerHTML = '';

  const optCurrent = document.createElement('option');
  optCurrent.value = 'current';
  optCurrent.textContent = '● Cấu hình hiện tại';
  presetSelect.appendChild(optCurrent);

  const userKeys = Object.keys(userPresets);
  if (userKeys.length > 0) {
    const groupUser = document.createElement('optgroup');
    groupUser.label = '★ Profile của bạn đã lưu';
    userKeys.forEach((key) => {
      const opt = document.createElement('option');
      opt.value = `user:${key}`;
      opt.textContent = `★ ${userPresets[key].name}`;
      groupUser.appendChild(opt);
    });
    presetSelect.appendChild(groupUser);
  }

  const groupBuiltin = document.createElement('optgroup');
  groupBuiltin.label = 'Preset tiêu chuẩn';
  Object.entries(BUILTIN_PRESETS).forEach(([key, item]) => {
    const opt = document.createElement('option');
    opt.value = `builtin:${key}`;
    opt.textContent = item.name;
    groupBuiltin.appendChild(opt);
  });
  presetSelect.appendChild(groupBuiltin);

  presetSelect.value = selectedValue;
  btnDeleteCustomPreset.classList.toggle('hidden', !presetSelect.value.startsWith('user:'));
}

document.getElementById('btnSaveCustomPreset').addEventListener('click', () => {
  const name = prompt('Đặt tên cho Profile EQ của bạn (VD: Valorant, Nghe nhạc Ballad):');
  if (!name || !name.trim()) return;

  const cleanName = name.trim();
  const key = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
  const userPresets = getUserPresets();
  userPresets[key] = { name: cleanName, bands: JSON.parse(JSON.stringify(bands)) };
  saveUserPresets(userPresets);
  renderPresetDropdown(`user:${key}`);
  appendLog(`[PROFILE] Đã lưu "${cleanName}".`);
});

btnDeleteCustomPreset.addEventListener('click', () => {
  const val = presetSelect.value;
  if (!val.startsWith('user:')) return;
  const key = val.replace('user:', '');
  const userPresets = getUserPresets();
  delete userPresets[key];
  saveUserPresets(userPresets);
  renderPresetDropdown('current');
});

presetSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  btnDeleteCustomPreset.classList.toggle('hidden', !val.startsWith('user:'));
  if (val === 'current') return;

  if (val.startsWith('user:')) {
    const key = val.replace('user:', '');
    const userPresets = getUserPresets();
    if (userPresets[key]) bands = JSON.parse(JSON.stringify(userPresets[key].bands));
  } else if (val.startsWith('builtin:')) {
    const key = val.replace('builtin:', '');
    const presetData = BUILTIN_PRESETS[key]?.bands || [];
    bands = createEmptyBands();
    presetData.forEach((p, idx) => {
      if (idx < 8) bands[idx] = { ...bands[idx], ...p };
    });
  }

  renderBandCards();
  renderGraph();
  scheduleAutoWrite();
});

document.getElementById('btnShareProfile').addEventListener('click', async () => {
  const encoded = btoa(JSON.stringify(bands));
  const shareUrl = `${window.location.origin}${window.location.pathname}#eq=${encoded}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Đã copy link chứa cấu hình EQ! Bạn có thể gửi link này mở trên điện thoại để nạp ngay.');
  } catch {
    prompt('Copy đường link dưới đây để mở trên điện thoại:', shareUrl);
  }
});

// ============================================================================
// 8. KẾT NỐI PHẦN CỨNG & IMPORT/EXPORT
// ============================================================================
function parseAutoEQTxt(text) {
  const lines = text.split('\n');
  const parsedBands = [];
  const regex = /Filter\s+\d+:\s+(ON|OFF)\s+(?:PK|LSQ|LSC|HSQ|HSC)\s+Fc\s+([\d.]+)\s+Hz\s+Gain\s+([-\d.]+)\s+dB\s+Q\s+([\d.]+)/i;
  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      parsedBands.push({
        enabled: match[1].toUpperCase() === 'ON',
        type: 'PK',
        freq: Math.round(parseFloat(match[2])),
        gain: Math.max(MIN_DB, Math.min(MAX_DB, parseFloat(match[3]))),
        q: parseFloat(match[4]),
      });
    }
  }
  return parsedBands;
}

function exportAutoEQTxt() {
  const header = `Preamp: 0.0 dB\n`;
  const lines = bands.map((b, i) => `Filter ${i + 1}: ${b.enabled ? 'ON' : 'OFF'} PK Fc ${b.freq} Hz Gain ${b.gain.toFixed(1)} dB Q ${b.q.toFixed(2)}`);
  const blob = new Blob([header + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bunny_Gaming_PEQ_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('btnConnect').addEventListener('click', async () => {
  try {
    const info = await bunnyController.connect();
    if (info) {
      document.getElementById('deviceName').textContent = info.productName;
      document.getElementById('deviceSubInfo').textContent = `Đã kết nối phần cứng (VID: 0x${info.vendorId.toString(16)} | PID: 0x${info.productId.toString(16)})`;
      document.getElementById('statusDot').className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]';
      document.getElementById('deviceVisualWrap').classList.add('device-connected-glow', 'border-cyan-500/50');
      document.getElementById('connectBtnLabel').textContent = 'Đã kết nối';
      btnPullHardware.disabled = false;
    }
  } catch (err) {
    appendLog(`[ERROR] ${err.message}`);
    alert(err.message);
  }
});

bunnyController.onDisconnectCallback = () => {
  document.getElementById('deviceName').textContent = 'Đã ngắt kết nối';
  document.getElementById('statusDot').className = 'w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse';
  document.getElementById('deviceVisualWrap').classList.remove('device-connected-glow', 'border-cyan-500/50');
  document.getElementById('connectBtnLabel').textContent = 'Kết nối';
  btnPullHardware.disabled = true;
};

btnPullHardware.addEventListener('click', () => bunnyController.pullBandsFromDevice());

const fileImport = document.getElementById('fileImport');
document.getElementById('btnImport').addEventListener('click', () => fileImport.click());
fileImport.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const imported = parseAutoEQTxt(text);
  if (imported.length === 0) {
    alert('Không tìm thấy dữ liệu Filter hợp lệ trong file AutoEQ .txt!');
    return;
  }
  bands = createEmptyBands();
  imported.slice(0, 8).forEach((b, idx) => (bands[idx] = b));
  renderPresetDropdown('current');
  renderBandCards();
  renderGraph();
  scheduleAutoWrite();
  fileImport.value = '';
});

document.getElementById('btnExport').addEventListener('click', exportAutoEQTxt);

document.getElementById('btnReset').addEventListener('click', () => {
  bands = createEmptyBands();
  renderPresetDropdown('builtin:flat');
  renderBandCards();
  renderGraph();
  scheduleAutoWrite();
});

async function handleManualSave() {
  try {
    await bunnyController.writeAndSaveBands(isBypassed ? createEmptyBands() : bands);
    persistBandsToLocal(bands);
    appendLog('[SAVE] Đã lưu vĩnh viễn cấu hình vào chip Bunny.');
  } catch (err) {
    appendLog(`[ERROR] ${err.message}`);
    alert(err.message);
  }
}

document.getElementById('btnSyncHardware').addEventListener('click', handleManualSave);
document.getElementById('btnMobileSave').addEventListener('click', handleManualSave);
document.getElementById('btnClearLog').addEventListener('click', () => (hidLogBox.innerHTML = ''));

window.addEventListener('resize', renderGraph);
detectPlatformCompatibility();
renderPresetDropdown('current');
renderBandCards();
updateHeadroomIndicator();
renderGraph();
