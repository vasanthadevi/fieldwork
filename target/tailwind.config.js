/** @type {import('tailwindcss').Config} */
// Dark-mode tokens from the validated data-viz palette (surfaces, ink, grid,
// and the categorical series hues). Blue #3987e5 is series slot 1.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        plane: '#0d0d0d',
        surface: '#1a1a19',
        surface2: '#232322',
        ink: '#ffffff',
        ink2: '#c3c2b7',
        muted: '#898781',
        grid: '#2c2c2a',
        axis: '#383835',
        accent: {
          DEFAULT: '#3987e5',
          hover: '#5598e7',
          soft: 'rgba(57,135,229,0.12)',
        },
      },
      borderColor: {
        hair: 'rgba(255,255,255,0.10)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        rise: 'rise .5s cubic-bezier(.22,.61,.36,1) both',
      },
    },
  },
  plugins: [],
}
