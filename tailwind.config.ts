import type { Config } from "tailwindcss";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * PixelForge Studio — Design tokens
 * ─────────────────────────────────────────────────────────────────────────
 *
 * SPACING SCALE — 4px base unit
 * All spacing (padding, margin, gap, width/height utilities that read from
 * the `spacing` scale) is expressed in multiples of 4px so that anything
 * placed on the canvas lines up on a shared grid.
 *
 *   token   px     rem
 *   0       0px    0rem
 *   0.5     2px    0.125rem   (hairline nudges only)
 *   1       4px    0.25rem
 *   2       8px    0.5rem
 *   3       12px   0.75rem
 *   4       16px   1rem
 *   5       20px   1.25rem
 *   6       24px   1.5rem
 *   7       28px   1.75rem
 *   8       32px   2rem
 *   9       36px   2.25rem
 *   10      40px   2.5rem
 *   12      48px   3rem
 *   14      56px   3.5rem
 *   16      64px   4rem
 *   20      80px   5rem
 *   24      96px   6rem
 *   28      112px  7rem
 *   32      128px  8rem
 *   36      144px  9rem
 *   40      160px  10rem
 *   48      192px  12rem
 *   56      224px  14rem
 *   64      256px  16rem
 *
 * TYPE SCALE — a restrained, modular scale for UI + marketing copy
 *
 *   token   size      line-height   use
 *   xs      12px      16px          micro labels, hints
 *   sm      14px      20px          secondary UI text, captions
 *   base    16px      24px          body copy, default UI text
 *   lg      18px      28px          emphasized body / lead paragraphs
 *   xl      20px      28px          card titles, small headings
 *   2xl     24px      32px          section sub-headings
 *   3xl     30px      36px          section headings
 *   4xl     36px      40px          page headings
 *   5xl     48px      52px          hero sub-line
 *   6xl     60px      60px          hero headline (tight tracking)
 *   7xl     72px      72px          display / large hero headline
 * ─────────────────────────────────────────────────────────────────────────
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "0.5": "0.125rem",
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "7": "1.75rem",
        "8": "2rem",
        "9": "2.25rem",
        "10": "2.5rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
        "28": "7rem",
        "32": "8rem",
        "36": "9rem",
        "40": "10rem",
        "48": "12rem",
        "56": "14rem",
        "64": "16rem",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem", { lineHeight: "3.75rem", letterSpacing: "-0.02em" }],
        "7xl": ["4.5rem", { lineHeight: "4.5rem", letterSpacing: "-0.025em" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        glass: {
          DEFAULT: "hsl(var(--glass) / <alpha-value>)",
          border: "hsl(var(--glass-border) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glass: "0 1px 1px 0 rgb(0 0 0 / 0.05), 0 8px 24px -8px rgb(0 0 0 / 0.45)",
        "glow-accent": "0 0 0 1px hsl(var(--ring) / 0.4), 0 0 24px -4px hsl(var(--ring) / 0.35)",
      },
      backdropBlur: {
        xs: "2px",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "gradient-pan": "gradient-pan 12s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
