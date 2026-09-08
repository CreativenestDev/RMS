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
        brand: {
          50: 'var(--brand-50, #fff7ed)',
          100: 'var(--brand-100, #ffedd5)',
          200: 'var(--brand-200, #fed7aa)',
          500: 'var(--brand-500, #f97316)',
          600: 'var(--brand-600, #ea580c)',
          700: 'var(--brand-700, #c2410c)',
        },
        primary: {
          DEFAULT: 'var(--primary, #ea580c)',
          foreground: 'var(--primary-foreground, #ffffff)',
          hover: 'var(--primary-hover, #c2410c)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #0f172a)',
          foreground: 'var(--secondary-foreground, #ffffff)',
        }
      },
    },
  },
  plugins: [],
};
