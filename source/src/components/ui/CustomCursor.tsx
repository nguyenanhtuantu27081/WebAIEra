'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reduceMotion) return;

    const handleMove = (e: MouseEvent) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.05 });
      gsap.to(outlineRef.current, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    };

    const interactiveEls = document.querySelectorAll('a, button, .glass-tilt');
    const onEnter = () =>
      gsap.to(outlineRef.current, { scale: 1.6, borderColor: 'rgba(129,140,248,0.6)', duration: 0.2 });
    const onLeave = () =>
      gsap.to(outlineRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.4)', duration: 0.2 });

    window.addEventListener('mousemove', handleMove);
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    document.body.classList.add('cursor-none');

    return () => {
      window.removeEventListener('mousemove', handleMove);
      interactiveEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      document.body.classList.remove('cursor-none');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}
