'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Logo } from './ui/UI';

// Material UI Icons - we'll use simple SVG replacements for now
const HomeIcon = () => (
    <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
    </svg>
);

const SchoolIcon = () => (
    <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
    </svg>
);

const AssignmentIcon = () => (
    <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
        <path
            fillRule='evenodd'
            d='M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z'
            clipRule='evenodd'
        />
    </svg>
);

const ShowChartIcon = () => (
    <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
    </svg>
);

const SettingsIcon = () => (
    <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
        <path
            fillRule='evenodd'
            d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
            clipRule='evenodd'
        />
    </svg>
);

type SidebarLinkProps = {
    page: string;
    label: string;
    icon: React.ReactNode;
    open: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
    page,
    label,
    icon,
    open,
}) => {
    const pathname = usePathname();
    const isActive = pathname === page;

    return (
        <Link
            href={page}
            className={clsx(
                'flex items-center rounded px-4 py-2 transition-colors',
                'h-[75px] justify-start',
                isActive
                    ? 'bg-secondary text-white'
                    : 'hover:bg-secondary text-gray-700'
            )}
        >
            <span className='flex w-10 min-w-[40px] items-center justify-center'>
                {icon}
            </span>
            <span
                className={clsx(
                    'ml-3 font-medium whitespace-nowrap text-white transition-all duration-200',
                    open
                        ? 'ml-3 w-auto opacity-100'
                        : 'ml-0 w-0 overflow-hidden opacity-0'
                )}
            >
                {label}
            </span>
        </Link>
    );
};

export const Sidebar: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <aside
            className={clsx(
                'bg-primary shadow-light-1 shadow-light-2 fixed z-10 flex h-screen flex-col border-r transition-all duration-300',
                open ? 'w-[215px]' : 'w-[75px]'
            )}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div
                className={clsx(
                    'absolute top-[30px] z-10 flex w-[215px] items-center justify-center transition-opacity duration-100',
                    open ? 'opacity-1' : 'opacity-0'
                )}
            >
                <Logo height={50} fill='#fff' />
            </div>

            <nav className='mt-[150px] flex flex-col gap-8'>
                <SidebarLink
                    page='/home'
                    label='Home'
                    icon={<HomeIcon />}
                    open={open}
                />
                <SidebarLink
                    page='/grades'
                    label='Grades'
                    icon={<SchoolIcon />}
                    open={open}
                />
                <SidebarLink
                    page='/tasks'
                    label='Tasks'
                    icon={<AssignmentIcon />}
                    open={open}
                />
                <SidebarLink
                    page='/vis'
                    label='Visualise'
                    icon={<ShowChartIcon />}
                    open={open}
                />
            </nav>
            <div className='absolute bottom-[75px] left-0 w-full'>
                <SidebarLink
                    page='/settings'
                    label='Settings'
                    icon={<SettingsIcon />}
                    open={open}
                />
            </div>
        </aside>
    );
};
