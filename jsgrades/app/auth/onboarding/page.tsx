'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const auth = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        institution: '',
    });

    React.useEffect(() => {
        if (auth?.userDetails?.onBoarded) {
            router.push('/home');
        }
    }, [auth?.userDetails, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.currentUser) return;

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('/api/user/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                }),
            });

            if (response.ok) {
                router.push('/home');
            } else {
                console.error('Onboarding failed');
            }
        } catch (error) {
            console.error('Error during onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    if (auth?.loading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div className='text-center'>
                    <Loader2 className='mb-4 h-12 w-12 animate-spin text-accent' />
                    <p className='text-lg font-medium'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-background px-4'>
            <div className='w-full max-w-md space-y-8'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        Welcome to JSGrades
                    </h2>
                    <p className='mt-2 text-muted-foreground'>
                        Let&apos;s get your profile set up
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='firstName'
                                className='mb-2 block text-sm font-medium'
                            >
                                First Name
                            </label>
                            <input
                                id='firstName'
                                name='firstName'
                                type='text'
                                required
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className='w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
                                placeholder='Enter your first name'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='lastName'
                                className='mb-2 block text-sm font-medium'
                            >
                                Last Name
                            </label>
                            <input
                                id='lastName'
                                name='lastName'
                                type='text'
                                required
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className='w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
                                placeholder='Enter your last name'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='dateOfBirth'
                                className='mb-2 block text-sm font-medium'
                            >
                                Date of Birth
                            </label>
                            <input
                                id='dateOfBirth'
                                name='dateOfBirth'
                                type='date'
                                required
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className='w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='institution'
                                className='mb-2 block text-sm font-medium'
                            >
                                Institution
                            </label>
                            <input
                                id='institution'
                                name='institution'
                                type='text'
                                required
                                value={formData.institution}
                                onChange={handleInputChange}
                                className='w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring'
                                placeholder='Enter your school/university'
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {loading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Setting up your account...
                            </>
                        ) : (
                            'Complete Setup'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
