'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { doSignOut } from '@/lib/client-auth';

export default function AddQualification() {
    const [formData, setFormData] = useState({
        qualificationName: '',
        institution: '',
        grade: '',
        year: '',
        qualificationType: 'GCSE',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const auth = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // TODO: Implement API call to save qualification
        console.log('Submitting qualification:', formData);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            router.push('/home');
        }, 1000);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (!auth?.currentUser) {
        router.push('/auth/login');
        return null;
    }

    return (
        <>
            <Navbar
                user={{
                    email: auth.currentUser.email || '',
                    displayName: auth.currentUser.displayName || 'User',
                    name: auth.currentUser.displayName || 'User',
                }}
                onSignOut={doSignOut}
                onProfileSettings={() => router.push('/profile-settings')}
                logoSrc=''
                logoAlt=''
            />
            <Sidebar />
            <main className='ml-[75px] p-8'>
                <div className='mx-auto max-w-2xl'>
                    <h1 className='mb-8 text-3xl font-bold text-gray-900'>
                        Add Qualification
                    </h1>

                    <form
                        onSubmit={handleSubmit}
                        className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
                    >
                        <div className='grid grid-cols-1 gap-6'>
                            <div>
                                <label
                                    htmlFor='qualificationType'
                                    className='mb-2 block text-sm font-medium text-gray-700'
                                >
                                    Qualification Type
                                </label>
                                <select
                                    id='qualificationType'
                                    name='qualificationType'
                                    value={formData.qualificationType}
                                    onChange={handleInputChange}
                                    className='focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
                                >
                                    <option value='GCSE'>GCSE</option>
                                    <option value='A-Level'>A-Level</option>
                                    <option value='BTec'>BTec</option>
                                    <option value='Degree'>Degree</option>
                                    <option value='Masters'>Masters</option>
                                    <option value='PhD'>PhD</option>
                                    <option value='Other'>Other</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor='qualificationName'
                                    className='mb-2 block text-sm font-medium text-gray-700'
                                >
                                    Qualification Name
                                </label>
                                <input
                                    type='text'
                                    id='qualificationName'
                                    name='qualificationName'
                                    value={formData.qualificationName}
                                    onChange={handleInputChange}
                                    placeholder='e.g., Mathematics, Computer Science'
                                    className='focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor='institution'
                                    className='mb-2 block text-sm font-medium text-gray-700'
                                >
                                    Institution
                                </label>
                                <input
                                    type='text'
                                    id='institution'
                                    name='institution'
                                    value={formData.institution}
                                    onChange={handleInputChange}
                                    placeholder='e.g., Oxford University, City College'
                                    className='focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
                                    required
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label
                                        htmlFor='grade'
                                        className='mb-2 block text-sm font-medium text-gray-700'
                                    >
                                        Grade
                                    </label>
                                    <input
                                        type='text'
                                        id='grade'
                                        name='grade'
                                        value={formData.grade}
                                        onChange={handleInputChange}
                                        placeholder='e.g., A*, First Class'
                                        className='focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor='year'
                                        className='mb-2 block text-sm font-medium text-gray-700'
                                    >
                                        Year Completed
                                    </label>
                                    <input
                                        type='number'
                                        id='year'
                                        name='year'
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        placeholder='2023'
                                        min='1900'
                                        max={new Date().getFullYear()}
                                        className='focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none'
                                        required
                                    />
                                </div>
                            </div>

                            <div className='flex gap-4 pt-4'>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='bg-primary hover:bg-secondary flex-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    {isSubmitting
                                        ? 'Adding...'
                                        : 'Add Qualification'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => router.push('/home')}
                                    className='flex-1 rounded-md bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
