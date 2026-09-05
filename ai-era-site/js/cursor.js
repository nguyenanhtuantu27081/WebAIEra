// js/cursor.js — Custom cursor (dot + outline)
// Optimized for GPU compositing: uses transform translate3d instead of top/left (Checklist E.1)

let cx = innerWidth / 2, cy = innerHeight / 2;

export function initCursor(getPointer) {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (!dot || !outline) return; // graceful skip on mobile/touch

  // Use translate3d to avoid triggering layout/reflow on mousemove
  addEventListener('mousemove', e => {
    dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  function cursorLoop() {
    const pointer = getPointer();
    cx += (pointer.px - cx) * .17;
    cy += (pointer.py - cy) * .17;
    outline.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
}
