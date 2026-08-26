/**
 * CapacityConnect Animation System
 * Powered by Framer Motion — BridgeMind-inspired micro-interactions
 */
import type { Variants, Transition } from 'framer-motion';

// ═══════════════════════════════════════════════════════════
// EASING CURVES
// ═══════════════════════════════════════════════════════════
export const ease = {
  /** Apple-style spring deceleration */
  smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Snappy enter */
  snappy: [0.22, 0.68, 0, 1.04] as [number, number, number, number],
  /** Gentle bounce */
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Linear for progress */
  linear: [0, 0, 1, 1] as [number, number, number, number],
};

// ═══════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  mass: 0.8,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 1,
};

export const smoothTransition: Transition = {
  duration: 0.6,
  ease: ease.smooth,
};

// ═══════════════════════════════════════════════════════════
// FADE VARIANTS
// ═══════════════════════════════════════════════════════════
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

// ═══════════════════════════════════════════════════════════
// SCALE VARIANTS
// ═══════════════════════════════════════════════════════════
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// SLIDE VARIANTS
// ═══════════════════════════════════════════════════════════
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: ease.smooth },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth },
  },
};

// ═══════════════════════════════════════════════════════════
// STAGGER CONTAINERS
// ═══════════════════════════════════════════════════════════
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// STAGGER CHILD ITEMS
// ═══════════════════════════════════════════════════════════
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
};

// ═══════════════════════════════════════════════════════════
// HOVER & TAP INTERACTIONS
// ═══════════════════════════════════════════════════════════
export const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.25, ease: ease.smooth },
  },
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 20px 60px -15px rgba(37, 99, 235, 0.35), 0 0 40px -10px rgba(59, 130, 246, 0.2)',
    transition: { duration: 0.3, ease: ease.smooth },
  },
  whileTap: { scale: 0.97 },
};

export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 },
};

export const buttonHover = {
  whileHover: {
    scale: 1.04,
    y: -2,
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
  },
  whileTap: { scale: 0.96 },
};

// ═══════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ═══════════════════════════════════════════════════════════
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: ease.smooth },
  },
};

// ═══════════════════════════════════════════════════════════
// CARD FLIP / REVEAL
// ═══════════════════════════════════════════════════════════
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotateX: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: ease.smooth,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// NUMBER COUNTER ANIMATION (for stats)
// ═══════════════════════════════════════════════════════════
export const counterPop: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: 0.2,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// GLOW PULSE (for live indicators)
// ═══════════════════════════════════════════════════════════
export const glowPulse: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.4)',
      '0 0 0 10px rgba(59, 130, 246, 0)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// TYPING / TEXT REVEAL
// ═══════════════════════════════════════════════════════════
export const textRevealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

export const textRevealChar: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.smooth },
  },
};

// ═══════════════════════════════════════════════════════════
// MAGNETIC HOVER (for icons & small elements)
// ═══════════════════════════════════════════════════════════
export const magneticHover = {
  whileHover: {
    scale: 1.15,
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.4, ease: ease.smooth },
  },
};

// ═══════════════════════════════════════════════════════════
// FLOAT ANIMATION (continuous)
// ═══════════════════════════════════════════════════════════
export const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
