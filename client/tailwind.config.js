module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/flowbite-react/**/*.js',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#602bf8'
        },
        secondary: {
          DEFAULT: '#5121d9'
        }
      }
    },
  },
  plugins: [],
};
