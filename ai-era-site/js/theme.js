// js/theme.js — Day / Night theme switcher with 3D canvas adaptation
import { scene } from './three/scene-setup.js';

const THEME_KEY = 'aiera_theme';

export function getCurrentTheme() {
  return 'dark';
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

  // Update Three.js scene lights, fog, particles, and core when switching themes
  if (scene) {
    import('./three/scene-setup.js').then(({ ambientLight, keyLight, cyanLight, renderer }) => {
      if (isLight) {
        if (scene.fog) {
          scene.fog.color.setHex(0xF6F7FB);
          scene.fog.density = 0.008;
        }
        if (ambientLight) {
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 1.35;
        }
        if (keyLight) {
          keyLight.color.setHex(0x3D4FE0); // --accent
          keyLight.intensity = 30;
        }
        if (cyanLight) {
          cyanLight.color.setHex(0x8B5CF6); // --accent2
          cyanLight.intensity = 18;
        }
        if (renderer) {
          renderer.toneMappingExposure = 1.1;
        }
      } else {
        if (scene.fog) {
          scene.fog.color.setHex(0x030305);
          scene.fog.density = 0.022;
        }
        if (ambientLight) {
          ambientLight.color.setHex(0x30304c);
          ambientLight.intensity = 0.36;
        }
        if (keyLight) {
          keyLight.color.setHex(0x8b8cff);
          keyLight.intensity = 28;
        }
        if (cyanLight) {
          cyanLight.color.setHex(0x67e8f9);
          cyanLight.intensity = 15;
        }
        if (renderer) {
          renderer.toneMappingExposure = 1.05;
        }
      }
    }).catch(() => {});

    // Particles per Section 4: accents (#3D4FE0 & #8B5CF6), opacity low (0.06 - 0.24)
    import('./three/starfield.js').then(({ starsA, starsB, gridGroup }) => {
      if (starsA && starsA.material) {
        starsA.material.color.setHex(isLight ? 0x3D4FE0 : 0xa5b4fc);
        starsA.material.opacity = isLight ? 0.18 : 0.58;
      }
      if (starsB && starsB.material) {
        starsB.material.color.setHex(isLight ? 0x8B5CF6 : 0xa5b4fc);
        starsB.material.opacity = isLight ? 0.12 : 0.28;
      }
      if (gridGroup) {
        gridGroup.visible = !isLight;
      }
    }).catch(() => {});

    // Adapt core sphere and halo per Section 3.4 & 3.5
    import('./three/core.js').then(({ core, halo, coreWire, coreRings }) => {
      if (core && core.material) {
        if (isLight) {
          core.material.color.setHex(0xEDEFFC);
          core.material.emissive.setHex(0x8B5CF6);
          core.material.emissiveIntensity = 0.35;
          core.material.metalness = 0.15;
          core.material.roughness = 0.25;
        } else {
          core.material.color.setHex(0x11121e);
          core.material.emissive.setHex(0x34398c);
          core.material.emissiveIntensity = 1.45;
          core.material.metalness = 0.7;
          core.material.roughness = 0.16;
        }
      }
      if (coreWire && coreWire.material) {
        coreWire.material.color.setHex(isLight ? 0x8B5CF6 : 0xa5b4fc);
        coreWire.material.opacity = isLight ? 0.16 : 0.19;
      }
      if (halo && halo.material) {
        halo.material.color.setHex(isLight ? 0x8B5CF6 : 0x8b8cff);
        halo.material.opacity = isLight ? 0.18 : 0.68;
      }
      if (coreRings && coreRings.length) {
        coreRings.forEach(ring => {
          if (ring.material) {
            ring.material.color.setHex(isLight ? 0x8B5CF6 : 0x818cf8);
            ring.material.opacity = isLight ? 0.18 : 0.22;
          }
        });
      }
    }).catch(() => {});

    // Adapt node energy lines in light mode
    import('./three/nodes.js').then(({ nodes }) => {
      if (nodes && nodes.length) {
        nodes.forEach(n => {
          if (n.line && n.line.material) {
            n.line.material.opacity = isLight ? 0.20 : 0.12;
          }
          if (n.pulseLine && n.pulseLine.material) {
            n.pulseLine.material.opacity = isLight ? 0.28 : 0.22;
          }
          if (n.ring && n.ring.material) {
            n.ring.material.opacity = isLight ? 0.22 : 0.44;
          }
        });
      }
    }).catch(() => {});
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
  try {
    localStorage.setItem(THEME_KEY, 'dark');
  } catch {}

  // Apply default dark theme
  setTheme('dark');

  // Wire up theme buttons if present
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-theme-val');
      if (val) setTheme(val);
      else toggleTheme();
    });
  });
}

