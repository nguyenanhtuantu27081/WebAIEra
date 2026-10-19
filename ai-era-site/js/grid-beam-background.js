/* AI Era — UX-226 shared grid-beam animation. */
(() => {
  const root = document.querySelector('.grid-beam-background');
  if (!root) return;

  const canvas = root.querySelector('.grid-beam-background__canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const COLORS = ['129,140,248', '45,212,191', '244,114,182'];
  const GRID = 34;
  const MAX_BEAMS = 9;
  const DPR_MAX = 2;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let beams = [];
  let spawnAccumulator = 0;
  let rafId = 0;
  let lastFrame = 0;
  let pageVisible = !document.hidden;
  let pointerX = -200;
  let pointerY = -200;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function spawnBeam(initial = false, index = 0) {
    const vertical = Math.random() < 0.5;
    const extent = vertical ? height : width;
    const crossExtent = vertical ? width : height;
    const lineCount = Math.max(1, Math.floor(crossExtent / GRID) - 1);
    const line = (1 + Math.floor(Math.random() * lineCount)) * GRID - 1;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const start = direction > 0 ? -60 : extent + 60;
    const position = initial ? extent * (0.2 + index * 0.18) : start;

    beams.push({
      vertical,
      line,
      position,
      direction,
      speed: 110 + Math.random() * 90,
      length: 50 + Math.random() * 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const beam of beams) {
      const x0 = beam.vertical ? beam.line : beam.position - beam.direction * beam.length;
      const y0 = beam.vertical ? beam.position - beam.direction * beam.length : beam.line;
      const x1 = beam.vertical ? beam.line : beam.position;
      const y1 = beam.vertical ? beam.position : beam.line;
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(${beam.color},0)`);
      gradient.addColorStop(1, `rgba(${beam.color},.95)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5, y0 + 0.5);
      ctx.lineTo(x1 + 0.5, y1 + 0.5);
      ctx.stroke();

      /* Glowing beam head from UX-226. */
      ctx.fillStyle = `rgba(${beam.color},1)`;
      ctx.shadowColor = `rgba(${beam.color},1)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x1 + 0.5, y1 + 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function tick(now) {
    rafId = 0;
    if (!pageVisible || document.hidden || reduceMotion.matches) return;

    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    spawnAccumulator += dt;

    if (spawnAccumulator > 0.42 && beams.length < MAX_BEAMS) {
      spawnAccumulator = 0;
      spawnBeam();
    }

    for (const beam of beams) beam.position += beam.direction * beam.speed * dt;
    beams = beams.filter((beam) => {
      const limit = (beam.vertical ? height : width) + 70;
      return beam.direction > 0 ? beam.position < limit : beam.position > -70;
    });

    draw();
    rafId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (rafId || !pageVisible || document.hidden || reduceMotion.matches) return;
    lastFrame = performance.now();
    rafId = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onPointerMove(event) {
    if (coarsePointer) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    root.style.setProperty('--ux226-mx', `${pointerX}px`);
    root.style.setProperty('--ux226-my', `${pointerY}px`);
  }

  function onPointerLeave() {
    pointerX = -200;
    pointerY = -200;
    root.style.setProperty('--ux226-mx', '-200px');
    root.style.setProperty('--ux226-my', '-200px');
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden;
    if (pageVisible) start();
    else stop();
  }

  function onMotionPreferenceChange() {
    if (reduceMotion.matches) {
      stop();
      beams = [];
      draw();
    } else {
      /* Start with four beams again when motion is allowed. */
      for (let i = 0; i < 4; i++) spawnBeam(true, i);
      draw();
      start();
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  reduceMotion.addEventListener?.('change', onMotionPreferenceChange);

  resizeCanvas();
  if (!reduceMotion.matches) {
    for (let i = 0; i < 4; i++) spawnBeam(true, i);
    draw();
    start();
  }
})();