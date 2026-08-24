'use client';

import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface CameraControllerHandle {
  focusNode: (i: number) => void;
  resetView: () => void;
}

const fieldData = [
  { name: 'AI Automation', color: 0x818cf8 },
  { name: 'AI Agent', color: 0x67e8f9 },
  { name: 'Digital Marketing', color: 0xc084fc },
  { name: 'Quantitative Equity', color: 0x60a5fa },
  { name: 'AI-driven SEO', color: 0x5eead4 },
  { name: 'SaaS iSpa', color: 0xf0abfc },
];

const CameraController = forwardRef<CameraControllerHandle, { selected: number | null; setSelected: (i: number | null) => void }>(
  function CameraController({ selected, setSelected }, ref) {
    const { camera } = useThree();
    const flightRef = useRef<{
      start: number;
      duration: number;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      fromLook: THREE.Vector3;
      toLook: THREE.Vector3;
      onDone?: () => void;
    } | null>(null);
    const pointerRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
    const draggingRef = useRef(false);
    const lastXRef = useRef(0);
    const lastYRef = useRef(0);
    const rotRef = useRef({ x: 0, y: 0, z: 0 });
    const targetRotRef = useRef({ x: 0, y: 0, z: 0 });
    const cameraDistanceRef = useRef(14.5);
    const currentLookRef = useRef(new THREE.Vector3(0, 0, 0));
    const targetLookRef = useRef(new THREE.Vector3(0, 0, 0));

    const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const startFlight = (toPos: THREE.Vector3, toLook: THREE.Vector3, duration = 1450, onDone?: () => void) => {
      flightRef.current = {
        start: performance.now(),
        duration,
        fromPos: camera.position.clone(),
        toPos: toPos.clone(),
        fromLook: currentLookRef.current.clone(),
        toLook: toLook.clone(),
        onDone,
      };
    };

    const focusNode = (i: number) => {
      setSelected(i);
      const angle = (i / fieldData.length) * Math.PI * 2 - Math.PI / 2;
      const nodeBase = new THREE.Vector3(
        Math.cos(angle) * 5.8,
        Math.sin(angle) * 3.75,
        Math.sin(angle * 1.7) * 1.05
      );
      const outward = nodeBase.clone().normalize();
      const toPos = nodeBase.clone().add(outward.multiplyScalar(3.25)).add(new THREE.Vector3(0, 0.45, 1.1));
      targetLookRef.current.copy(nodeBase);
      startFlight(toPos, nodeBase, 1500);
    };

    const resetView = () => {
      setSelected(null);
      targetRotRef.current = { x: 0, y: 0, z: 0 };
      targetLookRef.current.set(0, 0, 0);
      startFlight(new THREE.Vector3(0, 0.2, 14.5), new THREE.Vector3(0, 0, 0), 1350);
      cameraDistanceRef.current = 14.5;
    };

    useImperativeHandle(ref, () => ({ focusNode, resetView }));

    useEffect(() => {
      const handlePointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        draggingRef.current = true;
        lastXRef.current = e.clientX;
        lastYRef.current = e.clientY;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };
      const handlePointerUp = () => {
        draggingRef.current = false;
      };
      const handlePointerMove = (e: PointerEvent) => {
        pointerRef.current.px = e.clientX;
        pointerRef.current.py = e.clientY;
        pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        if (draggingRef.current && !flightRef.current) {
          const dx = e.clientX - lastXRef.current;
          const dy = e.clientY - lastYRef.current;
          targetRotRef.current.y += dx * 0.008;
          targetRotRef.current.x += dy * 0.008;
          targetRotRef.current.z += (dx * pointerRef.current.y - dy * pointerRef.current.x) * 0.0012;
          lastXRef.current = e.clientX;
          lastYRef.current = e.clientY;
        }
      };
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (flightRef.current) flightRef.current = null;
        setSelected(null);
        cameraDistanceRef.current = Math.max(7.2, Math.min(28, cameraDistanceRef.current + e.deltaY * 0.009));
        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
        const desired = currentLookRef.current.clone().add(dir.multiplyScalar(cameraDistanceRef.current));
        camera.position.lerp(desired, 0.45);
      };

      const canvas = (document.querySelector('canvas') as HTMLElement) || document;
      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('wheel', handleWheel);
      };
    }, [camera, setSelected]);

    useFrame(() => {
      const t = performance.now() * 0.001;

      if (!draggingRef.current && selected === null && !flightRef.current) {
        targetRotRef.current.y += pointerRef.current.x * 0.00012;
        targetRotRef.current.x += pointerRef.current.y * 0.00007;
      }
      rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.07;
      rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.07;
      rotRef.current.z += (targetRotRef.current.z - rotRef.current.z) * 0.055;

      if (flightRef.current) {
        const raw = (performance.now() - flightRef.current.start) / flightRef.current.duration;
        const q = Math.min(1, raw);
        const e = easeInOut(q);
        camera.position.lerpVectors(flightRef.current.fromPos, flightRef.current.toPos, e);
        camera.position.y += Math.sin(Math.PI * e) * 0.55;
        currentLookRef.current.lerpVectors(flightRef.current.fromLook, flightRef.current.toLook, e);
        if (q >= 1) {
          camera.position.copy(flightRef.current.toPos);
          currentLookRef.current.copy(flightRef.current.toLook);
          const cb = flightRef.current.onDone;
          flightRef.current = null;
          if (cb) cb();
        }
      } else if (selected === null) {
        const desired = new THREE.Vector3(pointerRef.current.x * 0.18, 0.2 - pointerRef.current.y * 0.1, cameraDistanceRef.current);
        camera.position.lerp(desired, 0.035);
        currentLookRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.06);
      } else {
        currentLookRef.current.lerp(targetLookRef.current, 0.08);
      }

      camera.lookAt(currentLookRef.current);
    });

    return null;
  }
);

CameraController.displayName = 'CameraController';
export default CameraController;
