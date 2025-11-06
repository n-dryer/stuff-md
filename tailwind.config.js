/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'off-white': '#F5F5F5',
        'off-black': '#1A1A1A',
        'accent-black': '#000000',
        'brutal-gray': '#333333',
        'accent-red': '#FF4136',
        'accent-yellow': '#FFDC00',
        'accent-green': '#2ECC40',
        'accent-blue': '#0074D9',
        'accent-orange': '#FF851B',
        'accent-purple': '#B10DC9',
        'light-gray': '#AAAAAA',
        'destructive-red': '#D32F2F',
        'success-green': '#388E3C',
      },
      fontFamily: {
        sans: ['"Inter", sans-serif'],
        mono: ['"Roboto Mono", monospace'],
      },
      borderWidth: {
        3: '3px',
        5: '5px',
        6: '6px',
      },
      boxShadow: {
        brutal: '4px 4px 0px #1A1A1A',
        'brutal-dark': '4px 4px 0px #F5F5F5',
      },
    },
  },
  plugins: [],
};
