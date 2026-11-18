/**
 * app.js
 * TANCHJIM BUNNY STUDIO PRO 2.0
 * Giữ nguyên toàn bộ tính năng cũ + Wallpaper Uploader, 5 Theme màu,
 * Phân vùng dải tần khoa học, Vẽ đa đường cong Biquad, Auto-Level & Phím tắt.
 */

import { calculateTotalResponse, calculateBiquadCoefficients, getBiquadMagnitudeDb } from './dspMath.js';
import { TanchjimBunnyController } from './deviceProtocol.js';

const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const MIN_DB = -10;
const MAX_DB = 10;

const STORAGE_LAST_STATE = 'tanchjim_bunny_last_state_v6';
const STORAGE_USER_PRESETS = 'tanchjim_bunny_user_presets_v6';
const STORAGE_APPEARANCE = 'tanchjim_bunny_appearance_v1';

const DEFAULT_FREQS = [40, 100, 250, 600, 1500, 3500, 7000, 12000];

// Bảng màu riêng cho từng Band (giúp phân biệt trực quan 8 đường cong trên đồ thị)
const BAND_COLORS = [
  '#f43f5e', // Band 1 - Rose
  '#fb923c', // Band 2 - Orange
  '#facc15', // Band 3 - Yellow
  '#4ade80', // Band 4 - Green
  '#22d3ee', // Band 5 - Cyan
  '#38bdf8', // Band 6 - Sky
  '#818cf8', // Band 7 - Indigo
  '#e879f9', // Band 8 - Fuchsia
];

// 5 Bảng màu chủ đạo (Accent Themes)
const THEMES = {
  cyan: { accent: '#22d3ee', dark: '#06b6d4', glow: 'rgba(34, 211, 238, 0.35)', soft: 'rgba(34, 211, 238, 0.14)' },
  magenta: { accent: '#f43f5e', dark: '#e11d48', glow: 'rgba(244, 63, 94, 0.35)', soft: 'rgba(244, 63, 94, 0.15)' },
  amber: { accent: '#f59e0b', dark: '#d97706', glow: 'rgba(245, 158, 11, 0.35)', soft: 'rgba(245, 158, 11, 0.15)' },
  emerald: { accent: '#10b981', dark: '#059669', glow: 'rgba(16, 185, 129, 0.35)', soft: 'rgba(16, 185, 129, 0.15)' },
  violet: { accent: '#a855f7', dark: '#9333ea', glow: 'rgba(168, 85, 247, 0.35)', soft: 'rgba(168, 85, 247, 0.15)' },
};

