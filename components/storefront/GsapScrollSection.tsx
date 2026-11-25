'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface GsapScrollSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  staggerSelector?: string;
  delay?: number;
  y?: number;
  duration?: number;
}

export default function GsapScrollSection({
  children,
  className = '',
  id,
  staggerSelector,
  delay = 0,
  y = 35,
  duration = 0.8,
}: GsapScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (staggerSelector) {
        const elements = sectionRef.current?.querySelectorAll(staggerSelector);
        if (elements && elements.length > 0) {
          gsap.from(elements, {
            opacity: 0,
            y: y,
            duration: duration,
            stagger: 0.08,
            ease: 'power2.out',
            delay: delay,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          });
          return;
        }
      }

      gsap.from(sectionRef.current, {
        opacity: 0,
        y: y,
        duration: duration,
        ease: 'power2.out',
        delay: delay,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [staggerSelector, delay, y, duration]);

  return (
    <div ref={sectionRef} id={id} className={className}>
      {children}
    </div>
  );
}
