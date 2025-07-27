'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { doSignOut } from '@/lib/client-auth';

export default function Home() {
    const router = useRouter();
    const auth = useAuth();

    const userDetails = auth?.userDetails;
    const loading = auth?.loading;
    const currentUser = auth?.currentUser;

    const signOut = async () => {
        try {
            await doSignOut();
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className='pt-14 text-center text-xl font-semibold'>
                Loading...
            </div>
        );
    }

    if (!currentUser || !userDetails) {
        return (
            <div className='pt-14 text-center text-xl font-semibold'>
                Not logged in or user data missing.
            </div>
        );
    }

    return (
        <>
            <Navbar
                user={userDetails}
                onSignOut={signOut}
                onProfileSettings={() => router.push('/profile-settings')}
            />
            <Sidebar />
            <main className='ml-[75px] p-8'>
                <div className='mx-auto max-w-7xl'>
                    <h1 className='mb-8 text-3xl font-bold text-gray-900'>
                        Welcome back, {userDetails.firstName || 'User'}!
                    </h1>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
                            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                                Quick Stats
                            </h2>
                            <p className='text-gray-600'>
                                View your academic progress at a glance
                            </p>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
                            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                                Recent Grades
                            </h2>
                            <p className='text-gray-600'>
                                Check your latest assessment results
                            </p>
                        </div>

                        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
                            <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                                Upcoming Tasks
                            </h2>
                            <p className='text-gray-600'>
                                Stay on top of your assignments
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
