/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="night"]'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        rule: 'var(--rule)',
        dot: 'var(--dot)',
        tomato: 'var(--tomato)',
        'tomato-ink': 'var(--tomato-ink)',
        green: 'var(--green)',
        blue: 'var(--blue)',
        marker: 'var(--marker)',
        sticky: 'var(--sticky)',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        caveat: ['Caveat', 'cursive'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      screens: {
        'lg-custom': '1060px',
        'md-custom': '860px',
      },
    },
  },
  plugins: [],
};
