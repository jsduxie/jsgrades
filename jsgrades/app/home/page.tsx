'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { doSignOut } from '@/lib/client-auth';
import { ClientUserDetails } from '../types';

export default function Home() {
    const [userDetails, setUserDetails] = useState<ClientUserDetails | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const auth = useAuth();

    const currentUser = auth?.currentUser;
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) return;

        const fetchUserDetails = async () => {
            try {
                const res = await fetch(`/api/user/${currentUser.uid}`);

                if (res.status === 404) {
                    router.push('/onboarding');
                    return;
                }

                const data = await res.json();
                setUserDetails(data);

                if (!data.onboarded && !loading) {
                    router.push('/onboarding');
                    return;
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [currentUser, router, loading]);

    if (!auth || !auth.currentUser) {
        return (
            <div className='pt-14 text-2xl font-bold'>
                Not logged in: {error}
            </div>
        );
    }

    if (userDetails) {
        return (
            <>
                <Navbar
                    user={userDetails}
                    onSignOut={doSignOut}
                    onProfileSettings={() => router.push('/profile-settings')}
                    logoSrc=''
                    logoAlt=''
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

    return null;
}
