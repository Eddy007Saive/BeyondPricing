/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Couleurs principales de votre charte
        'bleu-neon': '#00CFFF',
        'violet-plasma': '#A63DFF',
        'bleu-fonce': '#0B1030',
        'noir-absolu': '#000000',
        'blanc-pur': '#FFFFFF',
        
        // Variantes pour plus de flexibilité
        primary: {
          50: '#E6F9FF',
          100: '#CCF2FF',
          200: '#99E6FF',
          300: '#66D9FF',
          400: '#33CCFF',
          500: '#00CFFF', // Bleu Neon principal
          600: '#00A6CC',
          700: '#007D99',
          800: '#005366',
          900: '#002A33',
        },
        secondary: {
          50: '#F3E8FF',
          100: '#E7D1FF',
          200: '#CFA3FF',
          300: '#B775FF',
          400: '#9F47FF',
          500: '#A63DFF', // Violet Plasma principal
          600: '#8531CC',
          700: '#642599',
          800: '#421966',
          900: '#210C33',
        },
        background: {
          'dark-left': '#0B1030',  // Bleu Foncé
          'dark-right': '#000000', // Noir Absolu
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #00CFFF, #A63DFF)',
        'gradient-primary-vertical': 'linear-gradient(to bottom, #00CFFF, #A63DFF)',
        'gradient-background': 'linear-gradient(to right, #0B1030, #000000)',
      },
      fontFamily: {
        // Ajoutez vos polices personnalisées si nécessaire
      },
      animation: {
        // Animations personnalisées pour l'effet néon
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': {
            textShadow: '0 0 20px #00CFFF, 0 0 30px #00CFFF, 0 0 40px #00CFFF',
          },
          'to': {
            textShadow: '0 0 20px #A63DFF, 0 0 30px #A63DFF, 0 0 40px #A63DFF',
          }
        }
      },
      boxShadow: {
        'neon-blue': '0 0 20px #00CFFF, 0 0 40px #00CFFF, 0 0 60px #00CFFF',
        'neon-violet': '0 0 20px #A63DFF, 0 0 40px #A63DFF, 0 0 60px #A63DFF',
        'neon-gradient': '0 0 20px #00CFFF, 0 0 40px #A63DFF',
      }
    },
  },
  plugins: [],
});