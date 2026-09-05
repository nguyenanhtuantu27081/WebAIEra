/**
 * Check if WebGL is available in the current browser.
 * Runs before any Three.js/R3F code to avoid crashes on unsupported devices.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(gl && (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext));
  } catch {
    return false;
  }
}
