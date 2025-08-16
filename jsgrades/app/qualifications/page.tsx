'use client';

import React, { useState, useEffect } from 'react';
import AddQualification from '@/components/AddQualification';
import { Qualification, APIResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QualificationsPage() {
    const auth = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);

    const userDetails = auth?.userDetails;
    const userId = userDetails?.id;

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

    if (!auth?.userDetails) {
        return null;
    }

    return (
        <>
            <div className='min-h-screen w-full pt-[100px] pb-8'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <h1 className='text-3xl font-bold'>My Qualifications</h1>
                    <Button onClick={() => setOpen(true)}>
                        Add Qualification
                    </Button>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className='flex justify-center'>
                        <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
                    </div>
                )}

                {/* Empty State */}
                {!loading && qualifications.length === 0 && (
                    <p className='text-muted-foreground'>
                        No qualifications added yet.
                    </p>
                )}

                {/* Qualifications Grid */}
                {!loading && qualifications.length > 0 && (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {qualifications.map((q) => (
                            <Card
                                key={q.id}
                                className='bg-muted rounded-2xl border shadow-sm transition hover:shadow-md'
                            >
                                <CardHeader>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-foreground text-base font-semibold'>
                                            {q.name}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className='text-muted-foreground text-sm'>
                                        {q.level} &bull; {q.institution}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='text-muted-foreground grid gap-4 text-sm'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <p className='text-muted-foreground text-xs font-medium'>
                                                Predicted
                                            </p>
                                            <p className='text-foreground'>
                                                {q.predictedGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-muted-foreground text-xs font-medium'>
                                                Target
                                            </p>
                                            <p className='text-foreground'>
                                                {q.targetGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-muted-foreground text-xs font-medium'>
                                                Current
                                            </p>
                                            <p className='text-foreground'>
                                                {q.currentGrade ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-muted-foreground text-xs font-medium'>
                                                Dates
                                            </p>
                                            <p className='text-foreground'>
                                                {q.startDate
                                                    ? new Date(
                                                          q.startDate
                                                      ).toLocaleDateString()
                                                    : '—'}{' '}
                                                –{' '}
                                                {q.endDate
                                                    ? new Date(
                                                          q.endDate
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
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
