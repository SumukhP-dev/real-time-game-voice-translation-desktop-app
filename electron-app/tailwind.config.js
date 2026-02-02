/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./react-frontend/index.html",
    "./react-frontend/**/*.{js,ts,jsx,tsx}",
    "./react-frontend/components/**/*.{js,ts,jsx,tsx}",
    "./react-frontend/hooks/**/*.{js,ts,jsx,tsx}",
    "./react-frontend/services/**/*.{js,ts,jsx,tsx}",
    "./react-frontend/i18n/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
