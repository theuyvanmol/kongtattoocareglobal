import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kong: {
          red: '#E61E32',
          lime: '#C8FF00',
          dark: '#121212',
          dark2: '#1a1a1a',
          dark3: '#0e0e0e',
        },
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-barlow-condensed)', 'system-ui', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
        'fade-up': 'fadeUp 0.85s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'none' } },
      },
    },
  },
  plugins: [],
}

export default config
