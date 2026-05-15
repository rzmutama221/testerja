import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#01a35a',
          hover: '#0edf7d',
          foreground: '#ffffff',
        },
        // Dark theme colors
        dark: {
          DEFAULT: '#171717',
          card: '#2c2c2c',
          border: '#3f3f46',
        },
        // Status colors
        success: {
          DEFAULT: '#01a35a',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
        },
        error: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        // Shadcn/ui compatible theming
        border: '#3f3f46',
        input: '#3f3f46',
        ring: '#01a35a',
        background: '#171717',
        foreground: '#ffffff',
        secondary: {
          DEFAULT: '#2c2c2c',
          foreground: '#a1a1aa',
        },
        muted: {
          DEFAULT: '#2c2c2c',
          foreground: '#71717a',
        },
        accent: {
          DEFAULT: '#01a35a',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#2c2c2c',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#2c2c2c',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'heading-1': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
        'heading-2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'heading-3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading-4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'body-base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
