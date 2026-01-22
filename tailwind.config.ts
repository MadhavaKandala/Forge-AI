import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-secondary": "hsl(var(--background-secondary))",
        foreground: "hsl(var(--foreground))",
        "foreground-secondary": "hsl(var(--foreground-secondary))",
        "foreground-tertiary": "hsl(var(--foreground-tertiary))",
        "foreground-muted": "hsl(var(--foreground-muted))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        // Neon category colors
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          pink: "hsl(var(--neon-pink))",
          purple: "hsl(var(--neon-purple))",
          gold: "hsl(var(--neon-gold))",
          emerald: "hsl(var(--neon-emerald))",
        },
        // Streak colors
        streak: {
          start: "hsl(var(--streak-start))",
          mid: "hsl(var(--streak-mid))",
          hot: "hsl(var(--streak-hot))",
          legendary: "hsl(var(--streak-legendary))",
        },
        // Heatmap colors
        heatmap: {
          empty: "hsl(var(--heatmap-empty))",
          light: "hsl(var(--heatmap-light))",
          medium: "hsl(var(--heatmap-medium))",
          dark: "hsl(var(--heatmap-dark))",
          max: "hsl(var(--heatmap-max))",
        },
        // Category colors
        category: {
          coding: "hsl(var(--category-coding))",
          fitness: "hsl(var(--category-fitness))",
          reading: "hsl(var(--category-reading))",
          learning: "hsl(var(--category-learning))",
          productivity: "hsl(var(--category-productivity))",
          creativity: "hsl(var(--category-creativity))",
          health: "hsl(var(--category-health))",
          other: "hsl(var(--category-other))",
        },
        // Semantic
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        'fast': '150ms',
        'regular': '250ms',
        'slow': '350ms',
        'very-slow': '500ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'entrance': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'exit': 'cubic-bezier(0.17, 0.89, 0.32, 1)',
        'spring': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
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
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "radar-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.9" },
        },
        "streak-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(24, 100%, 50%, 0.3)" },
          "50%": { boxShadow: "0 0 35px hsl(38, 95%, 55%, 0.5)" },
        },
        "flame-flicker": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.05) rotate(-2deg)" },
          "75%": { transform: "scale(0.98) rotate(2deg)" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "level-up-burst": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "draw-in": {
          "0%": { strokeDashoffset: "100%" },
          "100%": { strokeDashoffset: "0%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "radar-pulse": "radar-pulse 2s ease-in-out infinite",
        "streak-glow": "streak-glow 2s ease-in-out infinite",
        "flame-flicker": "flame-flicker 1.5s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "level-up-burst": "level-up-burst 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)",
        "shimmer": "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)",
        "draw-in": "draw-in 1s ease-out forwards",
      },
      boxShadow: {
        'glow-cyan': '0 0 20px hsl(187, 100%, 50%, 0.3)',
        'glow-pink': '0 0 20px hsl(345, 100%, 56%, 0.3)',
        'glow-purple': '0 0 20px hsl(260, 91%, 76%, 0.3)',
        'glow-gold': '0 0 20px hsl(45, 97%, 64%, 0.3)',
        'glow-emerald': '0 0 20px hsl(160, 84%, 39%, 0.3)',
        'glow-intense': '0 0 40px hsl(187, 100%, 50%, 0.4), 0 0 80px hsl(187, 100%, 50%, 0.2)',
        'elevated': '0 8px 24px hsl(0, 0%, 0%, 0.25)',
        'deep': '0 16px 48px hsl(0, 0%, 0%, 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
