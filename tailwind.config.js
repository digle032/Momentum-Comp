/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FDF8F5',
        panel:      'rgba(252, 244, 239, 0.85)',
        umber:      '#4A2E26',
        accent:     '#D1603D',
        'accent-hover': '#B84E2C',
        border:     'rgba(74, 46, 38, 0.12)',
      },
      fontFamily: {
        sans:   ['Inter', 'sans-serif'],
        serif:  ['"Playfair Display"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      backdropBlur: {
        panel: '16px',
      },
      boxShadow: {
        ios:    '0 2px 8px rgba(74,46,38,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        'ios-pressed': '0 1px 3px rgba(74,46,38,0.15), inset 0 2px 4px rgba(0,0,0,0.08)',
        soft:   '0 1px 4px rgba(74,46,38,0.08)',
        medium: '0 4px 16px rgba(74,46,38,0.12)',
        glass:  '0 2px 20px rgba(74,46,38,0.08)',
      },
    },
  },
  plugins: [],
}
