'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AddQualification from '@/components/AddQualification';
import { APIResponse, Qualification } from '@/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function QualificationsPage() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [sortBy, setSortBy] = useState('name');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userDetails = auth?.userDetails;
    const userId = userDetails?.id;

    useEffect(() => {
        let mounted = true;

        async function fetchQualifications() {
            if (!userId || !auth?.currentUser) return;
            setLoading(true);
            try {
                const token = await auth.currentUser.getIdToken();
                const res = await fetch(
                    `/api/qualifications?userId=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const json: APIResponse<Qualification[]> = await res.json();

                if (json.status === 'success' && json.data && mounted) {
                    setQualifications(json.data);
                } else {
                    console.error(json.message);
                }
            } catch (error) {
                console.error('Failed to fetch qualifications', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchQualifications().catch((error) => {
            console.error('Failed to fetch qualifications:', error);
            if (mounted) {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
        };
    }, [userId, auth?.currentUser]);

    const handleAddQualification = async (newQual: Partial<Qualification>) => {
        if (!userId || !auth?.currentUser) return;
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken();
            const res = await fetch('/api/qualifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
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

    // Filtering and sorting
    const filteredQualifications = useMemo(() => {
        return qualifications
            .filter((q) => {
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return (
                        q.name.toLowerCase().includes(query) ||
                        q.institution.toLowerCase().includes(query)
                    );
                }

                const now = new Date();

                const startDate = q.startDate ? new Date(q.startDate) : null;
                const endDate = q.endDate ? new Date(q.endDate) : null;

                switch (filterStatus) {
                    case 'current':
                        return (
                            startDate &&
                            startDate <= now &&
                            (!endDate || endDate >= now)
                        );
                    case 'completed':
                        return endDate && endDate < now;
                    case 'upcoming':
                        return startDate && startDate > now;
                    default:
                        return true;
                }
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'institution':
                        return a.institution.localeCompare(b.institution);
                    case 'startDate':
                        // Safe date comparison, handling undefined/null cases
                        if (!a.startDate) return 1; // Move items without start date to end
                        if (!b.startDate) return -1; // Move items without start date to end
                        return (
                            new Date(a.startDate).getTime() -
                            new Date(b.startDate).getTime()
                        );
                    case 'endDate':
                        if (!a.endDate) return 1; // Move items without end date to end
                        if (!b.endDate) return -1; // Move items without end date to end
                        return (
                            new Date(a.endDate).getTime() -
                            new Date(b.endDate).getTime()
                        );
                    default:
                        return 0;
                }
            });
    }, [qualifications, sortBy, filterStatus, searchQuery]);

    if (!auth?.userDetails) {
        return null;
    }

    return (
        <>
            <div className='min-h-screen w-full pb-8'>
                {/* Backdrop blur overlay - positioned below header */}
                <div className='absolute inset-0 top-12 bg-background/80 backdrop-blur-sm' />

                <div className='relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
                    {/* Header Card */}
                    <div className='mb-6 w-full rounded-xl bg-card'>
                        <div className='flex flex-col space-y-6 p-6'>
                            <div className='flex flex-col items-start space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0'>
                                <h1 className='text-3xl font-bold tracking-tight'>
                                    My Qualifications
                                </h1>
                                <Button
                                    variant='outline'
                                    size='lg'
                                    onClick={() => setOpen(true)}
                                    disabled={open}
                                    className='w-full md:w-auto'
                                >
                                    Add Qualification
                                </Button>
                            </div>

                            {/* Filter Controls */}
                            {qualifications.length > 0 && (
                                <div className='grid w-full gap-4 md:grid-cols-[160px_160px_1fr]'>
                                    <Select
                                        onValueChange={setSortBy}
                                        defaultValue='name'
                                    >
                                        <SelectTrigger className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                                            <SelectValue placeholder='Sort by' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='name'>
                                                Sort by Name
                                            </SelectItem>
                                            <SelectItem value='institution'>
                                                Sort by Institution
                                            </SelectItem>
                                            <SelectItem value='startDate'>
                                                Sort by Start Date
                                            </SelectItem>
                                            <SelectItem value='endDate'>
                                                Sort by End Date
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        onValueChange={setFilterStatus}
                                        defaultValue='all'
                                    >
                                        <SelectTrigger className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                                            <SelectValue placeholder='Filter by status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All Qualifications
                                            </SelectItem>
                                            <SelectItem value='current'>
                                                Current
                                            </SelectItem>
                                            <SelectItem value='completed'>
                                                Completed
                                            </SelectItem>
                                            <SelectItem value='upcoming'>
                                                Upcoming
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type='text'
                                        placeholder='Search qualifications...'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className='rounded-xl bg-muted/30 p-6'>
                        {/* Loading Spinner */}
                        {loading && (
                            <div className='flex justify-center py-12'>
                                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && qualifications.length === 0 && (
                            <div className='flex justify-center py-12'>
                                <p className='text-muted-foreground'>
                                    No qualifications added yet.
                                </p>
                            </div>
                        )}

                        {/* Qualifications Grid */}
                        {!loading && filteredQualifications.length > 0 && (
                            <div className='flex flex-wrap gap-6'>
                                {filteredQualifications.map((q) => (
                                    <Card
                                        key={q.id}
                                        className='flex w-[300px] flex-col rounded-xl border shadow-sm transition hover:shadow-md'
                                    >
                                        <CardHeader>
                                            <div className='flex items-center justify-between'>
                                                <CardTitle className='text-base font-semibold text-foreground'>
                                                    {q.name}
                                                </CardTitle>
                                            </div>
                                            <CardDescription className='text-sm text-muted-foreground'>
                                                {q.institution}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='grid flex-grow gap-4 text-sm text-muted-foreground'>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <p className='text-xs font-medium text-muted-foreground'>
                                                        Predicted
                                                    </p>
                                                    <p className='text-foreground'>
                                                        {q.predictedGrade ??
                                                            '—'}
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
                    </div>

                    {/* Modal */}
                    <AddQualification
                        open={open}
                        onCloseAction={() => setOpen(false)}
                        onSaveAction={handleAddQualification}
                    />
                </div>
            </div>
        </>
    );
}
