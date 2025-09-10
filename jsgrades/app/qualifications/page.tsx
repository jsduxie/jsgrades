'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import QualificationOverview from '@/components/qualifications/QualificationOverview';
import QualificationSummary from '@/components/qualifications/QualificationSummary';
import { useQualification } from '@/context/QualificationContext';

export default function QualificationsPage() {
    const auth = useAuth();
    const {
        currentQualificationId,
        currentNodeId,
        loading,
        qualifications,
        setCurrentQualification,
    } = useQualification();

    useEffect(() => {
        if (currentQualificationId && qualifications.length > 0) {
            const qualificationExists = qualifications.some(
                (q) => q.id === currentQualificationId
            );
            if (!qualificationExists) {
                setCurrentQualification('');
            }
        }
    }, [qualifications, currentQualificationId, setCurrentQualification]);

    const getPageState = () => {
        if (!currentQualificationId) {
            return 'OVERVIEW';
        } else if (currentQualificationId && !currentNodeId) {
            return 'QUALIFICATION_SUMMARY';
        } else {
            return 'NODE_SUMMARY';
        }
    };

    const pageState = getPageState();

    const handleQualificationSelect = (qualificationId: string) => {
        setCurrentQualification(qualificationId);
    };

    const handleBackToOverview = () => {
        setCurrentQualification('');
    };

    // Show loading only if auth is still loading or if we don't have user details yet
    if (auth?.loading || !auth?.userDetails) {
        return (
            <div className='flex h-full items-center justify-center py-8'>
                <div className='text-center'>
                    <Loader2 className='mb-3 h-6 w-6 animate-spin text-muted-foreground' />
                    <p className='text-base font-medium'>
                        Loading qualifications...
                    </p>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        Preparing your academic data
                    </p>
                </div>
            </div>
        );
    }

    // Show loading for qualification data
    if (loading) {
        return (
            <div className='flex h-full flex-col items-center justify-center py-8 text-center'>
                <Loader2 className='mb-5 h-6 w-6 animate-spin text-muted-foreground' />
                <p className='text-base font-medium'>
                    Loading qualifications...
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                    Fetching your courses and progress
                </p>
            </div>
        );
    }

    switch (pageState) {
        case 'OVERVIEW':
            return (
                <QualificationOverview
                    onQualificationSelect={handleQualificationSelect}
                />
            );

        case 'QUALIFICATION_SUMMARY':
            return (
                <QualificationSummary onBackToOverview={handleBackToOverview} />
            );

        case 'NODE_SUMMARY':
            // TODO: Create NodeSummary component
            return (
                <div className='p-6'>
                    <h1>Node Summary for {currentNodeId}</h1>
                    <p>This will show node details and children</p>
                </div>
            );

        default:
            return (
                <QualificationOverview
                    onQualificationSelect={handleQualificationSelect}
                />
            );
    }
}
