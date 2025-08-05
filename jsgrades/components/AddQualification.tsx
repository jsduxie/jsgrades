'use client';

import React, { useState, useEffect } from 'react';
import AddQualification from '@/components/AddQualification';
import { Qualification, APIResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useProtectedRoute } from '@/app/hooks/useProtectedHook';
import { doSignOut } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';

export default function QualificationsPage() {
    const auth = useAuth();
    const router = useRouter();
    const protectedRouter = useProtectedRoute();
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);

    if (!auth?.userDetails) {
        return null;
    }

    const userDetails = auth?.userDetails;
    const userId = userDetails.id;

    useEffect(() => {
        async function fetchQualifications() {
            if (!userId) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/qualifications?userId=${userId}`);
                const json: APIResponse<Qualification[]> = await res.json();
                if (json.status === 'success' && json.data) {
                    setQualifications(json.data);
                } else {
                    console.error(json.message);
                }
            } catch (error) {
                console.error('Failed to fetch qualifications', error);
            } finally {
                setLoading(false);
            }
        }
        fetchQualifications();
    }, [userId]);

    const handleAddQualification = async (newQual: Partial<Qualification>) => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await fetch('/api/qualifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newQual, userId }),
            });
            const json: APIResponse<Qualification> = await res.json();
            if (json.status === 'success' && json.data) {
                setQualifications((prev) => [...prev, json.data!]);
            } else {
                console.error(json.message);
            }
        } catch (error) {
            console.error('Failed to add qualification', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await doSignOut();
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Navbar
                user={userDetails}
                onSignOut={signOut}
                onProfileSettings={() =>
                    protectedRouter.push('/profile-settings')
                }
            />
            <div className='min-h-screen w-full pt-[100px] pb-8 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto'>
                {/* Header with spacing */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
                    <h1 className='text-3xl font-bold'>My Qualifications2</h1>
                    <Button onClick={() => setOpen(true)}>Add Qualification</Button>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className='flex justify-center py-10'>
                        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                    </div>
                )}

                {/* Empty State */}
                {!loading && qualifications.length === 0 && (
                    <p className='text-muted-foreground text-center'>
                        No qualifications added yet.
                    </p>
                )}

                {/* Qualifications Grid */}
                {!loading && qualifications.length > 0 && (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {qualifications.map((q) => (
                            <Card
                                key={q.id}
                                className='bg-muted rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col'
                            >
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-lg font-semibold text-foreground'>
                                        {q.name}
                                    </CardTitle>
                                    <CardDescription className='text-muted-foreground text-sm'>
                                        {q.level} &bull; {q.institution}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex-grow text-muted-foreground text-sm'>
                                    <div className='grid grid-cols-2 gap-6'>
                                        <div>
                                            <p className='text-xs font-medium text-muted-foreground'>
                                                Predicted
                                            </p>
                                            <p className='text-foreground'>
                                                {q.predictedGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-medium text-muted-foreground'>
                                                Target
                                            </p>
                                            <p className='text-foreground'>
                                                {q.targetGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-medium text-muted-foreground'>
                                                Current
                                            </p>
                                            <p className='text-foreground'>
                                                {q.currentGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-medium text-muted-foreground'>
                                                Dates
                                            </p>
                                            <p className='text-foreground'>
                                                {q.startDate
                                                    ? new Date(q.startDate).toLocaleDateString()
                                                    : '—'}{' '}
                                                –{' '}
                                                {q.endDate
                                                    ? new Date(q.endDate).toLocaleDateString()
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Button to route to qualification detail */}
                                <CardFooter className='pt-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            router.push(`/qualifications/${q.id}`)
                                        }
                                        className='w-full'
                                    >
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <AddQualification
                    open={open}
                    onClose={() => setOpen(false)}
                    onSave={handleAddQualification}
                />
            </div>
        </>
    );
}
