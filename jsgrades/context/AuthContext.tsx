'use client';

// Allows for authentication to be tracked across components

import { onAuthStateChanged, User } from 'firebase/auth';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/Firebase';
import { useRouter } from 'next/navigation';
import { APIResponse, AuthContextType, ClientUserDetails } from '@/types';
import { Loader2 } from 'lucide-react';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<ClientUserDetails | null>(
        null
    );
    const [initializing, setInitializing] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    setUserLoggedIn(true);

                    try {
                        const res = await fetch(`/api/user/${user.uid}`);
                        const json: APIResponse<Partial<ClientUserDetails>> =
                            await res.json();

                        if (json.status === 'success' && json.data) {
                            if (!json.data.onBoarded) {
                                setUserDetails(null);
                                if (
                                    !window.location.pathname.includes(
                                        '/auth/onboarding'
                                    )
                                ) {
                                    router.push('/auth/onboarding');
                                }
                            } else {
                                setUserDetails(json.data as ClientUserDetails);
                            }
                        } else {
                            setUserDetails(null);
                            if (
                                !window.location.pathname.includes(
                                    '/auth/onboarding'
                                )
                            ) {
                                router.push('/auth/onboarding');
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching user details:', err);
                        setUserDetails(null);
                        if (
                            !window.location.pathname.includes(
                                '/auth/onboarding'
                            )
                        ) {
                            router.push('/auth/onboarding');
                        }
                    }
                } else {
                    setCurrentUser(null);
                    setUserLoggedIn(false);
                    setUserDetails(null);
                    // Only redirect to login if not already on an auth page
                    const isAuthPage =
                        window.location.pathname.startsWith('/auth') ||
                        window.location.pathname === '/';
                    if (!isAuthPage) {
                        router.push('/');
                    }
                }
            } finally {
                setLoading(false);
                setInitializing(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Don't render anything during initial auth check
    if (initializing) {
        return (
            <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-center'>
                <Loader2 className='mb-5 h-12 w-12 animate-spin text-accent' />
                <p className='text-lg font-medium'>
                    Checking authentication...
                </p>
                <p className='mt-2 text-sm text-muted-foreground'>
                    Please wait while we verify your login status
                </p>
            </div>
        );
    }

    const value = {
        currentUser,
        userLoggedIn,
        loading,
        userDetails,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-center'>
                    <Loader2 className='mb-5 h-12 w-12 animate-spin text-accent' />
                    <p className='text-lg font-medium'>
                        Loading your profile...
                    </p>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Fetching user details and preferences
                    </p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
