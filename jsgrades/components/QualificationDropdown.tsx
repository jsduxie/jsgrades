'use client';

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/shadcn/DropdownMenu';

type QualificationLevel = {
    value: number;
    label: string;
};

const educationLevels: QualificationLevel[] = [
    { value: 2, label: 'GCSE' },
    { value: 3, label: 'A-Level' },
    { value: 6, label: 'Undergraduate' },
    { value: 7, label: 'Postgraduate' },
    { value: 0, label: 'Not Applicable' },
];

interface QualificationDropdownProps {
    value: number;
    onChange: (value: number) => void;
}

// Reusable component to display dropdown to select qualifications level and store as int based on level
// numbers are based on standard qualifications levels in UK
export function QualificationDropdown({
    value,
    onChange,
}: QualificationDropdownProps) {
    const selected = educationLevels.find((lvl) => lvl.value === value);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <button
                    type='button'
                    className='mt-2 flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-gray-700 shadow-sm transition duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                >
                    {selected ? selected.label : 'Select level...'}
                    <svg
                        className='ml-2 h-4 w-4 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={2}
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M19 9l-7 7-7-7'
                        />
                    </svg>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='mt-2 min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-gray-200 bg-white shadow-lg'>
                {educationLevels.map((level) => (
                    <DropdownMenuItem
                        key={level.value}
                        onSelect={() => onChange(level.value)}
                        className={
                            value === level.value
                                ? 'bg-indigo-100 font-bold'
                                : ''
                        }
                    >
                        {level.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
