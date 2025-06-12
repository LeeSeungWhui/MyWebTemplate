/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'rgb(239 246 255)',   // blue-50
                    100: 'rgb(219 234 254)',  // blue-100
                    500: 'rgb(59 130 246)',   // blue-500
                    600: 'rgb(37 99 235)',    // blue-600
                },
                success: {
                    500: 'rgb(34 197 94)',    // green-500
                    600: 'rgb(22 163 74)',    // green-600
                },
                warning: {
                    500: 'rgb(245 158 11)',   // amber-500
                    600: 'rgb(217 119 6)',    // amber-600
                },
                danger: {
                    500: 'rgb(239 68 68)',    // red-500
                    600: 'rgb(220 38 38)',    // red-600
                }
            },
            fontFamily: {
                sans: ['Pretendard', 'system-ui', 'sans-serif'],
                serif: ['ui-serif', 'Georgia'],
                mono: ['ui-monospace', 'monospace'],
            },
            spacing: {
                base: '0.25rem',  // --spacing과 동일
            },
            borderRadius: {
                sm: '0.25rem',    // --radius-sm
                md: '0.375rem',   // --radius-md
                lg: '0.5rem',     // --radius-lg
            },
            // shadow는 RN에서는 다르게 처리해야 함
            // elevation이나 shadowProps 사용
        },
    },
    plugins: [],
};