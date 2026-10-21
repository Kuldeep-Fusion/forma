"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register plugins in browser environments
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if the user has requested reduced motion.
 */
export function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Custom React hook for scoped GSAP animations with automatic lifecycle cleanup via gsap.context().
 * @param {Function} animationCallback - Callback receiving (context, isReduced)
 * @param {Array} dependencies - React effect dependencies
 * @returns {React.RefObject} - Container ref to attach to the root animated DOM node
 */
export function useGsapAnimation(animationCallback, dependencies = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const reduced = isReducedMotion();
    const ctx = gsap.context((self) => {
      if (typeof animationCallback === "function") {
        animationCallback(self, reduced);
      }
    }, containerRef);

    return () => {
      if (ctx && typeof ctx.revert === "function") {
        ctx.revert();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return containerRef;
}

/**
 * Common GSAP animation presets
 */
export const gsapPresets = {
  /**
   * Hero entrance animation: Gentle, non-blocking reveal of badge, headline, subheadline, buttons, and media.
   */
  heroEntrance: (container, { isReduced = false, motionPreset = "cinematic" } = {}) => {
    const allGsap = container.querySelectorAll("[data-gsap]");
    if (isReduced) {
      gsap.set(allGsap, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    // Safety fallback: Ensure text is always 100% visible immediately
    const fallbackTimer = setTimeout(() => {
      gsap.set(allGsap, { opacity: 1, y: 0, clearProps: "all" });
    }, 350);

    const duration = motionPreset === "subtle" ? 0.2 : 0.3;
    const ease = "power2.out";

    const tl = gsap.timeline({
      defaults: { ease, duration },
      onComplete: () => {
        clearTimeout(fallbackTimer);
        gsap.set(allGsap, { clearProps: "all" });
      },
    });

    const badge = container.querySelector("[data-gsap='hero-badge']");
    const headline = container.querySelector("[data-gsap='hero-headline']");
    const subheadline = container.querySelector("[data-gsap='hero-subheadline']");
    const ctas = container.querySelectorAll("[data-gsap='hero-cta']");
    const media = container.querySelector("[data-gsap='hero-media']");

    if (badge) {
      tl.fromTo(badge, { opacity: 0.9, y: 4 }, { opacity: 1, y: 0, duration: 0.2 });
    }
    if (headline) {
      tl.fromTo(headline, { opacity: 0.85, y: 6 }, { opacity: 1, y: 0, duration: 0.25 }, "-=0.15");
    }
    if (subheadline) {
      tl.fromTo(subheadline, { opacity: 0.9, y: 4 }, { opacity: 1, y: 0, duration: 0.2 }, "-=0.15");
    }
    if (ctas && ctas.length) {
      tl.fromTo(ctas, { opacity: 0.9, y: 4 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.2 }, "-=0.15");
    }
    if (media) {
      tl.fromTo(media, { opacity: 0.9, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.15");
    }

    return tl;
  },

  /**
   * ScrollTrigger reveal for cards/grid items with container-aware fallback
   */
  staggerCards: (container, selector = "[data-gsap='card']", { isReduced = false, motionPreset = "cinematic" } = {}) => {
    const cards = container.querySelectorAll(selector);
    if (!cards || !cards.length) return;

    if (isReduced) {
      gsap.set(cards, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    // Safety fallback: If ScrollTrigger does not fire (e.g. inside modal or sub-scroll container), reveal cards automatically
    const fallbackTimer = setTimeout(() => {
      gsap.set(cards, { opacity: 1, y: 0, clearProps: "all" });
    }, 300);

    // If container is inside a sub-scroller (e.g. preview modal or editor canvas) or already in view, reveal immediately
    const isSubScroller = !!container.closest(".overflow-y-auto");
    const rect = container.getBoundingClientRect();
    const inView = rect.top < (typeof window !== "undefined" ? window.innerHeight : 800) * 1.25 && rect.bottom > 0;

    if (inView || isSubScroller) {
      return gsap.fromTo(
        cards,
        { opacity: 0.9, y: 4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.03,
          ease: "power2.out",
          onComplete: () => {
            clearTimeout(fallbackTimer);
            gsap.set(cards, { clearProps: "all" });
          },
        }
      );
    }

    return gsap.fromTo(
      cards,
      { opacity: 0.85, y: 6 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 95%",
          once: true,
          onEnter: () => {
            clearTimeout(fallbackTimer);
            gsap.set(cards, { clearProps: "all" });
          },
        },
        onComplete: () => {
          clearTimeout(fallbackTimer);
          gsap.set(cards, { clearProps: "all" });
        },
      }
    );
  },

  /**
   * Subtle smooth parallax effect on scroll
   */
  subtleParallax: (target, speed = 0.15) => {
    if (isReducedMotion() || !target) return;

    return gsap.to(target, {
      y: () => `${speed * 100}px`,
      ease: "none",
      scrollTrigger: {
        trigger: target,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  },

  /**
   * Magnetic button hover interaction
   */
  magneticButton: (buttonElement, distance = 0.3) => {
    if (!buttonElement || isReducedMotion()) return;

    const onMouseMove = (e) => {
      const rect = buttonElement.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * distance;
      const y = (e.clientY - rect.top - rect.height / 2) * distance;

      gsap.to(buttonElement, {
        x,
        y,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(buttonElement, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    };

    buttonElement.addEventListener("mousemove", onMouseMove);
    buttonElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      buttonElement.removeEventListener("mousemove", onMouseMove);
      buttonElement.removeEventListener("mouseleave", onMouseLeave);
    };
  },
};

export default gsap;
