'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './ui/UI';
import Link from 'next/link';

interface NavbarProps {
    user: {
        name?: string;
        email: string;
        photoURL?: string;
        displayName?: string;
        first_name?: string;
        last_name?: string;
        created_at?: string;
    };
    onSignOut: () => void;
    onProfileSettings?: () => void;
    logoSrc?: string;
    logoAlt?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
    user,
    onSignOut,
    onProfileSettings,
}) => {
    const [isUserModal, setIsUserModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsUserModal(false);
            }
        }

        if (isUserModal) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isUserModal]);

    const getInitials = (firstName?: string, lastName?: string) => {
        let initials = '';

        if (firstName) {
            initials += firstName.trim()[0].toUpperCase();
        } else {
            return initials;
        }

        if (lastName) {
            initials += lastName.trim()[0].toUpperCase();
        }

        return initials;
    };

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : 'N/A';

    return (
        <>
            <header className='shadow-light-1 shadow-light-2 z-1 flex h-[75px] w-full items-center justify-between bg-[#efefef]/50 px-6 py-4 opacity-[0.5]'>
                <div className='flex items-center space-x-4'>
                    <Logo
                        height={60}
                        style='object-contain align-center mt-[25px] ml-[75px]'
                    />
                </div>

                <div className='mr-[25px] flex items-center space-x-[64px]'>
                    <Link
                        href='/home'
                        className='text-md text-gray-600 hover:text-purple-600'
                    >
                        Home
                    </Link>
                    <Link
                        href='/support'
                        className='text-md text-gray-600 hover:text-purple-600'
                    >
                        Support
                    </Link>
                    <div className='relative' ref={triggerRef}>
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt='Profile'
                                className='h-12 w-12 cursor-pointer rounded-full object-cover'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsUserModal(!isUserModal);
                                }}
                            />
                        ) : (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsUserModal(!isUserModal);
                                }}
                                className='bg-primary flex h-12 w-12 cursor-pointer items-center justify-center rounded-full font-semibold text-white select-none'
                            >
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {isUserModal && (
                <div
                    ref={modalRef}
                    className={
                        'shadow-light-1 shadow-light-2 fixed top-[100px] right-[25px] z-20 flex h-[350px] w-[300px] flex-col items-center justify-start rounded-[12px] bg-[#efefef] p-[15px] transition-opacity duration-500'
                    }
                >
                    <p className='height-[50px] mb-[25px] text-sm'>
                        {user.email}
                    </p>
                    <div className='relative mb-[25px]'>
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt='Profile'
                                className='h-24 w-24 cursor-pointer rounded-full object-cover'
                            />
                        ) : (
                            <div className='bg-primary flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-xl font-semibold text-white select-none'>
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                        )}
                    </div>
                    <p className='text-xl font-bold'>{`${user.first_name} ${user.last_name}`}</p>
                    <p className='mt-[5px] text-sm'>{`Member Since ${memberSince}`}</p>
                    <div className='mt-[20px] flex w-full justify-around'>
                        <button
                            onClick={onSignOut}
                            className='transition-300 mt-6 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
                        >
                            Sign Out
                        </button>
                        <button
                            onClick={onProfileSettings}
                            className='bg-primary hover:bg-secondary mt-6 rounded px-4 py-2 text-white'
                        >
                            Profile Settings
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
