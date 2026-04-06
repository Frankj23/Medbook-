/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#005454',
        'primary-dark': '#003a3a',
        'primary-container': '#0b6e6e',
        'primary-light': '#e0f2f2',
        amber: '#fea619',
        'amber-dark': '#855300',
        'amber-light': '#fff3dc',
        bg: '#f6fafa',
        'surface-low': '#f0f7f7',
        'surface-container': '#e8f2f2',
        'surface-high': '#dde9e9',
        'on-surface': '#1a2b2b',
        'on-muted': '#5a7272',
        'on-light': '#8fa8a8',
        danger: '#c62828',
        'danger-light': '#fff0f0',
        'danger-border': '#ef9a9a',
        'success-green': '#1a7a4a',
        'success-light': '#e8f7ef',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 84, 84, 0.07)',
        elevated: '0 12px 40px rgba(0, 84, 84, 0.10)',
        'teal-glow': '0 6px 20px rgba(0, 84, 84, 0.28)',
        'amber-glow': '0 6px 20px rgba(254, 166, 25, 0.32)',
      },
    },
  },
  plugins: [],
}
