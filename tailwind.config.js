/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background:          'hsl(224, 71%, 4%)',
        foreground:          'hsl(213, 31%, 91%)',
        muted:               'hsl(223, 47%, 11%)',
        'muted-foreground':  'hsl(215, 25%, 65%)',
        accent:              'hsl(173, 98%, 50%)',
        'accent-foreground': 'hsl(224, 71%, 4%)',
        border:              'hsl(216, 34%, 17%)',
        ring:                'hsl(173, 98%, 50%)',
        destructive:         'hsl(0, 63%, 31%)',
        card:                'hsl(224, 71%, 6%)',
        positive:            'hsl(110, 70%, 55%)',
      },
      fontFamily: {
        sans:   ['Inter', 'sans-serif'],
        serif:  ['"Playfair Display"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow:      '0 0 20px rgba(0, 245, 212, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 245, 212, 0.25)',
        card:      '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'spin-slow':  'spin 20s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'breathe':    'breathe 2.5s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.25' },
          '50%':      { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        panel: '20px',
      },
    },
  },
  plugins: [],
}
