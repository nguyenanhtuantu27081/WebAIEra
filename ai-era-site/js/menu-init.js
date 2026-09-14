// js/menu-init.js
// Bootstrap module to initialize 3D Hamburger Menu on all pages
import { initHamburgerMenu } from './three/hamburger-menu.js';

export function initSiteMenu() {
  const canvas = document.querySelector('#menuCanvas');
  const panel = document.querySelector('#siteMenuPanel');
  const button = document.querySelector('#menuToggle');

  if (canvas && panel && button) {
    initHamburgerMenu(canvas, panel, button);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteMenu);
} else {
  initSiteMenu();
}
