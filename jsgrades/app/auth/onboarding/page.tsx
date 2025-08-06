'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QualificationDropdown } from '@/components/QualificationDropdown';
import { Logo } from '@/components/ui/UI';
import { useAuth } from '@/context/AuthContext';

const Onboarding = () => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        qualificationlevel: 0,
    });

    // Controls progression through form, needs further implementation later
    const [isValidating, setIsValidating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isOnboarded, setIsOnboarded] = useState(false);

    const auth = useAuth();
    const currentUser = auth?.currentUser;

    const router = useRouter();

    // Pulls available data from the currentUser obtained from Firebase for improved UX
    useEffect(() => {
        if (currentUser) {
            setForm((prev) => ({
                ...prev,
                email: currentUser.email || '',
                firstName: currentUser.displayName
                    ? currentUser.displayName.split(' ')[0]
                    : '',
                lastName: currentUser.displayName
                    ? currentUser.displayName.split(' ').slice(1).join(' ')
                    : '',
            }));
        }
    }, [currentUser]);

    useEffect(() => {
        if (isOnboarded) {
            router.push('/home');
        }
    }, [isOnboarded, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        setErrorMessage('');
        setStep(step + 1);
    };

    if (!currentUser) {
        router.push('/');
        return;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);
        setErrorMessage('');

        try {
            const res = await fetch(`/api/user/${currentUser.uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: currentUser?.uid,
                    email: form.email,
                    first_name: form.firstName,
                    last_name: form.lastName,
                    date_of_birth: form.dateOfBirth,
                    highest_qual_level: form.qualificationlevel,
                    onBoarded: true,
                }),
            });

            if (!res.ok) {
                setErrorMessage(
                    'Failed to save additional profile information. Please try again.'
                );
            } else {
                setIsOnboarded(true);
            }
        } catch (err) {
            setErrorMessage(`Failed to complete onboarding: ${err}`);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <>
            <main className='flex h-screen w-full place-content-center place-items-center self-center'>
                <div className='align-center absolute top-[50px] left-[50px] flex justify-center'>
                    <Logo height={75} />
                </div>

                <div className='w-96 space-y-5 rounded-xl border bg-white p-4 text-gray-600 shadow-xl'>
                    <div className='mb-6 text-center'>
                        <div className='mt-2'>
                            <h3 className='text-xl font-semibold text-gray-800 sm:text-2xl'>
                                Account Setup
                            </h3>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {step === 0 && (
                            <p className='mb-4 text-center'>
                                Let&apos;s finish setting up your account.
                            </p>
                        )}
                        {step === 1 && (
                            <>
                                <div>
                                    <label className='text-sm font-bold text-gray-600'>
                                        First Name
                                    </label>
                                    <input
                                        name='firstName'
                                        type='text'
                                        autoComplete='First Name'
                                        required
                                        value={form.firstName}
                                        onChange={handleChange}
                                        className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm transition duration-300 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-bold text-gray-600'>
                                        Last Name
                                    </label>
                                    <input
                                        name='lastName'
                                        type='text'
                                        autoComplete='Last Name'
                                        required
                                        value={form.lastName}
                                        onChange={handleChange}
                                        className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm transition duration-300 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='text-sm font-bold text-gray-600'>
                                        Email
                                    </label>
                                    <input
                                        name='email'
                                        type='text'
                                        autoComplete='Email'
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`focus:indigo-600 mt-2 w-full rounded-lg border px-3 py-2 text-gray-500 shadow-sm transition duration-300 outline-none ${
                                            currentUser?.email
                                                ? 'bg-gray-100'
                                                : 'bg-white'
                                        }`}
                                        readOnly={!!currentUser?.email}
                                    />
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div>
                                    <label className='text-sm font-bold text-gray-600'>
                                        Date of Birth
                                    </label>
                                    <input
                                        name='dateOfBirth'
                                        type='date'
                                        required
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                        className='focus:indigo-600 mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-gray-500 shadow-sm transition duration-300 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-bold text-gray-600'>
                                        Highest Education Level
                                    </label>
                                    <QualificationDropdown
                                        value={form.qualificationlevel}
                                        onChange={(val: number) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                qualificationlevel: val,
                                            }))
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {errorMessage && (
                            <p className='mb-4 text-center font-bold text-red-600'>
                                {errorMessage}
                            </p>
                        )}
                        <button
                            type={step === 2 ? 'submit' : 'button'}
                            onClick={step === 2 ? undefined : handleNext}
                            disabled={isValidating}
                            className={`w-full rounded-lg px-4 py-2 font-medium text-white ${isValidating ? 'cursor-not-allowed bg-gray-300' : 'bg-indigo-600 transition duration-300 hover:bg-indigo-700 hover:shadow-xl'}`}
                        >
                            {isValidating
                                ? 'Loading...'
                                : step === 2
                                  ? 'Submit'
                                  : step === 0
                                    ? 'Begin'
                                    : 'Next'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Onboarding;
