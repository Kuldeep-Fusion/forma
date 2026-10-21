"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * FadeUp motion wrapper for smooth staggered reveals
 * Guaranteed text visibility: starts at readable opacity and gentle 4px lift
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.35,
  distance = 6,
  className = "",
  once = true,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.85, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * BlurReveal motion wrapper - Soft, clean entrance without blinding blur
 */
export function BlurReveal({
  children,
  delay = 0,
  duration = 0.35,
  className = "",
  once = true,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.85, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * TextReveal motion component that smoothly reveals words without obscuring text
 */
export function TextReveal({
  text,
  as: Component = "h2",
  className = "",
  delay = 0,
  stagger = 0.02,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !text) {
    return <Component className={className}>{text}</Component>;
  }

  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0.9 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0.85, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0 }}
        className="inline-block"
      >
        {words.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            variants={wordVariants}
            className="inline-block mr-[0.28em] last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}

/**
 * HoverCard interactive micro-animation wrapper
 */
export function HoverCard({ children, className = "", scale = 1.02 }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.99 }}
      className={`transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
