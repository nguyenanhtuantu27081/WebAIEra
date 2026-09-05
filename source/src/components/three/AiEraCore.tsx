'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AiEraCore({ segments = 32, frameSkip = 0 }: { segments?: number; frameSkip?: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coreWireRef = useRef<THREE.LineSegments>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const torusRefs = useRef<THREE.Mesh[]>([]);
  const sparkRefs = useRef<THREE.Mesh[]>([]);
  const frameCount = useRef(0);

  // F.4: Reduce icosahedron subdivision based on segments prop
  const coreSubdivision = segments > 16 ? 5 : segments > 10 ? 3 : 2;
  const wireSubdivision = segments > 16 ? 2 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Core rotation always runs (cheap, primary visual)
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.09;
      coreRef.current.rotation.y = t * 0.14;
    }
    if (coreWireRef.current) {
      coreWireRef.current.rotation.x = -t * 0.08;
      coreWireRef.current.rotation.z = t * 0.055;
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = 0.53 + Math.sin(t * 2.05) * 0.09;
    }

    // F.5: Throttle secondary animations (torus/spark) — skip frames on mobile
    frameCount.current++;
    if (frameSkip > 0 && frameCount.current % (frameSkip + 1) !== 0) return;

    torusRefs.current.forEach((torus, i) => {
      if (torus) {
        const speed = (i % 2 ? -0.0017 : 0.0021) * (i + 1);
        torus.rotation.z += speed;
        torus.rotation.y -= speed * 0.45;
      }
    });
    sparkRefs.current.forEach((spark) => {
      if (spark && spark.userData.phase !== undefined) {
        const phase = spark.userData.phase as number;
        spark.scale.setScalar(0.7 + Math.sin(t * 2 + phase) * 0.28);
      }
    });
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

  // F.4: Reduce torus segments for mobile
  const torusRadialSegments = segments > 16 ? 8 : 6;
  const torusTubularSegments = segments > 16 ? 190 : segments > 10 ? 90 : 48;

  // F.4: Reduce spark count for mobile
  const sparkCount = segments > 16 ? 44 : segments > 10 ? 20 : 10;

  return (
    <group>
      <mesh ref={coreRef} castShadow>
        <icosahedronGeometry args={[1.28, coreSubdivision]} />
        <meshPhysicalMaterial
          color={0x11121e}
          metalness={0.7}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive={0x34398c}
          emissiveIntensity={1.45}
        />
      </mesh>
      <lineSegments ref={coreWireRef} geometry={new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.39, wireSubdivision))}>
        <lineBasicMaterial color={0xa5b4fc} transparent opacity={0.19} />
      </lineSegments>
      <sprite ref={haloRef} scale={[6.7, 6.7, 1]}>
        <spriteMaterial
          map={glowTexture}
          color={0x8b8cff}
          transparent
          opacity={0.68}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {[1.72, 2.08, 2.48].map((r, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) torusRefs.current[i] = el;
          }}
          rotation={[0.48 + i * 0.41, 0.22 + i * 0.62, 0.12 + i * 0.29]}
        >
          <torusGeometry args={[r, 0.009 + i * 0.003, torusRadialSegments, torusTubularSegments]} />
          <meshBasicMaterial
            color={i === 1 ? 0x67e8f9 : 0x818cf8}
            transparent
            opacity={0.22 - i * 0.035}
          />
        </mesh>
      ))}
      {Array.from({ length: sparkCount }).map((_, i) => {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const radius = 1.55 + Math.random() * 1.17;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) {
                el.userData.phase = Math.random() * 6.28;
                sparkRefs.current[i] = el;
              }
            }}
            position={[x, y, z]}
          >
            <sphereGeometry args={[0.012 + Math.random() * 0.016, 6, 6]} />
            <meshBasicMaterial
              color={Math.random() > 0.72 ? 0x67e8f9 : 0xa5b4fc}
              transparent
              opacity={0.78}
            />
          </mesh>
        );
      })}
    </group>
  );
}
