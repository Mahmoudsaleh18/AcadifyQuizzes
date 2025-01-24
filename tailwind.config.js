/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2ECC71',
        'primary-dark': '#1EA34D',
        dark: {
          100: '#1E1E1E',
          200: '#2D2D2D',
          300: '#3D3D3D',
        }
      }
    }
  }
}
