/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [".storybook/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
