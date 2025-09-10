'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import QualificationOverview from '@/components/qualifications/QualificationOverview';
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

    if (auth?.loading) {
        return (
            <div className='flex h-full items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
        );
    }

    if (!auth?.userDetails) {
        return null;
    }

    if (loading) {
        return (
            <div className='flex h-full items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
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
            // TODO: Create QualificationSummary component
            return (
                <div className='p-6'>
                    <h1>Qualification Summary for {currentQualificationId}</h1>
                    <p>This will show qualification details and root nodes</p>
                </div>
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
