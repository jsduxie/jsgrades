module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/flowbite-react/**/*.js',
        './node_modules/flowbite/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#602bf8',
                },
                secondary: {
                    DEFAULT: '#5121d9',
                },
                'black-text': {
                    DEFAULT: '#363636',
                },
            },
            boxShadow: {
                'light-1': '2px 2px 4px rgba(86, 114, 198, 0.25)',
                'light-2': '6px 6px 30px rgba(125, 153, 180, 0.39)',
                'dark-1': '2px 2px 4px rgba(70, 70, 70, 0.25)',
                'dark-2': '6px 6px 30px rgba(70, 70, 70, 0.39)',
            },
            animation: {
                slowSpin: 'spin 2s linear infinite',
            },
        },
    },
    plugins: [],
};
