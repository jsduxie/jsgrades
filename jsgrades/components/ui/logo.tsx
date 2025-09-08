import React from 'react';
import { LogoProps } from '@/types';

export const Logo = ({
    height = 30,
    fill = '#030121',
    style = '',
}: LogoProps) => {
    return (
        <svg
            width='110'
            height={height}
            viewBox='0 0 110 84'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={style}
            preserveAspectRatio='xMidYMid meet'
        >
            <g transform='translate(0, 20)'>
                <path
                    d='M20 34.44C20 35.56 19.6533 36.4667 18.96 37.16C18.2667 37.8267 17.36 38.16 16.24 38.16H14.56C13.44 38.16 12.5333 37.8267 11.84 37.16C11.1467 36.4667 10.8 35.56 10.8 34.44V26.08H14.6V34.24C14.6 34.3733 14.6667 34.44 14.8 34.44H16C16.1333 34.44 16.2 34.3733 16.2 34.24V13.72H14.6L14.92 10H20V34.44Z'
                    fill={fill}
                />
                <line y1='46' x2='45' y2='46' stroke={fill} strokeWidth='4' />
            </g>
        </svg>
    );
};
