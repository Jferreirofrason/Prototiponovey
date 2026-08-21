import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Novey brand (from official manual: Pantone 2935 C)
        novey: {
          blue: '#0055B8',
          'blue-dark': '#003DA5',
          navy: '#002F6C',
          'blue-bg': '#EFF6FF',
          'blue-light': '#DBEAFE',
          'blue-pale': '#E8F4F8',
          red: '#EC1C24',
          'red-dark': '#C8102E',
        },
        text: {
          primary: '#201D18',
          ink: '#121212',
          secondary: '#4A5565',
          tertiary: '#717171',
          disabled: '#99A1AF',
        },
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          soft: '#D0D0D0',
        },
        feedback: {
          'success-dark': '#085E36',
          'success-bg': '#ECFDF5',
          'error-dark': '#CC0008',
          'error-bg': '#FFF0F0',
          'warning-dark': '#C86D04',
          'warning-bg': '#FEF3E2',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        noto: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        novey: '6px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(0, 61, 165, 0.12)',
      },
      maxWidth: {
        page: '1276px',
      },
    },
  },
  plugins: [],
};

export default config;