// ============================================================================
// KHO 24 PRESET CHUYÊN SÂU (GIỮ NGUYÊN 100%)
// ============================================================================
const BUILTIN_PRESETS = {
  flat: { category: 'Tiêu chuẩn tham chiếu', name: 'Flat (Âm thanh nguyên bản của Bunny)', bands: [] },
  harman2019: {
    category: 'Tiêu chuẩn tham chiếu',
    name: 'Harman IE 2019v2 Target (Cân bằng chuẩn mực)',
    bands: [
      { freq: 45, gain: 3.8, q: 0.75, enabled: true },
      { freq: 110, gain: 2.2, q: 0.9, enabled: true },
      { freq: 210, gain: -2.4, q: 1.3, enabled: true },
      { freq: 1500, gain: 1.2, q: 1.8, enabled: true },
      { freq: 3200, gain: 2.8, q: 2.0, enabled: true },
      { freq: 8000, gain: 1.5, q: 1.5, enabled: true },
    ],
  },
  clone_origin: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Tanchjim Origin (Flagship Vocal & Tự nhiên)',
    bands: [
      { freq: 55, gain: 1.8, q: 0.85, enabled: true },
      { freq: 190, gain: -1.4, q: 1.2, enabled: true },
      { freq: 1200, gain: 1.0, q: 1.5, enabled: true },
      { freq: 2800, gain: 2.4, q: 1.8, enabled: true },
      { freq: 5500, gain: 1.2, q: 2.2, enabled: true },
      { freq: 11500, gain: 2.0, q: 1.4, enabled: true },
    ],
  },
  clone_blessing3: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Moondrop Blessing 3 (Trong trẻo, chi tiết cao)',
    bands: [
      { freq: 40, gain: 2.5, q: 0.8, enabled: true },
      { freq: 180, gain: -2.8, q: 1.1, enabled: true },
      { freq: 1800, gain: 1.5, q: 1.6, enabled: true },
      { freq: 3100, gain: 3.2, q: 1.9, enabled: true },
      { freq: 6500, gain: 1.8, q: 2.4, enabled: true },
      { freq: 12500, gain: 2.5, q: 1.5, enabled: true },
    ],
  },
  clone_hd600: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Sennheiser HD600 (Mid ngọt, mộc mạc tự nhiên)',
    bands: [
      { freq: 45, gain: -2.5, q: 0.8, enabled: true },
      { freq: 140, gain: 1.2, q: 1.0, enabled: true },
      { freq: 1100, gain: 1.8, q: 1.3, enabled: true },
      { freq: 3300, gain: 2.2, q: 1.7, enabled: true },
      { freq: 6000, gain: -1.8, q: 2.0, enabled: true },
      { freq: 10000, gain: -1.5, q: 1.5, enabled: true },
    ],
  },
  clone_z1r: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Sony IER-Z1R (Sub-bass uy lực, Treble lấp lánh)',
    bands: [
      { freq: 38, gain: 5.8, q: 0.85, enabled: true },
      { freq: 95, gain: 2.5, q: 1.0, enabled: true },
      { freq: 320, gain: -2.5, q: 1.2, enabled: true },
      { freq: 1600, gain: -1.2, q: 1.5, enabled: true },
      { freq: 4200, gain: 1.8, q: 1.8, enabled: true },
      { freq: 9500, gain: 3.8, q: 1.6, enabled: true },
      { freq: 14000, gain: 3.0, q: 1.5, enabled: true },
    ],
  },
  clone_hexa: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Truthear Hexa (Neutral Studio Monitor)',
    bands: [
      { freq: 50, gain: 1.5, q: 0.8, enabled: true },
      { freq: 200, gain: -2.2, q: 1.2, enabled: true },
      { freq: 2500, gain: 1.8, q: 1.7, enabled: true },
      { freq: 4800, gain: 0.8, q: 2.0, enabled: true },
      { freq: 11000, gain: 1.5, q: 1.4, enabled: true },
    ],
  },
  clone_timeless: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: 7Hz Timeless Planar (Tốc độ nhanh, V-Shape mượt)',
    bands: [
      { freq: 45, gain: 4.2, q: 0.85, enabled: true },
      { freq: 240, gain: -1.8, q: 1.3, enabled: true },
      { freq: 2200, gain: 2.2, q: 1.6, enabled: true },
      { freq: 5000, gain: 2.5, q: 2.0, enabled: true },
      { freq: 10500, gain: 2.8, q: 1.5, enabled: true },
    ],
  },
  clone_airpods2: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Apple AirPods Pro 2 (Dễ nghe, ấm áp hiện đại)',
    bands: [
      { freq: 50, gain: 3.6, q: 0.8, enabled: true },
      { freq: 130, gain: 2.0, q: 1.0, enabled: true },
      { freq: 450, gain: -1.2, q: 1.3, enabled: true },
      { freq: 2400, gain: 1.6, q: 1.7, enabled: true },
      { freq: 5800, gain: -1.5, q: 2.2, enabled: true },
      { freq: 9500, gain: 1.2, q: 1.6, enabled: true },
    ],
  },
  clone_portapro: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Koss Porta Pro (Retro ấm dày, thư giãn)',
    bands: [
      { freq: 80, gain: 4.5, q: 0.8, enabled: true },
      { freq: 180, gain: 3.2, q: 1.0, enabled: true },
      { freq: 1200, gain: 1.0, q: 1.3, enabled: true },
      { freq: 3500, gain: -2.2, q: 1.6, enabled: true },
      { freq: 8500, gain: -3.5, q: 1.4, enabled: true },
    ],
  },
  clone_utopia: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Focal Utopia (Độ động cao, âm hình sắc nét)',
    bands: [
      { freq: 45, gain: 2.0, q: 0.8, enabled: true },
      { freq: 160, gain: -1.0, q: 1.2, enabled: true },
      { freq: 1400, gain: 1.6, q: 1.5, enabled: true },
      { freq: 3000, gain: 2.5, q: 1.8, enabled: true },
      { freq: 6200, gain: 2.2, q: 2.2, enabled: true },
      { freq: 12000, gain: 1.8, q: 1.5, enabled: true },
    ],
  },
  clone_er4xr: {
    category: 'Clone màu âm tai nghe nổi tiếng',
    name: 'Clone: Etymotic ER4XR (Chuẩn kiểm âm phòng thu)',
    bands: [
      { freq: 50, gain: 1.2, q: 0.8, enabled: true },
      { freq: 220, gain: -1.5, q: 1.2, enabled: true },
      { freq: 2700, gain: 3.8, q: 1.7, enabled: true },
      { freq: 5500, gain: -1.2, q: 2.0, enabled: true },
      { freq: 10000, gain: -2.0, q: 1.5, enabled: true },
    ],
  },
  music_vpop: {
    category: 'Thể loại âm nhạc',
    name: 'V-Pop & Nhạc Trẻ (Giọng ca sĩ nổi, Bass gọn)',
    bands: [
      { freq: 55, gain: 3.2, q: 0.85, enabled: true },
      { freq: 180, gain: -1.5, q: 1.2, enabled: true },
      { freq: 1100, gain: 1.4, q: 1.4, enabled: true },
      { freq: 2800, gain: 2.8, q: 1.8, enabled: true },
      { freq: 6500, gain: -1.2, q: 2.5, enabled: true },
      { freq: 11000, gain: 2.0, q: 1.5, enabled: true },
    ],
  },
  music_edm: {
    category: 'Thể loại âm nhạc',
    name: 'EDM / Vinahouse / Club (Sub-bass rung, Drop căng)',
    bands: [
      { freq: 40, gain: 6.5, q: 0.8, enabled: true },
      { freq: 95, gain: 4.0, q: 1.0, enabled: true },
      { freq: 280, gain: -2.8, q: 1.3, enabled: true },
      { freq: 1200, gain: -1.2, q: 1.4, enabled: true },
      { freq: 4500, gain: 2.8, q: 1.7, enabled: true },
      { freq: 10500, gain: 3.8, q: 1.4, enabled: true },
    ],
  },
  music_acoustic: {
    category: 'Thể loại âm nhạc',
    name: 'Acoustic / Bolero / Ballad (Tiếng guitar & giọng ấm)',
    bands: [
      { freq: 65, gain: 1.5, q: 0.8, enabled: true },
      { freq: 240, gain: 1.2, q: 1.1, enabled: true },
      { freq: 1300, gain: 2.0, q: 1.4, enabled: true },
      { freq: 3000, gain: 2.5, q: 1.8, enabled: true },
      { freq: 7500, gain: 1.5, q: 1.6, enabled: true },
    ],
  },
  music_lofi: {
    category: 'Thể loại âm nhạc',
    name: 'Lo-Fi / Chill / Study (Êm dịu, nghe lâu không mệt)',
    bands: [
      { freq: 65, gain: 3.5, q: 0.8, enabled: true },
      { freq: 220, gain: 1.8, q: 1.0, enabled: true },
      { freq: 2500, gain: -1.8, q: 1.5, enabled: true },
      { freq: 6000, gain: -3.2, q: 1.6, enabled: true },
      { freq: 11000, gain: -3.8, q: 1.4, enabled: true },
    ],
  },
  music_rock: {
    category: 'Thể loại âm nhạc',
    name: 'Rock & Metal (Trống Kick dứt khoát, Guitar điện bén)',
    bands: [
      { freq: 60, gain: 3.0, q: 0.9, enabled: true },
      { freq: 130, gain: 2.2, q: 1.2, enabled: true },
      { freq: 420, gain: -2.2, q: 1.4, enabled: true },
      { freq: 2400, gain: 2.8, q: 1.6, enabled: true },
      { freq: 5200, gain: 2.5, q: 1.9, enabled: true },
      { freq: 9500, gain: 2.0, q: 1.5, enabled: true },
    ],
  },
  music_hiphop: {
    category: 'Thể loại âm nhạc',
    name: 'Hip-Hop / Trap / R&B (808 Bass sâu, Beat nảy)',
    bands: [
      { freq: 36, gain: 6.2, q: 0.85, enabled: true },
      { freq: 85, gain: 3.5, q: 1.1, enabled: true },
      { freq: 250, gain: -2.0, q: 1.3, enabled: true },
      { freq: 1800, gain: 1.4, q: 1.5, enabled: true },
      { freq: 4800, gain: 2.2, q: 1.8, enabled: true },
      { freq: 11500, gain: 2.5, q: 1.5, enabled: true },
    ],
  },
  music_classical: {
    category: 'Thể loại âm nhạc',
    name: 'Giao hưởng / Classical (Âm trường rộng, tách lớp)',
    bands: [
      { freq: 45, gain: 1.8, q: 0.8, enabled: true },
      { freq: 190, gain: -1.5, q: 1.2, enabled: true },
      { freq: 1000, gain: 0.8, q: 1.4, enabled: true },
      { freq: 3400, gain: 2.0, q: 1.8, enabled: true },
      { freq: 8500, gain: 2.5, q: 1.5, enabled: true },
      { freq: 13500, gain: 3.0, q: 1.4, enabled: true },
    ],
  },
  music_jpop: {
    category: 'Thể loại âm nhạc',
    name: 'J-Pop / Anisong (Giọng nữ cao sáng, tiết tấu nhanh)',
    bands: [
      { freq: 55, gain: 2.8, q: 0.9, enabled: true },
      { freq: 200, gain: -2.2, q: 1.3, enabled: true },
      { freq: 1600, gain: 1.5, q: 1.6, enabled: true },
      { freq: 3200, gain: 3.0, q: 1.9, enabled: true },
      { freq: 6800, gain: -1.5, q: 2.5, enabled: true },
      { freq: 11500, gain: 2.6, q: 1.5, enabled: true },
    ],
  },
  game_fps: {
    category: 'Gaming & Giải trí',
    name: 'FPS Pro: Valorant / CS2 (Nghe rõ tiếng bước chân)',
    bands: [
      { freq: 55, gain: -4.5, q: 0.9, enabled: true },
      { freq: 160, gain: -2.5, q: 1.2, enabled: true },
      { freq: 2200, gain: 3.8, q: 1.6, enabled: true },
      { freq: 4500, gain: 4.5, q: 1.8, enabled: true },
      { freq: 8500, gain: 2.5, q: 1.5, enabled: true },
    ],
  },
  game_pubg: {
    category: 'Gaming & Giải trí',
    name: 'Battle Royale: PUBG / Warzone (Định hướng tiếng súng)',
    bands: [
      { freq: 60, gain: -3.0, q: 0.9, enabled: true },
      { freq: 190, gain: -1.8, q: 1.2, enabled: true },
      { freq: 1800, gain: 2.8, q: 1.5, enabled: true },
      { freq: 3800, gain: 3.8, q: 1.7, enabled: true },
      { freq: 7500, gain: 2.2, q: 1.5, enabled: true },
      { freq: 12000, gain: 1.8, q: 1.4, enabled: true },
    ],
  },
  game_moba: {
    category: 'Gaming & Giải trí',
    name: 'MOBA / RPG Cinematic (Hiệu ứng kỹ năng hoành tráng)',
    bands: [
      { freq: 45, gain: 4.5, q: 0.85, enabled: true },
      { freq: 140, gain: 2.0, q: 1.1, enabled: true },
      { freq: 1200, gain: 1.5, q: 1.4, enabled: true },
      { freq: 3200, gain: 2.2, q: 1.7, enabled: true },
      { freq: 9000, gain: 2.5, q: 1.5, enabled: true },
    ],
  },
  media_cinema: {
    category: 'Gaming & Giải trí',
    name: 'Cinema / Netflix Movie (Rạp chiếu phim, thoại rõ)',
    bands: [
      { freq: 38, gain: 5.5, q: 0.8, enabled: true },
      { freq: 90, gain: 3.0, q: 1.0, enabled: true },
      { freq: 300, gain: -1.8, q: 1.2, enabled: true },
      { freq: 1500, gain: 2.5, q: 1.4, enabled: true },
      { freq: 3200, gain: 2.0, q: 1.7, enabled: true },
      { freq: 10000, gain: 2.2, q: 1.5, enabled: true },
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
const chkShowAllCurves = document.getElementById('chkShowAllCurves');
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
// 1. HỆ THỐNG CUSTOM WALLPAPER & THEME STUDIO
// ============================================================================
let appearance = {
  theme: 'cyan',
  bgImage: null,
  dim: 78,
  blur: 12,
};

function applyAppearanceSettings() {
  const t = THEMES[appearance.theme] || THEMES.cyan;
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--accent-dark', t.dark);
  document.documentElement.style.setProperty('--accent-glow', t.glow);
  document.documentElement.style.setProperty('--accent-soft', t.soft);

  const bgDiv = document.getElementById('customBgImage');
  const overlayDiv = document.getElementById('customBgOverlay');

  if (appearance.bgImage) {
    bgDiv.style.backgroundImage = `url(${appearance.bgImage})`;
  } else {
    bgDiv.style.backgroundImage = `radial-gradient(circle at 15% 15%, ${t.soft}, transparent 45%), radial-gradient(circle at 85% 80%, rgba(59, 130, 246, 0.16), transparent 50%)`;
  }

  overlayDiv.style.background = `rgba(6, 8, 13, ${appearance.dim / 100})`;
  overlayDiv.style.backdropFilter = `blur(${appearance.blur}px)`;
  overlayDiv.style.webkitBackdropFilter = `blur(${appearance.blur}px)`;

  document.getElementById('bgDimSlider').value = appearance.dim;
  document.getElementById('bgBlurSlider').value = appearance.blur;

  document.querySelectorAll('.theme-swatch').forEach((btn) => {
    const isSelected = btn.dataset.theme === appearance.theme;
    btn.classList.toggle('ring-2', isSelected);
    btn.classList.toggle('ring-white', isSelected);
    btn.classList.toggle('opacity-75', !isSelected);
  });

  renderGraph();
}

function loadAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_APPEARANCE));
    if (saved) appearance = { ...appearance, ...saved };
  } catch {}
  applyAppearanceSettings();
}

