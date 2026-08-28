/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.15)',
        'glow-md': '0 0 30px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 50px rgba(99, 102, 241, 0.25)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.2)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.2)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.2)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'elevation-1': '0 4px 16px -4px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
        'elevation-3': '0 16px 48px -12px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeInUp: {
          "from": { opacity: "0", transform: "translateY(24px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "from": { opacity: "0", transform: "translateY(-16px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "from": { opacity: "0", transform: "scale(0.92)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        slideInUp: {
          "from": { opacity: "0", transform: "translateY(40px) scale(0.96)" },
          "to": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.08)", opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "pulseGlow 3s ease-in-out infinite",
        "float": "floatSlow 4s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-down": "fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-up": "slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-in": "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "breathe": "breathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
