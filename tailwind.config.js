/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "yellow": "#EDF042",
        'modal-black': 'rgba(0,0,0,0.4)',
        "border-ash": "#959696",
      } 
    },
  },
  plugins: [],
}

