'use client';

// Login page

import { FirebaseError } from 'firebase/app';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/context/AuthContext';
import {
    doSignInWithEmailAndPassword,
    doSignInWithGoogle,
} from '@/lib/client-auth';

const Login = () => {
    const auth = useAuth();
    const userLoggedIn = auth?.userLoggedIn;
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (userLoggedIn) {
            router.push('/home');
        }
    }, [userLoggedIn, router]);

    // When signing in using email/password details
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
                router.push('/home');
            } catch (err) {
                let msg = 'Failed to sign in.';

                if (err instanceof FirebaseError) {
                    switch (err.code) {
                        case 'auth/user-not-found':
                            msg = 'No account found with this username.';
                            break;
                        case 'auth/wrong-password':
                            msg = 'Incorrect password.';
                            break;
                        case 'auth/invalid-email':
                            msg = 'Invalid email address';
                            break;
                        case 'auth/too-many-requests':
                            msg = 'Too many attempts. Please try again later.';
                            break;
                        case 'auth/invalid-credential':
                            msg = 'Invalid login credentials.';
                            break;
                        default:
                            msg = `Sign in failed: ${err.message}`;
                    }
                }

                setErrorMessage(msg);
                setIsSigningIn(false);
            }
        }
    };

    // When signing in using Google account
    const onGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithGoogle();
                router.push('/home');
            } catch (err) {
                let msg = 'Failed to sign in with Google.';
                if (err instanceof FirebaseError) {
                    switch (err.code) {
                        case 'auth/popup-closed-by-user':
                            msg = 'Sign-in popup was closed.';
                            break;
                        case 'auth/cancelled-popup-request':
                            msg = 'Sign-in was cancelled.';
                            break;
                        default:
                            msg = `Google sign in failed: ${err.message}`;
                    }
                }
                setErrorMessage(msg);
                setIsSigningIn(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && router.push('/home')}
            <main className='flex h-screen w-full place-content-center place-items-center self-center'>
                <div className='align-center absolute left-[50px] top-[50px] flex justify-center'>
                    <Logo height={75} />
                </div>

                <div className='w-96 space-y-5 rounded-xl border bg-white p-4 text-gray-600 shadow-xl'>
                    <div className='mb-6 text-center'>
                        <div className='mt-2'>
                            <h3 className='text-xl font-semibold text-gray-800 sm:text-2xl'>
                                Welcome Back
                            </h3>
                            <p className='text-gray-600'>
                                Please sign in to access your account
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
                                disabled={isSigningIn}
                                type='password'
                                autoComplete='current-password'
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
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
                            disabled={isSigningIn}
                            className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                                isSigningIn
                                    ? 'cursor-not-allowed bg-gray-300'
                                    : 'bg-indigo-600 transition duration-300 hover:bg-indigo-700 hover:shadow-xl'
                            }`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className='text-center'>
                        <span className='text-gray-500'>or</span>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={onGoogleSignIn}
                        className={`flex w-full items-center justify-center gap-x-3 rounded-lg border py-2.5 text-sm font-medium ${
                            isSigningIn
                                ? 'cursor-not-allowed'
                                : 'transition duration-300 hover:bg-gray-100 active:bg-gray-100'
                        }`}
                    >
                        <svg
                            className='h-5 w-5'
                            viewBox='0 0 48 48'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <g clipPath='url(#clip0_17_40)'>
                                <path
                                    d='M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z'
                                    fill='#4285F4'
                                />
                                <path
                                    d='M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z'
                                    fill='#34A853'
                                />
                                <path
                                    d='M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z'
                                    fill='#FBBC04'
                                />
                                <path
                                    d='M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z'
                                    fill='#EA4335'
                                />
                            </g>
                            <defs>
                                <clipPath id='clip0_17_40'>
                                    <rect width='48' height='48' fill='white' />
                                </clipPath>
                            </defs>
                        </svg>
                        Continue with Google
                    </button>
                    <p className='text-center text-sm'>
                        Don&apos;t have an account?{' '}
                        <Link
                            href='/auth/register'
                            className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                            Sign up
                        </Link>
                    </p>
                    <div className='text-center'>
                        <Link
                            href='/auth/forgot-password'
                            className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
};

export default function LoginPage() {
    return <Login />;
}
