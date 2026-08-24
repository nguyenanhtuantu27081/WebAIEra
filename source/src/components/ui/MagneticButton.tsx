'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wrapRef.current || !btnRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btnRef.current, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
  };

  const Tag: any = href ? 'a' : 'button';

  return (
    <div
      ref={wrapRef}
      className="inline-block p-5 -m-5"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Tag ref={btnRef} href={href} onClick={onClick} className={className}>
        {children}
      </Tag>
    </div>
  );
}
