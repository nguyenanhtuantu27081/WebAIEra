'use client';

import { useEffect, useState } from 'react';
import { isWebGLAvailable } from './webgl-support';

/**
 * Scene capability levels for Progressive Enhancement (F.10):
 * - 'checking': Initial state while detecting device capability
 * - 'static': Fallback to static poster/gradient (no WebGL, weak GPU, reduced-motion, saveData)
 * - 'mobile-lite': Lightweight 3D (120 particles, no Bloom, low LOD)
 * - 'full': Full 3D experience (desktop preset medium/high)
 */
export type SceneCapability = 'checking' | 'static' | 'mobile-lite' | 'full';

export function useSceneCapability(): SceneCapability {
  const [capability, setCapability] = useState<SceneCapability>('checking');

  useEffect(() => {
    let cancelled = false;

    function detect() {
      // 1) Respect user preferences — always fallback to static
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = (navigator as any).connection?.saveData;
      if (reduceMotion || saveData) {
        if (!cancelled) setCapability('static');
        return;
      }

      // 2) No WebGL → Tier 0, static fallback immediately
      if (!isWebGLAvailable()) {
        if (!cancelled) setCapability('static');
        return;
      }

      // 3) Detect mobile via UA + viewport + pointer
      const isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        !window.matchMedia('(pointer: fine)').matches;

      if (isMobile) {
        // Mobile devices get lightweight 3D (no Bloom, fewer particles)
        // Very weak mobile (low core count + small screen) gets static
        const cores = navigator.hardwareConcurrency ?? 2;
        const isVeryWeak = cores <= 2 && window.innerWidth < 480;
        if (!cancelled) setCapability(isVeryWeak ? 'static' : 'mobile-lite');
        return;
      }

      // 4) Desktop/laptop → full 3D
      if (!cancelled) setCapability('full');
    }

    // Small delay to not block initial paint
    const id = ('requestIdleCallback' in window)
      ? (window as any).requestIdleCallback(() => detect(), { timeout: 500 })
      : setTimeout(() => detect(), 50);

    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(id);
      } else {
        clearTimeout(id as any);
      }
    };
  }, []);

  return capability;
}
