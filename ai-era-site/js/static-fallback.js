// js/static-fallback.js — Bản KHÔNG WebGL của trang chủ (tier STATIC hoặc khi WebGL lỗi).
// Tuyệt đối không import three, scene-setup, theme.js (theme.js kéo theo scene-setup → tạo WebGL).
import { NODES } from './data/nodes.js';
import { initI18n, getCurrentLang, onLanguageChange, nodeTranslations } from './i18n.js';

function nodeName(i, lang) {
  const tr = nodeTranslations?.[lang];
  return tr ? tr[i].name : NODES[i].name;
}
function nodeDesc(i, lang) {
  const tr = nodeTranslations?.[lang];
  return (tr && tr[i].shortDesc) || NODES[i].shortDesc;
}

export function initStaticFallback() {
  initI18n();

  const host = document.createElement('section');
  host.className = 'static-nodes';
  host.setAttribute('aria-label', 'AI Era solutions');
  const lang0 = getCurrentLang();
  NODES.forEach((d, i) => {
    const a = document.createElement('a');
    a.className = 'static-node';
    a.href = d.url;
    a.style.setProperty('--node-color', '#' + d.color.toString(16).padStart(6, '0'));
    a.innerHTML = '<strong class="static-node-name"></strong><span class="static-node-desc"></span>';
    a.querySelector('.static-node-name').textContent = nodeName(i, lang0);
    a.querySelector('.static-node-desc').textContent = nodeDesc(i, lang0);
    host.appendChild(a);
  });

  const intro = document.querySelector('.intro');
  (intro?.parentNode || document.body).insertBefore(host, intro ? intro.nextSibling : null);

  onLanguageChange((lang) => {
    host.querySelectorAll('.static-node').forEach((a, i) => {
      a.querySelector('.static-node-name').textContent = nodeName(i, lang);
      a.querySelector('.static-node-desc').textContent = nodeDesc(i, lang);
    });
  });
}
