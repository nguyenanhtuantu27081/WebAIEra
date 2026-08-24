'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function Effects({ intensity = 0.95 }: { intensity?: number }) {
  return (
    <EffectComposer>
      <Bloom intensity={intensity} luminanceThreshold={0.08} luminanceSmoothing={0.8} radius={0.8} />
    </EffectComposer>
  );
}
