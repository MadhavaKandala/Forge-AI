import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export function useGSAPAnimations() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Confetti explosion effect
  const triggerConfetti = useCallback((container: HTMLElement, count: number = 50) => {
    const colors = [
      'hsl(24, 95%, 53%)',   // primary orange
      'hsl(38, 92%, 50%)',   // gold
      'hsl(168, 76%, 36%)',  // teal
      'hsl(12, 90%, 55%)',   // red-orange
      'hsl(280, 80%, 55%)',  // purple
    ];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: ${gsap.utils.random(8, 14)}px;
        height: ${gsap.utils.random(8, 14)}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
      `;
      container.appendChild(confetti);

      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2;

      gsap.set(confetti, { x: startX, y: startY, scale: 0 });

      gsap.to(confetti, {
        x: startX + gsap.utils.random(-300, 300),
        y: startY + gsap.utils.random(-400, 200),
        rotation: gsap.utils.random(-720, 720),
        scale: gsap.utils.random(0.5, 1.5),
        opacity: 0,
        duration: gsap.utils.random(1.5, 2.5),
        ease: 'power2.out',
        onComplete: () => confetti.remove(),
      });
    }
  }, []);

  // Fireworks burst effect
  const triggerFireworks = useCallback((container: HTMLElement) => {
    const bursts = 3;
    const colors = ['#ff6b35', '#ffc234', '#4ecdc4', '#ff3366', '#9b59b6'];

    for (let b = 0; b < bursts; b++) {
      setTimeout(() => {
        const centerX = gsap.utils.random(window.innerWidth * 0.3, window.innerWidth * 0.7);
        const centerY = gsap.utils.random(window.innerHeight * 0.2, window.innerHeight * 0.5);

        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div');
          particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 10px currentColor;
          `;
          container.appendChild(particle);

          const angle = (i / 20) * Math.PI * 2;
          const distance = gsap.utils.random(80, 150);

          gsap.set(particle, { x: centerX, y: centerY, scale: 0 });

          gsap.to(particle, {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            scale: 1,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => particle.remove(),
          });
        }
      }, b * 300);
    }
  }, []);

  // Stagger animation for lists
  const staggerIn = useCallback((elements: Element[] | NodeListOf<Element>, options?: {
    stagger?: number;
    from?: 'start' | 'end' | 'center' | 'random';
    y?: number;
    duration?: number;
  }) => {
    const { stagger = 0.1, from = 'start', y = 30, duration = 0.6 } = options || {};

    gsap.fromTo(
      elements,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger: { each: stagger, from },
        ease: 'power3.out',
      }
    );
  }, []);

  // Pulse glow effect
  const pulseGlow = useCallback((element: Element, color?: string) => {
    const glowColor = color || 'hsl(24, 95%, 53%)';
    
    return gsap.to(element, {
      boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
      scale: 1.05,
      duration: 0.3,
      yoyo: true,
      repeat: 3,
      ease: 'power2.inOut',
    });
  }, []);

  // Shake effect for errors
  const shake = useCallback((element: Element) => {
    return gsap.to(element, {
      keyframes: [
        { x: -10 },
        { x: 10 },
        { x: -10 },
        { x: 10 },
        { x: 0 },
      ],
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }, []);

  // Counter animation
  const animateCounter = useCallback((element: Element, from: number, to: number, duration: number = 1) => {
    const obj = { value: from };
    
    return gsap.to(obj, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
    });
  }, []);

  // Progress bar animation
  const animateProgress = useCallback((element: Element, from: number, to: number) => {
    return gsap.fromTo(
      element,
      { width: `${from}%` },
      { width: `${to}%`, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  // Floating animation
  const float = useCallback((element: Element) => {
    return gsap.to(element, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, []);

  // Card flip animation
  const flipIn = useCallback((element: Element) => {
    return gsap.fromTo(
      element,
      { rotationY: -90, opacity: 0 },
      { rotationY: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  // Bounce in animation
  const bounceIn = useCallback((element: Element, delay: number = 0) => {
    return gsap.fromTo(
      element,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, delay, ease: 'back.out(1.7)' }
    );
  }, []);

  // Slide reveal
  const slideReveal = useCallback((element: Element, direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
    const coords = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: 100 },
      down: { x: 0, y: -100 },
    };

    return gsap.fromTo(
      element,
      { ...coords[direction], opacity: 0 },
      { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return {
    triggerConfetti,
    triggerFireworks,
    staggerIn,
    pulseGlow,
    shake,
    animateCounter,
    animateProgress,
    float,
    flipIn,
    bounceIn,
    slideReveal,
    gsap,
  };
}
