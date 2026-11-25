'use client';

import { RefObject } from 'react';

export interface GsapRevealOptions {
  containerRef?: RefObject<HTMLElement | null>;
  targetRef?: RefObject<HTMLElement | null>;
  selector?: string;
  headerSelector?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  start?: string;
  parallaxOrb1Selector?: string;
  parallaxOrb2Selector?: string;
}

/**
 * Lightweight no-op hook that preserves SSR visibility (opacity: 1) without
 * importing GSAP/ScrollTrigger or triggering forced reflows during page load.
 */
export function useGsapSectionReveal(
  _refOrOptions: RefObject<HTMLElement | null> | GsapRevealOptions,
  _optionalOptions?: GsapRevealOptions
) {
  // Intentionally empty to keep SSR-rendered sections immediately visible
  // for optimal Speed Index, LCP, and zero forced reflows.
}

