'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUALITY_PRESETS, type QualityTier } from '@/lib/three/quality-tiers';

const fieldData = [
  { name: 'AI Automation', color: 0x818cf8, desc: 'Autonomous workflows, orchestration and intelligent process automation that connect tools, data and decisions.' },
  { name: 'AI Agent', color: 0x67e8f9, desc: 'Goal-driven AI agents that reason, use tools, collaborate and execute multi-step operations across digital systems.' },
  { name: 'Digital Marketing', color: 0xc084fc, desc: 'AI-assisted growth systems for content, campaigns, audience intelligence, conversion and lifecycle optimization.' },
  { name: 'Quantitative Equity', color: 0x60a5fa, desc: 'Data-driven equity research combining quantitative signals, factor models, screening and machine-assisted analysis.' },
  { name: 'AI-driven SEO', color: 0x5eead4, desc: 'Search-first web experiences combining technical SEO, semantic architecture, AI discovery and conversion-focused design.' },
  { name: 'SaaS iSpa', color: 0xf0abfc, desc: 'Vertical SaaS infrastructure for spa operations, customer journeys, automation, analytics and intelligent service management.' },
];

export default function BusinessNode({ data, index, onFocus, tier }: { data: typeof fieldData[0]; index: number; onFocus: (i: number) => void; tier: QualityTier }) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);
  const pulseLineRef = useRef<THREE.Line>(null);
  const [hovered, setHovered] = useState(false);

  const orbitX = 5.8;
  const orbitY = 3.75;
  const basePosition = useMemo(() => {
    const angle = (index / fieldData.length) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(
      Math.cos(angle) * orbitX,
      Math.sin(angle) * orbitY,
      Math.sin(angle * 1.7) * 1.05
    );
  }, [index]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = index * 1.21;
    if (groupRef.current) {
      groupRef.current.position.copy(basePosition);
      groupRef.current.position.y += Math.sin(t * 0.72 + phase) * 0.12;
      groupRef.current.position.z += Math.cos(t * 0.57 + phase) * 0.15;
    }
    if (shellRef.current) {
      const pulse = 1 + Math.sin(t * 2 + phase) * 0.14 + (hovered ? 0.18 : 0);
      shellRef.current.scale.setScalar(pulse);
    }
    if (auraRef.current) {
      auraRef.current.material.opacity = (hovered ? 0.9 : 0.48) + Math.sin(t * 1.6 + phase) * 0.06;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.004 * (index % 2 ? 1 : -1);
      ringRef.current.rotation.y += 0.0014;
    }
    if (lineRef.current && groupRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      positions[3] = groupRef.current.position.x;
      positions[4] = groupRef.current.position.y;
      positions[5] = groupRef.current.position.z;
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (pulseLineRef.current && groupRef.current) {
      const positions = pulseLineRef.current.geometry.attributes.position.array as Float32Array;
      positions[3] = groupRef.current.position.x;
      positions[4] = groupRef.current.position.y;
      positions[5] = groupRef.current.position.z;
      pulseLineRef.current.geometry.attributes.position.needsUpdate = true;
      pulseLineRef.current.computeLineDistances();
    }
  });

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.16, 'rgba(129,140,248,.35)');
    gradient.addColorStop(0.48, 'rgba(99,102,241,.08)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const preset = QUALITY_PRESETS[tier];

  return (
    <group ref={groupRef}>
      <mesh
        ref={shellRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onFocus(index)}
      >
        <icosahedronGeometry args={[0.26, 2]} />
        <meshPhysicalMaterial
          color={0x101018}
          emissive={data.color}
          emissiveIntensity={1.2}
          metalness={0.65}
          roughness={0.22}
        />
      </mesh>
      <pointLight color={data.color} intensity={5.5} distance={5.2} decay={2} />
      <sprite ref={auraRef} scale={[1.55, 1.55, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={data.color}
          transparent
          opacity={0.52}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <mesh ref={ringRef} rotation={[1.04, 0.34, 0.1]}>
        <torusGeometry args={[0.48, 0.008, 7, 70]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.44} />
      </mesh>
      <line ref={lineRef} geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), basePosition.clone()])}>
        <lineBasicMaterial color={data.color} transparent opacity={0.11} />
      </line>
      <line
        ref={pulseLineRef}
        geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), basePosition.clone()])}
      >
        <lineDashedMaterial color={data.color} transparent opacity={0.22} dashSize={0.09} gapSize={0.16} />
      </line>
    </group>
  );
}
