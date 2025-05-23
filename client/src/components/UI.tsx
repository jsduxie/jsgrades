import { createTheme } from 'flowbite-react';
import React from 'react';

type LogoProps = {
  height?: number;
  bg?: string;
};

export const Logo = ({ height = 30, bg = '#efefef' }: LogoProps) => {
  return (
    <img
      src="/img/logo.svg"
      alt="JSGradesLogo"
      className={`absolute top-4 left-8 h-${height} w-auto bg-[${bg}]`}
    />
  );
};

export const datePickerTheme = {
  datepicker: {
    input: {
      base: 'w-full px-3 py-2 border rounded-lg',
    },
    popup: {
      root: {
        base: 'z-50',
      },
    },
    days: {
      items: {
        item: {
          selected: 'bg-indigo-600 text-white',
          today: 'border-indigo-600',
        },
      },
    },
  },
};

export const customDropdownTheme = {
  // Keep arrowIcon and inlineWrapper from your original theme
  arrowIcon: 'ml-2 h-5 w-5 text-blue-500',
  inlineWrapper: 'flex items-center gap-1',

  floating: {
    // Merge animation settings
    animation: 'transition ease-in-out duration-200',

    arrow: {
      base: 'absolute z-20 h-3 w-3 rotate-45',
      placement: '-5px',
      style: {
        dark: 'bg-gray-800',
        light: 'bg-white',
        auto: 'bg-white dark:bg-gray-800',
      },
    },

    // Your custom base styles + docs structure
    base: 'z-50 w-56 divide-y divide-gray-200 rounded-lg shadow-lg focus:outline-none bg-gray border border-gray-200 z-10 opacity-1',

    // Preserve your text/content styling
    content: 'py-2 text-sm text-gray-800',

    // Your divider style
    divider: 'my-2 h-px bg-gray-200',

    // Your header style
    header:
      'block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600',

    item: {
      container: 'group',
      // Your item styling with docs structure
      base: 'flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-800 hover:bg-indigo-100 focus:bg-indigo-100',
      icon: 'mr-3 h-4 w-4 text-indigo-500',
    },

    // Your style configurations
    style: {
      dark: 'bg-gray-800 text-black',
      light: 'border border-gray-300 bg-black text-gray-900',
      auto: 'border border-gray-300 bg-black text-gray-900 dark:border-none dark:bg-gray-800 dark:text-white',
    },
  },
};
