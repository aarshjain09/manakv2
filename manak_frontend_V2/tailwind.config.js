/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        sidebar: "#0F172A",
        background: "#F8FAFC",
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};