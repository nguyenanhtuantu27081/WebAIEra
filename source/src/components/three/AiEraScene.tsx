'use client';

import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AiEraCore from './AiEraCore';
import BusinessNode from './BusinessNode';
import ParticleField from './ParticleField';
import CameraController, { CameraControllerHandle } from './CameraController';
import Effects from './Effects';
import { detectQualityTier, QUALITY_PRESETS, type QualityTier } from '@/lib/three/quality-tiers';

const fieldData = [
  { name: 'AI Automation', color: 0x818cf8, desc: 'Autonomous workflows, orchestration and intelligent process automation that connect tools, data and decisions.' },
  { name: 'AI Agent', color: 0x67e8f9, desc: 'Goal-driven AI agents that reason, use tools, collaborate and execute multi-step operations across digital systems.' },
  { name: 'Digital Marketing', color: 0xc084fc, desc: 'AI-assisted growth systems for content, campaigns, audience intelligence, conversion and lifecycle optimization.' },
  { name: 'Quantitative Equity', color: 0x60a5fa, desc: 'Data-driven equity research combining quantitative signals, factor models, screening and machine-assisted analysis.' },
  { name: 'AI-driven SEO', color: 0x5eead4, desc: 'Search-first web experiences combining technical SEO, semantic architecture, AI discovery and conversion-focused design.' },
  { name: 'SaaS iSpa', color: 0xf0abfc, desc: 'Vertical SaaS infrastructure for spa operations, customer journeys, automation, analytics and intelligent service management.' },
];

export interface AiEraSceneHandle {
  resetView: () => void;
}

function World({ cameraControllerRef, selected, setSelected, tier }: {
  cameraControllerRef: React.RefObject<CameraControllerHandle | null>;
  selected: number | null;
  setSelected: (i: number | null) => void;
  tier: QualityTier;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const rotRef = useRef({ x: 0, y: 0, z: 0 });
  const targetRotRef = useRef({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    const t = performance.now() * 0.001;

    if (!draggingRef.current && selected === null) {
      targetRotRef.current.y += pointerRef.current.x * 0.00012;
      targetRotRef.current.x += pointerRef.current.y * 0.00007;
    }
    rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.07;
    rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.07;
    rotRef.current.z += (targetRotRef.current.z - rotRef.current.z) * 0.055;

    if (groupRef.current) {
      groupRef.current.rotation.set(rotRef.current.x, rotRef.current.y, rotRef.current.z);
    }
  });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handlePointerDown = () => {
      draggingRef.current = true;
    };
    const handlePointerUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const preset = QUALITY_PRESETS[tier];

  return (
    <group ref={groupRef}>
      <AiEraCore />
      {fieldData.map((data, i) => (
        <BusinessNode
          key={i}
          data={data}
          index={i}
          onFocus={(idx) => cameraControllerRef.current?.focusNode(idx)}
        />
      ))}
      <ParticleField tier={tier} />
      <CameraController
        ref={cameraControllerRef}
        selected={selected}
        setSelected={setSelected}
      />
    </group>
  );
}

const AiEraScene = forwardRef<AiEraSceneHandle, { onNodeFocus?: (name: string, desc: string, index: number) => void }>(
  function AiEraScene({ onNodeFocus }, ref) {
    const cameraControllerRef = useRef<CameraControllerHandle | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [tier, setTier] = useState<QualityTier>(detectQualityTier());

    useImperativeHandle(ref, () => ({
      resetView: () => cameraControllerRef.current?.resetView(),
    }));

    const handleFocus = (i: number) => {
      setSelected(i);
      onNodeFocus?.(fieldData[i].name, fieldData[i].desc, i);
    };

    const preset = QUALITY_PRESETS[tier];

    return (
      <Canvas
        camera={{ position: [0, 0.2, 14.5], fov: 48, near: 0.1, far: 120 }}
        dpr={preset.dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => {
          (window as any).__aiEraCamera = camera;
        }}
      >
        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 10, 50]} />
        <ambientLight intensity={0.36} color="#30304c" />
        <pointLight position={[4, 4, 6]} intensity={28} distance={36} decay={2} color="#8b8cff" />
        <pointLight position={[-4, -3, 3]} intensity={15} distance={30} decay={2} color="#67e8f9" />
        <World
          cameraControllerRef={cameraControllerRef}
          selected={selected}
          setSelected={setSelected}
          tier={tier}
        />
        {preset.bloom && <Effects intensity={preset.bloomIntensity} />}
      </Canvas>
    );
  }
);

AiEraScene.displayName = 'AiEraScene';
export default AiEraScene;
