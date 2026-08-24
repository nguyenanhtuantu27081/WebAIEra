'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUALITY_PRESETS, type QualityTier } from '@/lib/three/quality-tiers';

export default function ParticleField({ tier = 'medium' }: { tier?: QualityTier }) {
  const starsARef = useRef<THREE.Points>(null);
  const starsBRef = useRef<THREE.Points>(null);

  const preset = QUALITY_PRESETS[tier];

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (starsARef.current) {
      starsARef.current.rotation.y = t * 0.004;
      starsARef.current.position.z = (t * 0.17) % 7;
    }
    if (starsBRef.current) {
      starsBRef.current.rotation.y = -t * 0.003;
      starsBRef.current.position.z = (t * 0.28) % 9;
    }
  });

  const starsA = useMemo(() => {
    const count = preset.particles;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 42;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 27.3;
      positions[i * 3 + 2] = Math.random() * -58 + 18;
    }
    return positions;
  }, [preset.particles]);

  const starsB = useMemo(() => {
    const count = Math.floor(preset.particles * 0.35);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35.75;
      positions[i * 3 + 2] = Math.random() * -58 + 18;
    }
    return positions;
  }, [preset.particles]);

  return (
    <group>
      <points ref={starsARef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starsA.length / 3} array={starsA} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={0xa5b4fc} size={0.025} transparent opacity={0.58} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={starsBRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starsB.length / 3} array={starsB} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={0xa5b4fc} size={0.055} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <group>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -36 + i * 4]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[8.5, 8.53, 96]} />
            <meshBasicMaterial color={0x818cf8} transparent opacity={0.022} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
