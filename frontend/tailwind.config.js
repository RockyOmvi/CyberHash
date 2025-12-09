/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 120s linear infinite',
                'spin-reverse-slow': 'spin-reverse 60s linear infinite',
                'radar-scan': 'radar-scan 8s linear infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'flow': 'flow 20s linear infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                'radar-scan': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                },
                'flow': {
                    to: { strokeDashoffset: '-1000' },
                }
            },
            backgroundImage: {
                'radar-sweep': 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, transparent 200deg, rgba(6, 182, 212, 0.05) 240deg, rgba(6, 182, 212, 0.4) 360deg)',
            }
        },
    },
    plugins: [],
}