function saveAppearance() {
  try {
    localStorage.setItem(STORAGE_APPEARANCE, JSON.stringify(appearance));
  } catch (e) {
    appendLog('[WARN] Ảnh nền quá lớn nên không lưu được vào bộ nhớ trình duyệt (vẫn hiển thị trong phiên này).');
  }
}

document.getElementById('btnToggleThemeDrawer').addEventListener('click', () => {
  document.getElementById('themeDrawer').classList.toggle('hidden');
});

const bgFileInput = document.getElementById('bgFileInput');
document.getElementById('btnUploadBg').addEventListener('click', () => bgFileInput.click());
bgFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    // Tự động nén ảnh nếu ảnh gốc quá nặng để lưu mượt vào localStorage
    const img = new Image();
    img.onload = () => {
      const maxDim = 1920;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      offCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
      appearance.bgImage = offCanvas.toDataURL('image/jpeg', 0.82);
      appearance.dim = 65; // Tự động giảm độ tối để khoe ảnh nền rõ hơn
      applyAppearanceSettings();
      saveAppearance();
      appendLog(`[THEME] Đã cập nhật ảnh nền mới (${w}x${h}).`);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  bgFileInput.value = '';
});

document.getElementById('btnResetBg').addEventListener('click', () => {
  appearance.bgImage = null;
  appearance.dim = 78;
  appearance.blur = 12;
  applyAppearanceSettings();
  saveAppearance();
  appendLog('[THEME] Đã khôi phục nền studio mặc định.');
});

