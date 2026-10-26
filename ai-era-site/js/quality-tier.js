// Crash loop guard & SAFE tier detection
const BOOT_KEY = 'aiera_boot_ts';
const CRASH_COUNT_KEY = 'aiera_crash_count';
const SAFE_MODE_KEY = 'aiera_safe_mode';

function checkCrashLoop() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('safe') === '1') return true;

    // Check if previous boot crashed within 10s without normal cleanup
    const lastBoot = sessionStorage.getItem(BOOT_KEY);
    const crashCount = parseInt(localStorage.getItem(CRASH_COUNT_KEY) || '0', 10);
    const safeMode = localStorage.getItem(SAFE_MODE_KEY) === '1';

    if (safeMode || crashCount >= 2) return true;

    if (lastBoot) {
      const elapsed = Date.now() - parseInt(lastBoot, 10);
      if (elapsed < 12000) {
        // Unclean exit during boot/initial render
        const newCount = crashCount + 1;
        localStorage.setItem(CRASH_COUNT_KEY, String(newCount));
        if (newCount >= 2) {
          localStorage.setItem(SAFE_MODE_KEY, '1');
          return true;
        }
      }
    }
    sessionStorage.setItem(BOOT_KEY, String(Date.now()));
  } catch (_) {}
  return false;
}

export function reportContextLost() {
  try {
    localStorage.setItem(SAFE_MODE_KEY, '1');
    const count = parseInt(localStorage.getItem(CRASH_COUNT_KEY) || '0', 10);
    localStorage.setItem(CRASH_COUNT_KEY, String(count + 1));
  } catch (_) {}
}

export function clearCrashMarkers() {
  try {
    sessionStorage.removeItem(BOOT_KEY);
    localStorage.removeItem(SAFE_MODE_KEY);
    localStorage.removeItem(CRASH_COUNT_KEY);
  } catch (_) {}
}

// Clear boot marker on clean pagehide or after 15s stable run
window.addEventListener('pagehide', () => {
  try { sessionStorage.removeItem(BOOT_KEY); } catch (_) {}
});
setTimeout(() => {
  try {
    sessionStorage.removeItem(BOOT_KEY);
    // If ran cleanly for 15s, reset crash count
    localStorage.removeItem(CRASH_COUNT_KEY);
    localStorage.removeItem(SAFE_MODE_KEY);
  } catch (_) {}
}, 15000);

export function getQualityTier() {
  // 1. Crash loop or explicit ?safe=1 query
  if (checkCrashLoop()) return 'SAFE';

  // 2. Explicit ?lite=1 query
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('lite') === '1') return 'LOW';
  } catch (_) {}

  // 3. Respect user preferences — always LOW for reduced motion or data saver
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const saveData = navigator.connection?.saveData;
  const isMobile =
    window.innerWidth < 768 ||
    window.matchMedia?.('(pointer: coarse)')?.matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (reduceMotion || saveData || isMobile) return 'LOW';

  // Desktop/laptop: use viewport as rough proxy
  const w = window.innerWidth;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  SAFE:   { particles: 30,   dpr: 0.75, bloom: 0,    lights: 1, antialias: false, powerPreference: 'low-power', chrome3d: false, footer3d: false, postProcessing: false, maxFps: 30 },
  LOW:    { particles: 60,   dpr: 0.75, bloom: 0,    lights: 1, antialias: false, powerPreference: 'low-power', chrome3d: false, footer3d: false, postProcessing: false, maxFps: 60 },
  MEDIUM: { particles: 250,  dpr: 1.0,  bloom: 0.2,  lights: 2, antialias: false, powerPreference: 'default',   chrome3d: true,  footer3d: true,  postProcessing: true,  maxFps: 60 },
  HIGH:   { particles: 600,  dpr: 1.25, bloom: 0.45, lights: 2, antialias: true,  powerPreference: 'default',   chrome3d: true,  footer3d: true,  postProcessing: true,  maxFps: 0 },
  ULTRA:  { particles: 1000, dpr: 1.5,  bloom: 0.65, lights: 3, antialias: true,  powerPreference: 'default',   chrome3d: true,  footer3d: true,  postProcessing: true,  maxFps: 0 }
};
