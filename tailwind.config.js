/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        safety: {
          green: '#10B981', // Industrial pass
          amber: '#F59E0B', // Pre-alerta SST
          red: '#EF4444',   // Bloqueo de acceso
          dark: '#0B0F17',  // Rugged dark background
          card: '#131B2B',  // Industrial card surface
          border: '#1F2E47',// Industrial border
          accent: '#2563EB',// Tech navy blue
          gold: '#EAB308',  // Construction yellow
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
