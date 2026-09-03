// js/theme.js — Day / Night theme switcher with 3D canvas adaptation
import { scene } from './three/scene-setup.js';

const THEME_KEY = 'aiera_theme';

export function getCurrentTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

const listeners = [];
export function onThemeChange(fn) {
  listeners.push(fn);
}

export function setTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');

  // Update theme toggle buttons state
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
  });

  // Update Three.js scene fog if scene exists
  if (scene && scene.fog) {
    if (isLight) {
      scene.fog.color.setHex(0xe2e8f0);
      scene.fog.density = 0.016;
    } else {
      scene.fog.color.setHex(0x030305);
      scene.fog.density = 0.022;
    }
  }

  // Persist preference
  try {
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  } catch {}

  // Notify callbacks
  listeners.forEach(fn => {
    try { fn(theme); } catch (e) { console.error(e); }
  });
}

export function toggleTheme() {
  const current = getCurrentTheme();
  setTheme(current === 'light' ? 'dark' : 'light');
}

export function initTheme() {
  const current = getCurrentTheme();

  // Wire up theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-theme-val');
      if (val) setTheme(val);
      else toggleTheme();
    });
  });

  // Apply initial theme
  setTheme(current);
}
