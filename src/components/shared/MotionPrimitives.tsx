'use client';

import React, { useRef } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion';
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInUp,
  staggerContainer,
  staggerItem,
  staggerItemScale,
  hoverLift,
  hoverGlow,
  buttonHover,
  cardReveal,
  ease,
} from '@/lib/animations';

// ═══════════════════════════════════════════════════════════
// MOTION SECTION — scroll-triggered reveal with parallax
// ═══════════════════════════════════════════════════════════
interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'slide-up' | 'card-reveal';
  delay?: number;
  once?: boolean;
  parallax?: boolean;
}

const variantMap: Record<string, Variants> = {
  'fade-up': fadeInUp,
  'fade-down': fadeInDown,
  'fade-left': fadeInLeft,
  'fade-right': fadeInRight,
  'scale': scaleIn,
  'slide-up': slideInUp,
  'card-reveal': cardReveal,
};

export function MotionSection({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  once = true,
  parallax = false,
}: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const selected = variantMap[variant] || fadeInUp;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={selected}
      className={className}
      style={parallax ? { y } : undefined}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTION STAGGER — children animate in sequence
// ═══════════════════════════════════════════════════════════
interface MotionStaggerProps {
  children: React.ReactNode;
  className?: string;
  itemVariant?: 'default' | 'scale';
  once?: boolean;
}

export function MotionStagger({
  children,
  className = '',
  itemVariant = 'default',
  once = true,
}: MotionStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariant === 'scale' ? staggerItemScale : staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTION CARD — hover lift + glow effect
// ═══════════════════════════════════════════════════════════
interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function MotionCard({ children, className = '', glow = false }: MotionCardProps) {
  const hover = glow ? hoverGlow : hoverLift;

  return (
    <motion.div
      className={className}
      {...hover}
      layout
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTION BUTTON — spring press + hover lift
// ═══════════════════════════════════════════════════════════
export const MotionButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof motion.button>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.button
      ref={ref}
      className={className}
      {...buttonHover}
      {...props}
    >
      {children}
    </motion.button>
  )
);
MotionButton.displayName = 'MotionButton';

// ═══════════════════════════════════════════════════════════
// MOTION COUNTER — animated number with spring
// ═══════════════════════════════════════════════════════════
interface MotionCounterProps {
  target: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  separator?: string;
  decimals?: number;
}

export function MotionCounter({
  target,
  className = '',
  prefix = '',
  suffix = '',
  duration = 2,
  separator = '',
  decimals = 0,
}: MotionCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easedProgress * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toString();

  const withSep = separator
    ? formatted.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : formatted;

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {prefix}{withSep}{suffix}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTION TEXT — word-by-word or letter-by-letter reveal
// ═══════════════════════════════════════════════════════════
interface MotionTextProps {
  text: string;
  className?: string;
  mode?: 'word' | 'letter';
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function MotionText({
  text,
  className = '',
  mode = 'word',
  tag = 'p',
}: MotionTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const Tag = motion[tag] as typeof motion.p;

  const units = mode === 'word' ? text.split(' ') : text.split('');

  return (
    <Tag
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: mode === 'word' ? 0.06 : 0.02,
          },
        },
      }}
    >
      {units.map((unit, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.4, ease: ease.smooth },
            },
          }}
        >
          {unit}{mode === 'word' && i < units.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}

// ═══════════════════════════════════════════════════════════
// PARALLAX SECTION — scroll-linked vertical offset
// ═══════════════════════════════════════════════════════════
interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

export function Parallax({ children, className = '', offset = 50 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAGNETIC ELEMENT — follows cursor within bounds
// ═══════════════════════════════════════════════════════════
interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