document.getElementById('bgDimSlider').addEventListener('input', (e) => {
  appearance.dim = Number(e.target.value);
  applyAppearanceSettings();
  saveAppearance();
});

document.getElementById('bgBlurSlider').addEventListener('input', (e) => {
  appearance.blur = Number(e.target.value);
  applyAppearanceSettings();
  saveAppearance();
});

document.querySelectorAll('.theme-swatch').forEach((btn) => {
  btn.addEventListener('click', () => {
    appearance.theme = btn.dataset.theme;
    applyAppearanceSettings();
    saveAppearance();
  });
});

// ============================================================================
// 2. KHÔI PHỤC DỮ LIỆU & ĐỒNG BỘ PHẦN CỨNG
// ============================================================================
function detectPlatformCompatibility() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.getElementById('deviceSubInfo').textContent =
      'Chế độ iOS Mobile: Chỉnh đồ thị, thử âm & tạo link chia sẻ (WebHID hỗ trợ trên Chrome Mac/Android).';
  }
}

function loadBandsFromUrlHash() {
  try {
    if (window.location.hash.startsWith('#eq=')) {
      const decoded = JSON.parse(atob(window.location.hash.slice(4)));
      if (Array.isArray(decoded) && decoded.length === 8) {
        appendLog('[SHARE] Đã nạp cấu hình EQ từ đường link chia sẻ!');
        history.replaceState(null, '', window.location.pathname);
        return decoded;
      }
    }
  } catch {}
  return null;
}

function getUserPresets() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USER_PRESETS)) || {}; } catch { return {}; }
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
  } catch {}
  return createEmptyBands();
}

function persistBandsToLocal(currentBands) {
  try { localStorage.setItem(STORAGE_LAST_STATE, JSON.stringify(currentBands)); } catch {}
}

let bands = loadInitialBands();
let isBypassed = false;
let selectedBandIndex = 0;
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
// 3. HEADROOM & AUTO-LEVEL (CÂN BẰNG ĐỈNH THÔNG MINH)
// ============================================================================
function updateHeadroomIndicator() {
  const testFreqs = [30, 60, 120, 250, 500, 1000, 2500, 5000, 10000, 16000];
  const resp = calculateTotalResponse(bands, testFreqs);
  const maxPeak = Math.max(0, ...resp);

  if (maxPeak > 6.5) {
    headroomBadge.className = 'bg-amber-950/70 border border-amber-600/60 px-2.5 py-1 rounded-lg text-amber-300';
    headroomBadge.textContent = `Peak: +${maxPeak.toFixed(1)} dB`;
  } else {
    headroomBadge.className = 'bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg text-emerald-300';
    headroomBadge.textContent = `Headroom: +${maxPeak.toFixed(1)} dB`;
  }
}

