'use client';

import dynamic from 'next/dynamic';
import { useSceneCapability } from '@/lib/three/use-scene-capability';

const AiEraScene = dynamic(() => import('./AiEraScene'), { ssr: false });

/**
 * Progressive Enhancement wrapper (F.10 step 3):
 * - 'checking' / 'static': Shows CSS gradient poster (lightweight, no JS)
 * - 'mobile-lite': Mounts AiEraScene with forced 'mobile-medium' tier
 * - 'full': Mounts AiEraScene with auto-detected tier (medium/high)
 */
export default function HeroSceneSwitcher() {
  const capability = useSceneCapability();

  // During detection or for static fallback: lightweight CSS gradient
  if (capability === 'checking' || capability === 'static') {
    return (
      <div
        className="fixed inset-0 z-0 bg-[#030305]"
        aria-hidden
      >
        {/* Radial gradient mimics the 3D scene's ambient glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 42%, rgba(99,102,241,0.15), transparent 60%),
              radial-gradient(ellipse at 30% 60%, rgba(103,232,249,0.08), transparent 50%),
              radial-gradient(ellipse at 70% 35%, rgba(192,132,252,0.06), transparent 50%)
            `,
          }}
        />
      </div>
    );
  }

  // 'mobile-lite' or 'full' → mount Canvas with appropriate tier
  return <AiEraScene forcedTier={capability === 'mobile-lite' ? 'mobile-medium' : undefined} />;
}
