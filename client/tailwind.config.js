/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // এটি থিম টগলের জন্য বাধ্যতামূলক
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-bangla)', 'sans-serif'],
        bangla: ['var(--font-bangla)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}