document.getElementById('btnAutoLevel').addEventListener('click', () => {
  const sampleFreqs = Array.from({ length: 100 }, (_, i) =>
    Math.pow(10, Math.log10(MIN_FREQ) + (i / 99) * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ)))
  );
  const resp = calculateTotalResponse(bands, sampleFreqs);
  const maxPeak = Math.max(...resp);

  if (maxPeak <= 4.0) {
    appendLog('[DSP] Đường cong đã nằm trong ngưỡng an toàn, không cần giảm thêm.');
    return;
  }

  const offset = Math.round((maxPeak - 4.0) * 10) / 10;
  bands.forEach((b) => {
    if (b.enabled && b.gain > 0) {
      b.gain = Math.max(MIN_DB, Math.round((b.gain - offset) * 10) / 10);
    }
  });
  renderBandCards();
  renderGraph();
  scheduleAutoWrite();
  appendLog(`[DSP] Auto-Level: Đã hạ các đỉnh tăng thêm -${offset} dB để chống méo tiếng.`);
});

// ============================================================================
// 4. BỘ PHÁT TÍN HIỆU ÂM THANH & REAL-TIME FFT ANALYZER
// ============================================================================
let audioCtx = null;
let analyserNode = null;
let activeSource = null;
let activeTestType = null;
let fftAnimFrame = null;

function stopTestAudio() {
  if (activeSource) {
    try { activeSource.stop(); } catch {}
    activeSource.disconnect();
    activeSource = null;
  }
  if (fftAnimFrame) cancelAnimationFrame(fftAnimFrame);
  activeTestType = null;
  document.getElementById('toneStatus').textContent = 'Sẵn sàng';
  document.getElementById('toneStatus').className = 'text-[11px] font-mono text-slate-400';
  ['btnTestPink', 'btnTestSweep', 'btnTestBass'].forEach((id) => {
    document.getElementById(id).classList.remove('border-accent', 'text-accent', 'bg-accent-soft');
  });
  renderGraph();
}

function toggleTestAudio(type, btnId) {
  if (activeTestType === type) {
    stopTestAudio();
    return;
  }
  stopTestAudio();

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.18;
  masterGain.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

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
  document.getElementById('toneStatus').className = 'text-[11px] font-mono text-accent animate-pulse';
  document.getElementById(btnId).classList.add('border-accent', 'text-accent', 'bg-accent-soft');

  const loopVisualizer = () => {
    if (!activeTestType) return;
    renderGraph();
    fftAnimFrame = requestAnimationFrame(loopVisualizer);
  };
  loopVisualizer();
}

document.getElementById('btnTestPink').addEventListener('click', () => toggleTestAudio('pink', 'btnTestPink'));
document.getElementById('btnTestSweep').addEventListener('click', () => toggleTestAudio('sweep', 'btnTestSweep'));
document.getElementById('btnTestBass').addEventListener('click', () => toggleTestAudio('bass', 'btnTestBass'));

// ============================================================================
// 5. SO SÁNH A/B (BYPASS TOGGLE)
// ============================================================================
const btnBypassToggle = document.getElementById('btnBypassToggle');
async function toggleBypass() {
  isBypassed = !isBypassed;
  const dot = document.getElementById('bypassDot');
  const txt = document.getElementById('bypassText');

  if (isBypassed) {
    dot.className = 'w-2 h-2 rounded-full bg-slate-500';
    txt.textContent = 'EQ: OFF';
    btnBypassToggle.classList.remove('text-accent');
    btnBypassToggle.classList.add('text-slate-400');
    appendLog('[A/B] Tạm tắt EQ (Nghe chất âm nguyên bản).');
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-accent';
    txt.textContent = 'EQ: ON';
    btnBypassToggle.classList.remove('text-slate-400');
    btnBypassToggle.classList.add('text-accent');
    appendLog('[A/B] Đã bật lại cấu hình EQ.');
  }

  renderGraph();
  if (bunnyController.isConnected()) {
    const targetBands = isBypassed ? createEmptyBands() : bands;
    await bunnyController.writeAndSaveBands(targetBands);
  }
}
btnBypassToggle.addEventListener('click', toggleBypass);

