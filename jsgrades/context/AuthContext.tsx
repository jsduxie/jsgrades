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

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
                            router.push('/auth/onboarding');
                        } else {
                            setUserDetails(json.data as ClientUserDetails);
                        }
                    } else {
                        setUserDetails(null);
                        router.push('/auth/onboarding');
                    }
                } catch (err) {
                    console.error('Error fetching user details:', err);
                    setUserDetails(null);
                    router.push('/auth/onboarding');
                }
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);
                setUserDetails(null);
                router.push('/');
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const value = {
        currentUser,
        userLoggedIn,
        loading,
        userDetails,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
