import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  stagger?: number;
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

export function useScrollAnimations() {
  const triggersRef = useRef<ScrollTrigger[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check localStorage setting first
    try {
      const settings = JSON.parse(localStorage.getItem('challenge-tracker-settings') || '{}');
      if (settings.animationsEnabled === false) return true;
    } catch (e) {
      // Ignore parse errors
    }
    
    // Check system preference
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Fade in from bottom on scroll
  const fadeInOnScroll = useCallback((
    element: Element | null,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!element || prefersReducedMotion()) return null;

    const { y = 30, duration = 0.6, start = 'top 85%' } = options;

    const tween = gsap.fromTo(
      element,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    );

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Scale in on scroll
  const scaleInOnScroll = useCallback((
    element: Element | null,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!element || prefersReducedMotion()) return null;

    const { duration = 0.5, start = 'top 85%' } = options;

    const tween = gsap.fromTo(
      element,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    );

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Stagger children on scroll
  const staggerOnScroll = useCallback((
    container: Element | null,
    childSelector: string = '> *',
    options: ScrollAnimationOptions = {}
  ) => {
    if (!container || prefersReducedMotion()) return null;

    const { stagger = 0.1, y = 20, duration = 0.5, start = 'top 85%' } = options;
    const children = container.querySelectorAll(childSelector);

    if (children.length === 0) return null;

    const tween = gsap.fromTo(
      children,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    );

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Slide in from side on scroll
  const slideInOnScroll = useCallback((
    element: Element | null,
    direction: 'left' | 'right' = 'left',
    options: ScrollAnimationOptions = {}
  ) => {
    if (!element || prefersReducedMotion()) return null;

    const { duration = 0.6, start = 'top 85%' } = options;
    const x = direction === 'left' ? -50 : 50;

    const tween = gsap.fromTo(
      element,
      { opacity: 0, x },
      {
        opacity: 1,
        x: 0,
        duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    );

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Counter animation on scroll
  const counterOnScroll = useCallback((
    element: Element | null,
    endValue: number,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!element || prefersReducedMotion()) {
      if (element) (element as HTMLElement).textContent = String(endValue);
      return null;
    }

    const { duration = 1.5, start = 'top 85%' } = options;
    const obj = { value: 0 };

    const tween = gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        (element as HTMLElement).textContent = Math.round(obj.value).toString();
      },
    });

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Parallax effect on scroll
  const parallaxOnScroll = useCallback((
    element: Element | null,
    speed: number = 0.5
  ) => {
    if (!element || prefersReducedMotion()) return null;

    const tween = gsap.to(element, {
      y: () => window.innerHeight * speed * 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    if (tween.scrollTrigger) {
      triggersRef.current.push(tween.scrollTrigger);
    }

    return tween;
  }, [prefersReducedMotion]);

  // Refresh all ScrollTriggers (useful after content changes)
  const refresh = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  return {
    fadeInOnScroll,
    scaleInOnScroll,
    staggerOnScroll,
    slideInOnScroll,
    counterOnScroll,
    parallaxOnScroll,
    refresh,
    prefersReducedMotion,
    gsap,
    ScrollTrigger,
  };
}
