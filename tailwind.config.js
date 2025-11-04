/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Mono', 'monospace'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        'off-white': '#F8F8F8',
        'off-black': '#1A1A1A',
        'light-gray': '#CCCCCC',
        'accent-black': '#000000',
        'destructive-red': '#FF0000',
        'brutal-gray': '#222222',
        'accent-yellow': '#FFFF00',
      },
      boxShadow: {
        'brutalist': '4px 4px 0px rgba(0,0,0,1)',
        'brutalist-up': '-2px -2px 0px rgba(0,0,0,1)',
        'brutalist-dark': '4px 4px 0px #F8F8F8',
      },
      borderWidth: {
        '5': '5px',
      },
      textDecorationThickness: {
        '4': '4px',
        '6': '6px',
      },
      underlineOffset: {
        '4': '4px',
        '8': '8px',
        '10': '10px',
      },
    }
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
