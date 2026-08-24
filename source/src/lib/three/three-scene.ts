export const radialTexture = (inner = 'rgba(255,255,255,1)', mid = 'rgba(129,140,248,.35)') => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.16, mid);
  gradient.addColorStop(0.48, 'rgba(99,102,241,.08)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
};

export const glowTexture = () => radialTexture();

export const starLayer = (count: number, spread: number, size: number, opacity: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.65;
    positions[i * 3 + 2] = Math.random() * -58 + 18;
  }
  return { positions, size, opacity };
};
