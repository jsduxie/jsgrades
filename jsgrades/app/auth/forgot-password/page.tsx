'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { doPasswordReset } from '@/lib/client-auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRequested, setIsRequested] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const auth = useAuth();
    const userLoggedIn = auth?.userLoggedIn;

    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isRequested) {
            router.push('/auth/login');
            return;
        }

        if (!isSubmitting) {
            setIsSubmitting(true);
            try {
                await doPasswordReset(email).then(() => {
                    setIsRequested(true);
                    setIsSubmitting(false);
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setErrorMessage(
                        err.message || 'Failed to request password reset.'
                    );
                } else {
                    setErrorMessage('Failed to request password reset.');
                }
                setIsSubmitting(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && router.push('/home')}

            <main className='flex h-screen w-full place-content-center place-items-center self-center'>
                <div className='w-96 space-y-5 rounded-xl border bg-white p-4 text-gray-600 shadow-xl'>
                    <Logo />
                    <div className='mb-6 text-center'>
                        <div className='mt-2'>
                            <h3 className='text-xl font-semibold text-gray-800 sm:text-2xl'>
                                Password Reset
                            </h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className='space-y-4'>
                        <div>
                            <label className='text-sm font-bold text-gray-600'>
                                Email
                            </label>
                            <input
                                type='email'
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm transition duration-300 outline-none'
                            />
                        </div>

                        {errorMessage && (
                            <p className='mb-4 w-100 text-center font-bold text-red-600'>
                                {errorMessage}
                            </p>
                        )}

                        {isRequested && (
                            <p className='mb-4 text-center font-bold text-[#5ada86]'>
                                If an account exists with the above email
                                address, an email will be sent with a link to
                                reset your password. Sign in below.
                            </p>
                        )}

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className={`w-full rounded-lg px-4 py-2 font-medium text-white ${isSubmitting ? 'cursor-not-allowed bg-gray-300' : 'bg-indigo-600 transition duration-300 hover:bg-indigo-700 hover:shadow-xl'}`}
                        >
                            {isSubmitting
                                ? 'Requesting...'
                                : isRequested
                                  ? 'Sign In'
                                  : 'Request Password Reset'}
                        </button>
                        <div className='text-center text-sm'>
                            Remembered your password? {'   '}
                            <Link
                                href='/auth/login'
                                className='font-medium text-indigo-600 hover:text-indigo-500'
                            >
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default ForgotPassword;
