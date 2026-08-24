'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export default function GlassCard({
  children,
  className = '',
  tilt = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  [key: string]: any;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt || !cardRef.current || prefersReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);

    const dx = (x - rect.width / 2) / (rect.width / 2);
    const dy = (y - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotateX: -dy * 8,
      rotateY: dx * 8,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!tilt || !cardRef.current || prefersReducedMotion) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={cardRef}
      className={`glass glass-tilt rounded-2xl p-6 transition-all duration-300 hover:border-indigo/30 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </div>
  );
}
