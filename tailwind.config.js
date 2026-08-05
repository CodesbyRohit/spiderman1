/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#050508',
        carbon: '#0a0a10',
        panel: '#0e0e16',
        crimson: '#dc143c',
        ember: '#ff3b3b',
        electric: '#2f6bff',
        violet: '#7b2ff7',
        frost: '#f5f5f7',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 14s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, filter: 'blur(0px)' },
          '50%': { opacity: 1, filter: 'blur(1px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        emberGlow: '0 0 24px rgba(255,59,59,0.35)',
        electricGlow: '0 0 24px rgba(47,107,255,0.35)',
      },
    },
  },
  plugins: [],
}
