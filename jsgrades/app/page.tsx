'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { userLoggedIn, loading } = useAuth() || {};
    const router = useRouter();

    useEffect(() => {
        if (!loading && userLoggedIn) {
            router.push('/home');
        }
    }, [userLoggedIn, loading, router]);

    if (loading) {
        return (
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-indigo-50 to-white'>
            <div className='container mx-auto px-4 py-16'>
                <div className='flex flex-col items-center text-center'>
                    <div className='mb-8'>
                        <Logo height={100} />
                    </div>

                    <h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl'>
                        Welcome to JSGrades
                    </h1>

                    <p className='mb-12 max-w-2xl text-xl text-gray-600'>
                        Your comprehensive academic management platform. Track
                        your progress, manage qualifications, and achieve your
                        educational goals.
                    </p>

                    <div className='flex flex-col gap-4 sm:flex-row'>
                        <Link href='/auth/register'>
                            <Button variant='default' size='lg'>
                                Get Started
                            </Button>
                        </Link>
                        <Link href='/auth/login'>
                            <Button variant='outline' size='lg'>
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
