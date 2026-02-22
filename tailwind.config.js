/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#F4FBF9',
                    100: '#E2F5EE',
                    200: '#A7F3D0', // Light emerald
                    300: '#6EE7B7', // Medium-light emerald
                    400: '#34D399', // Medium emerald
                    500: '#10B981', // Emerald
                    600: '#059669', // Deep Emerald
                    700: '#047857', // Darker emerald
                    800: '#065F46', // Very dark emerald
                    900: '#064E3B', // Darkest Forest
                },
                surface: {
                    50: '#FCFCFC', // Very light gray/white background
                    100: '#F5F5F7', // Apple-like light gray
                    200: '#E5E5EA',
                    300: '#D1D1D6',
                    400: '#A1A1A6', // Medium gray for secondary text
                    500: '#8E8E93', // Standard secondary text
                    600: '#636366', // Readable smaller text
                    700: '#48484A', // Strong secondary text
                    800: '#3A3A3C',
                    900: '#1C1C1E', // Almost black text
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
                'card': '0 2px 10px rgba(0, 0, 0, 0.02), 0 10px 30px rgba(0, 0, 0, 0.04)'
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' }
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                }
            },
            animation: {
                shimmer: 'shimmer 2.5s infinite',
                scan: 'scan 2s ease-in-out infinite alternate',
                'fade-in': 'fade-in 0.6s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'shake': 'shake 0.4s ease-in-out'
            }
        },
    },
    plugins: [],
}
