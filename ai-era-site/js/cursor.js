// js/cursor.js — Custom cursor (dot + outline)
// Copied from template, modularized. No new effects added per step 11.

let cx = innerWidth / 2, cy = innerHeight / 2;

export function initCursor(getPointer) {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (!dot || !outline) return; // graceful skip on mobile/touch

  addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });

  function cursorLoop() {
    const pointer = getPointer();
    cx += (pointer.px - cx) * .17;
    cy += (pointer.py - cy) * .17;
    outline.style.left = cx + 'px';
    outline.style.top = cy + 'px';
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
}
