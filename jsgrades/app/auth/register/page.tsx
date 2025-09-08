'use client';

// Register page - allows user to create an account

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/context/AuthContext';
import { doCreateUserWithEmailAndPassword } from '@/lib/client-auth';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const auth = useAuth();
    const userLoggedIn = auth?.userLoggedIn;
    const router = useRouter();

    useEffect(() => {
        if (userLoggedIn) {
            router.push('/auth/onboarding');
        }
    }, [userLoggedIn, router]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            if (password !== confirmPassword) {
                setErrorMessage('Passwords must match.');
                setIsRegistering(false);
                return;
            }

            try {
                await doCreateUserWithEmailAndPassword(email, password);
                router.push('/auth/onboarding');
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setErrorMessage(err.message || 'Failed to create account.');
                } else {
                    setErrorMessage('Failed to create account.');
                }
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            <main className='flex h-screen w-full place-content-center place-items-center self-center'>
                <div className='align-center absolute left-[50px] top-[50px] flex justify-center'>
                    <Logo height={75} />
                </div>

                <div className='w-96 space-y-5 rounded-xl border bg-white p-4 text-gray-600 shadow-xl'>
                    <div className='mb-6 text-center'>
                        <div className='mt-2'>
                            <h3 className='text-xl font-semibold text-gray-800 sm:text-2xl'>
                                Create Your Account
                            </h3>
                            <p className='text-gray-600'>
                                Join JSGrades to manage your academic journey
                            </p>
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
                                className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm outline-none transition duration-300'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-bold text-gray-600'>
                                Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type='password'
                                autoComplete='new-password'
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm outline-none transition duration-300'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-bold text-gray-600'>
                                Confirm Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type='password'
                                autoComplete='off'
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setconfirmPassword(e.target.value);
                                }}
                                className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm outline-none transition duration-300'
                            />
                        </div>

                        {errorMessage && (
                            <span className='font-bold text-red-600'>
                                {errorMessage}
                            </span>
                        )}

                        <button
                            type='submit'
                            disabled={isRegistering}
                            className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                                isRegistering
                                    ? 'cursor-not-allowed bg-gray-300'
                                    : 'bg-indigo-600 transition duration-300 hover:bg-indigo-700 hover:shadow-xl'
                            }`}
                        >
                            {isRegistering
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </button>
                    </form>
                    <p className='text-center text-sm'>
                        Already have an account?{' '}
                        <Link
                            href='/auth/login'
                            className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
};

export default function RegisterPage() {
    return <Register />;
}