// ============================================================================
// 6. VẼ ĐỒ THỊ KHOA HỌC (PHÂN VÙNG DẢI TẦN + ĐA ĐƯỜNG CONG + FFT SPECTRUM)
// ============================================================================
const PADDING = { top: 26, right: 18, bottom: 26, left: 38 };

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

  const theme = THEMES[appearance.theme] || THEMES.cyan;

  ctx.fillStyle = 'rgba(6, 8, 13, 0.92)';
  ctx.fillRect(0, 0, W, H);

  // 1. Vẽ phân vùng dải tần âm học khoa học ở dải trên cùng
  const acousticZones = [
    { start: 20, end: 60, label: 'SUB-BASS' },
    { start: 60, end: 250, label: 'BASS' },
    { start: 250, end: 500, label: 'LOW-MID' },
    { start: 500, end: 2000, label: 'MIDRANGE' },
    { start: 2000, end: 6000, label: 'PRESENCE' },
    { start: 6000, end: 20000, label: 'BRILLIANCE' },
  ];

  ctx.font = '600 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  acousticZones.forEach((z, idx) => {
    const x1 = freqToX(z.start, W);
    const x2 = freqToX(z.end, W);
    if (idx % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(x1, PADDING.top, x2 - x1, H - PADDING.top - PADDING.bottom);
    }
    if (W > 420 || idx % 2 === 0) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.fillText(z.label, (x1 + x2) / 2, 15);
    }
  });

  // 2. Vẽ sóng phổ FFT thời gian thực (nếu đang bật âm thanh thử nghiệm)
  if (activeTestType && analyserNode) {
    const freqData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(freqData);
    const nyquist = audioCtx.sampleRate / 2;

    ctx.beginPath();
    ctx.moveTo(PADDING.left, H - PADDING.bottom);
    for (let i = 1; i < freqData.length; i++) {
      const f = (i / freqData.length) * nyquist;
      if (f < MIN_FREQ || f > MAX_FREQ) continue;
      const x = freqToX(f, W);
      const ampRatio = freqData[i] / 255;
      const y = H - PADDING.bottom - ampRatio * (H - PADDING.top - PADDING.bottom) * 0.75;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W - PADDING.right, H - PADDING.bottom);
    ctx.closePath();
    ctx.fillStyle = theme.soft;
    ctx.fill();
  }

  // 3. Lưới tần số & dB
  const gridFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  ctx.lineWidth = 1;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';

  gridFreqs.forEach((f) => {
    const x = freqToX(f, W);
    ctx.strokeStyle = [100, 1000, 10000].includes(f) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)';
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
    ctx.strokeStyle = db === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = db === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, y);
    ctx.lineTo(W - PADDING.right, y);
    ctx.stroke();

    ctx.fillStyle = db === 0 ? '#cbd5e1' : '#64748b';
    ctx.fillText(`${db > 0 ? '+' : ''}${db}`, PADDING.left - 6, y + 3);
  });

  const numSamples = 360;
  const sampleFreqs = [];
  for (let i = 0; i <= numSamples; i++) {
    const ratio = i / numSamples;
    sampleFreqs.push(Math.pow(10, Math.log10(MIN_FREQ) + ratio * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ))));
  }

  // 4. Vẽ đường cong riêng của từng Band (nếu bật chkShowAllCurves)
  if (!isBypassed && chkShowAllCurves && chkShowAllCurves.checked) {
    bands.forEach((b, bIdx) => {
      if (!b.enabled || Math.abs(b.gain) < 0.05) return;
      const singleCoeff = calculateBiquadCoefficients(b.freq, b.gain, b.q);
      const isFocused = bIdx === selectedBandIndex || bIdx === draggingBandIndex;

      ctx.beginPath();
      sampleFreqs.forEach((f, idx) => {
        const db = Math.max(MIN_DB, Math.min(MAX_DB, getBiquadMagnitudeDb(singleCoeff, f)));
        const x = freqToX(f, W);
        const y = dbToY(db, H);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = BAND_COLORS[bIdx % BAND_COLORS.length];
      ctx.globalAlpha = isFocused ? 0.75 : 0.25;
      ctx.lineWidth = isFocused ? 1.8 : 1;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  }

  // 5. Đường đáp tuyến tổng hợp chính
  const activeBands = isBypassed ? createEmptyBands() : bands;
  const responseDbs = calculateTotalResponse(activeBands, sampleFreqs);

  const gradient = ctx.createLinearGradient(0, PADDING.top, 0, H - PADDING.bottom);
  gradient.addColorStop(0, isBypassed ? 'rgba(148, 163, 184, 0.1)' : theme.glow);
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, isBypassed ? 'rgba(148, 163, 184, 0.1)' : theme.glow);

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
  ctx.strokeStyle = isBypassed ? '#64748b' : theme.accent;
  ctx.lineWidth = 2.8;
  ctx.shadowColor = isBypassed ? 'transparent' : theme.glow;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 6. Vẽ 8 điểm điều khiển (Nodes) đa sắc
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const nodeRadius = isTouch ? 8.5 : 6.5;

  bands.forEach((band, index) => {
    const x = freqToX(band.freq, W);
    const y = dbToY(isBypassed ? 0 : band.gain, H);
    const isSelected = index === draggingBandIndex || index === hoveredBandIndex || index === selectedBandIndex;
    const nodeColor = BAND_COLORS[index % BAND_COLORS.length];

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, isSelected ? nodeRadius + 1.5 : nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = isBypassed ? '#475569' : band.enabled ? (isSelected ? '#ffffff' : nodeColor) : '#334155';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06080d';
    ctx.stroke();

    ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${index + 1}`, x, y - (nodeRadius + 5));
  });

  ctx.restore();
}

chkShowAllCurves.addEventListener('change', renderGraph);

canvas.addEventListener('pointerdown', (e) => {
  if (isBypassed) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let closestIdx = -1;
  let minDist = 24;
  bands.forEach((band, idx) => {
    const dist = Math.hypot(mx - freqToX(band.freq, rect.width), my - dbToY(band.gain, rect.height));
    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });

  if (closestIdx !== -1) {
    draggingBandIndex = closestIdx;
    selectedBandIndex = closestIdx;
    canvas.setPointerCapture(e.pointerId);
    renderBandCards();
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
    renderBandCards();
    renderGraph();
    scheduleAutoWrite();
  }
});

// ============================================================================
// 7. RENDER 8 BAND CARDS (NÚT STEP -/+ & QUICK Q TRỰC QUAN)
// ============================================================================
function formatSignedDb(val) {
  const num = Number(val) || 0;
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}`;
}

function renderBandCards() {
  bandsContainer.innerHTML = '';
  bands.forEach((band, idx) => {
    const isFocused = idx === selectedBandIndex || idx === draggingBandIndex;
    const nodeColor = BAND_COLORS[idx % BAND_COLORS.length];
    const card = document.createElement('div');
    card.dataset.cardIdx = idx;
    card.className = `glass-panel ${
      isFocused ? 'border-accent ring-1 ring-white/20' : ''
    } rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-lg`;

    const freqSliderVal = Math.round(
      ((Math.log10(band.freq) - Math.log10(MIN_FREQ)) / (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ))) * 1000
    );

    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center text-slate-950"
                style="background-color: ${band.enabled ? nodeColor : '#475569'}">
            ${idx + 1}
          </span>
          <span class="text-xs font-semibold text-white">Band ${idx + 1}</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" data-action="zero-band" data-idx="${idx}" 
            class="text-[10px] font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 transition cursor-pointer">
            0 dB
          </button>
          <input type="checkbox" data-idx="${idx}" data-field="enabled" ${band.enabled ? 'checked' : ''} 
            class="w-4 h-4 rounded cursor-pointer" />
        </div>
      </div>

      <!-- GAIN -->
      <div class="glass-subpanel p-2.5 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-medium text-slate-400">Gain (dB)</span>
          <div class="flex items-center bg-black/40 rounded-lg border border-white/10 overflow-hidden">
            <button type="button" data-step="gain" data-dir="-1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">−</button>
            <input type="text" inputmode="decimal" value="${formatSignedDb(band.gain)}" data-idx="${idx}" data-field="gainText"
              class="w-14 bg-transparent text-center font-mono text-xs font-bold text-accent focus:bg-white/10 outline-none" />
            <button type="button" data-step="gain" data-dir="1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">+</button>
          </div>
        </div>
        <input type="range" step="0.1" min="-10" max="10" value="${band.gain}" data-idx="${idx}" data-field="gainSlider"
          class="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer" />
      </div>

      <!-- FREQUENCY -->
      <div class="glass-subpanel p-2.5 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-medium text-slate-400">Freq (Hz)</span>
          <div class="flex items-center bg-black/40 rounded-lg border border-white/10 overflow-hidden">
            <button type="button" data-step="freq" data-dir="-1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">−</button>
            <input type="text" inputmode="numeric" value="${band.freq}" data-idx="${idx}" data-field="freqText"
              class="w-16 bg-transparent text-center font-mono text-xs font-semibold text-white focus:bg-white/10 outline-none" />
            <button type="button" data-step="freq" data-dir="1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">+</button>
          </div>
        </div>
        <input type="range" step="1" min="0" max="1000" value="${freqSliderVal}" data-idx="${idx}" data-field="freqSlider"
          class="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer" />
      </div>

      <!-- Q-FACTOR -->
      <div class="glass-subpanel p-2.5 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-medium text-slate-400">Q-Factor</span>
          <div class="flex items-center bg-black/40 rounded-lg border border-white/10 overflow-hidden">
            <button type="button" data-step="q" data-dir="-1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">−</button>
            <input type="text" inputmode="decimal" value="${band.q.toFixed(2)}" data-idx="${idx}" data-field="qText"
              class="w-14 bg-transparent text-center font-mono text-xs font-semibold text-white focus:bg-white/10 outline-none" />
            <button type="button" data-step="q" data-dir="1" data-idx="${idx}"
              class="w-7 h-7 flex items-center justify-center text-slate-200 hover:bg-white/10 font-bold text-sm transition cursor-pointer select-none">+</button>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-1">
          ${[
            { label: '0.7 Rộng', val: 0.71 },
            { label: '1.4 Vừa', val: 1.41 },
            { label: '3.0 Hẹp', val: 3.0 },
            { label: '6.0 Nhọn', val: 6.0 },
          ]
            .map(
              (preset) => `
            <button type="button" data-quick-q="${preset.val}" data-idx="${idx}"
              class="text-[10px] font-mono py-1 rounded-md border ${
                Math.abs(band.q - preset.val) < 0.08
                  ? 'bg-accent-soft border-accent text-accent font-semibold'
                  : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
              } transition cursor-pointer">
              ${preset.label}
            </button>`
            )
            .join('')}
        </div>
      </div>
    `;
    bandsContainer.appendChild(card);
  });
}

function updateCardInputs(idx) {
  const card = bandsContainer.querySelector(`[data-card-idx="${idx}"]`);
  if (!card) return;

  const gainText = card.querySelector(`input[data-field="gainText"]`);
  const gainSlider = card.querySelector(`input[data-field="gainSlider"]`);
  const freqText = card.querySelector(`input[data-field="freqText"]`);
  const freqSlider = card.querySelector(`input[data-field="freqSlider"]`);
  const qText = card.querySelector(`input[data-field="qText"]`);

  if (gainText && document.activeElement !== gainText) gainText.value = formatSignedDb(bands[idx].gain);
  if (gainSlider) gainSlider.value = bands[idx].gain;
  if (freqText && document.activeElement !== freqText) freqText.value = bands[idx].freq;
  if (freqSlider) {
    freqSlider.value = Math.round(
      ((Math.log10(bands[idx].freq) - Math.log10(MIN_FREQ)) / (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ))) * 1000
    );
  }
  if (qText && document.activeElement !== qText) qText.value = bands[idx].q.toFixed(2);
}

bandsContainer.addEventListener('input', (e) => {
  const target = e.target;
  const idx = Number(target.dataset.idx);
  const field = target.dataset.field;
  if (Number.isNaN(idx) || !field) return;

  selectedBandIndex = idx;

  if (field === 'enabled') {
    bands[idx].enabled = target.checked;
    renderBandCards();
  } else if (field === 'gainSlider') {
    bands[idx].gain = parseFloat(target.value);
    bands[idx].enabled = true;
    updateCardInputs(idx);
  } else if (field === 'freqSlider') {
    const ratio = parseFloat(target.value) / 1000;
    bands[idx].freq = Math.round(Math.pow(10, Math.log10(MIN_FREQ) + ratio * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ))));
    updateCardInputs(idx);
  } else {
    return;
  }

  renderPresetDropdown('current');
  renderGraph();
  scheduleAutoWrite();
});

function commitTextInput(target) {
  const idx = Number(target.dataset.idx);
  const field = target.dataset.field;
  if (Number.isNaN(idx) || !field) return;

  const rawVal = parseFloat(target.value.replace(',', '.'));

  if (field === 'gainText') {
    if (!Number.isNaN(rawVal)) {
      bands[idx].gain = Math.max(MIN_DB, Math.min(MAX_DB, Math.round(rawVal * 10) / 10));
      bands[idx].enabled = true;
    }
    target.value = formatSignedDb(bands[idx].gain);
  } else if (field === 'freqText') {
    if (!Number.isNaN(rawVal)) {
      bands[idx].freq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, Math.round(rawVal)));
    }
    target.value = bands[idx].freq;
  } else if (field === 'qText') {
    if (!Number.isNaN(rawVal)) {
      bands[idx].q = Math.max(0.1, Math.min(15, Math.round(rawVal * 100) / 100));
    }
    target.value = bands[idx].q.toFixed(2);
  }

  updateCardInputs(idx);
  renderPresetDropdown('current');
  renderGraph();
  scheduleAutoWrite();
}

bandsContainer.addEventListener('change', (e) => {
  if (['gainText', 'freqText', 'qText'].includes(e.target.dataset.field)) commitTextInput(e.target);
});

bandsContainer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && ['gainText', 'freqText', 'qText'].includes(e.target.dataset.field)) e.target.blur();
});

bandsContainer.addEventListener('focusin', (e) => {
  if (['gainText', 'freqText', 'qText'].includes(e.target.dataset.field)) {
    selectedBandIndex = Number(e.target.dataset.idx);
    e.target.select();
  }
});

let holdTimer = null;
let holdInterval = null;

function applyButtonAction(btn) {
  const idx = Number(btn.dataset.idx);
  if (Number.isNaN(idx)) return;
  selectedBandIndex = idx;

  if (btn.dataset.action === 'zero-band') {
    bands[idx].gain = 0.0;
  } else if (btn.dataset.quickQ) {
    bands[idx].q = parseFloat(btn.dataset.quickQ);
    renderBandCards();
  } else if (btn.dataset.step) {
    const dir = Number(btn.dataset.dir);
    const type = btn.dataset.step;

    if (type === 'gain') {
      bands[idx].gain = Math.max(MIN_DB, Math.min(MAX_DB, Math.round((bands[idx].gain + dir * 0.1) * 10) / 10));
      bands[idx].enabled = true;
    } else if (type === 'freq') {
      const f = bands[idx].freq;
      const step = f < 200 ? 5 : f < 1000 ? 20 : f < 5000 ? 100 : 250;
      bands[idx].freq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, f + dir * step));
    } else if (type === 'q') {
      bands[idx].q = Math.max(0.1, Math.min(15, Math.round((bands[idx].q + dir * 0.1) * 100) / 100));
    }
  }

  updateCardInputs(idx);
  renderPresetDropdown('current');
  renderGraph();
  scheduleAutoWrite();
}

bandsContainer.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  applyButtonAction(btn);

  if (btn.dataset.step) {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => applyButtonAction(btn), 65);
    }, 350);
  }
});

['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
  bandsContainer.addEventListener(evt, () => {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
  });
});

// Phím tắt bàn phím chuyên nghiệp (Arrow keys, 1-8, Space)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleBypass();
    return;
  }

  if (e.key >= '1' && e.key <= '8') {
    selectedBandIndex = Number(e.key) - 1;
    renderBandCards();
    renderGraph();
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    const b = bands[selectedBandIndex];
    if (e.key === 'ArrowUp') b.gain = Math.min(MAX_DB, Math.round((b.gain + 0.1) * 10) / 10);
    if (e.key === 'ArrowDown') b.gain = Math.max(MIN_DB, Math.round((b.gain - 0.1) * 10) / 10);
    if (e.key === 'ArrowRight') b.freq = Math.min(MAX_FREQ, b.freq + (b.freq < 500 ? 10 : 50));
    if (e.key === 'ArrowLeft') b.freq = Math.max(MIN_FREQ, b.freq - (b.freq < 500 ? 10 : 50));
    b.enabled = true;
    updateCardInputs(selectedBandIndex);
    renderGraph();
    scheduleAutoWrite();
  }
});

// ============================================================================
// 8. QUẢN LÝ PRESET & PROFILE CÁ NHÂN + WEBHID
// ============================================================================
function renderPresetDropdown(selectedValue = 'current') {
  const userPresets = getUserPresets();
  presetSelect.innerHTML = '';

  const optCurrent = document.createElement('option');
  optCurrent.value = 'current';
  optCurrent.textContent = '● Cấu hình đang chỉnh sửa';
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

  const categories = {};
  Object.entries(BUILTIN_PRESETS).forEach(([key, item]) => {
    const cat = item.category || 'Khác';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ key, name: item.name });
  });

  Object.entries(categories).forEach(([catName, items]) => {
    const group = document.createElement('optgroup');
    group.label = `── ${catName} ──`;
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = `builtin:${item.key}`;
      opt.textContent = item.name;
      group.appendChild(opt);
    });
    presetSelect.appendChild(group);
  });

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
    if (userPresets[key]) {
      bands = JSON.parse(JSON.stringify(userPresets[key].bands));
      appendLog(`[PRESET] Nạp profile cá nhân: "${userPresets[key].name}"`);
    }
  } else if (val.startsWith('builtin:')) {
    const key = val.replace('builtin:', '');
    const presetObj = BUILTIN_PRESETS[key];
    const presetData = presetObj?.bands || [];
    bands = createEmptyBands();
    presetData.forEach((p, idx) => {
      if (idx < 8) bands[idx] = { ...bands[idx], ...p };
    });
    appendLog(`[PRESET] Đã áp dụng mẫu: "${presetObj?.name}"`);
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
    alert('Đã copy link chứa cấu hình EQ! Bạn có thể gửi link này mở trên thiết bị khác.');
  } catch {
    prompt('Copy đường link dưới đây:', shareUrl);
  }
});

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
      document.getElementById('deviceVisualWrap').classList.add('device-connected-glow', 'border-accent');
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
  document.getElementById('deviceVisualWrap').classList.remove('device-connected-glow', 'border-accent');
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
loadAppearance();
detectPlatformCompatibility();
renderPresetDropdown('current');
renderBandCards();
updateHeadroomIndicator();
renderGraph();
