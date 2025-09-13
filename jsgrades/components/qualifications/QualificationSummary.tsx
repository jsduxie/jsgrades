import React, { useState } from 'react';
import { useQualification } from '@/context/QualificationContext';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    GraduationCap,
    Target,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import EditQualification from '@/components/qualifications/EditQualification';
import AddQualificationNode from '@/components/qualifications/AddQualificationNode';

interface QualificationSummaryProps {
    onBackToOverview: () => void;
}

export default function QualificationSummary({
    onBackToOverview,
}: QualificationSummaryProps) {
    const {
        qualifications,
        currentQualificationId,
        qualificationLevels,
        updateQualification,
        nodeHierarchy,
        loadingNodes,
        navigateToNode,
        createNode,
    } = useQualification();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddNodeModal, setShowAddNodeModal] = useState(false);

    const currentQualification = qualifications.find(
        (q) => q.id === currentQualificationId
    );

    const qualificationLevel = qualificationLevels.find(
        (level) => level.id === currentQualification?.level
    );

    const rootNodes = nodeHierarchy.filter(
        (node) =>
            !node.parentId && node.qualificationId === currentQualificationId
    );

    const StatusBadge = ({ inProgress }: { inProgress: boolean }) => {
        const isCompleted = !inProgress;

        return (
            <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    isCompleted
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                }`}
            >
                {isCompleted ? (
                    <>
                        <CheckCircle className='mr-1.5 h-3 w-3' />
                        Completed
                    </>
                ) : (
                    <>
                        <Clock className='mr-1.5 h-3 w-3' />
                        In Progress
                    </>
                )}
            </span>
        );
    };

    if (!currentQualification) {
        return (
            <div className='flex min-h-screen w-full items-center justify-center pb-8'>
                <div className='text-center'>
                    <p className='text-lg text-muted-foreground'>
                        Qualification not found
                    </p>
                    <Button onClick={onBackToOverview} className='mt-4'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Overview
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full pb-8'>
            <div className='absolute inset-0 top-12 bg-background/80 backdrop-blur-sm' />

            <div className='relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-6 flex items-center justify-between gap-4 align-middle'>
                    <div>
                        <div className='mb-1 flex items-center gap-3'>
                            <h1 className='text-3xl font-bold tracking-tight'>
                                {currentQualification.name}
                            </h1>
                        </div>
                        <p className='text-muted-foreground'>
                            {qualificationLevel?.name} •{' '}
                            {currentQualification.institution} •{' '}
                            <StatusBadge
                                inProgress={currentQualification.inProgress}
                            />
                        </p>
                    </div>
                    <Button
                        variant='outline'
                        className='mt-4'
                        onClick={() => setShowEditModal(true)}
                    >
                        Edit Qualification
                    </Button>
                </div>

                {/* Qualification details */}
                <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                LEVEL
                            </CardTitle>
                            <GraduationCap className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {qualificationLevel?.name || 'N/A'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                DURATION
                            </CardTitle>
                            <Calendar className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-xl font-bold'>
                                {(() => {
                                    const startDate =
                                        currentQualification.startDate
                                            ? new Date(
                                                  currentQualification.startDate
                                              ).toLocaleDateString('en-GB', {
                                                  month: 'short',
                                                  year: '2-digit',
                                              })
                                            : null;

                                    const endDate = currentQualification.endDate
                                        ? new Date(
                                              currentQualification.endDate
                                          ).toLocaleDateString('en-GB', {
                                              month: 'short',
                                              year: '2-digit',
                                          })
                                        : null;

                                    if (startDate && endDate) {
                                        return `${startDate} - ${endDate}`;
                                    } else if (startDate && !endDate) {
                                        return (
                                            <div>
                                                <span className='text-sm text-muted-foreground'>
                                                    Started{' '}
                                                </span>
                                                {startDate}
                                            </div>
                                        );
                                    } else if (!startDate && endDate) {
                                        return (
                                            <div>
                                                <span className='text-sm text-muted-foreground'>
                                                    Ends{' '}
                                                </span>
                                                {endDate}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <span className='text-muted-foreground'>
                                                Not set
                                            </span>
                                        );
                                    }
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                YEARS
                            </CardTitle>
                            <BookOpen className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {rootNodes.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                CURRENT GRADE
                            </CardTitle>
                            <TrendingUp className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {currentQualification.currentGrade !== null &&
                                currentQualification.currentGrade !== undefined
                                    ? `${currentQualification.currentGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                TARGET GRADE
                            </CardTitle>
                            <Target className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {currentQualification.targetGrade !== null &&
                                currentQualification.targetGrade !== undefined
                                    ? `${currentQualification.targetGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                            <CardTitle className='text-sm font-medium'>
                                PREDICTED GRADE
                            </CardTitle>
                            <TrendingUp className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {currentQualification.predictedGrade !== null &&
                                currentQualification.predictedGrade !==
                                    undefined
                                    ? `${currentQualification.predictedGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Course structure */}
                <Card>
                    <CardHeader>
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <CardTitle>Course Structure</CardTitle>
                                <CardDescription>
                                    Click on any module to view its details and
                                    sub-components
                                </CardDescription>
                            </div>
                            {!loadingNodes && rootNodes.length > 0 && (
                                <Button
                                    size='sm'
                                    onClick={() => setShowAddNodeModal(true)}
                                >
                                    Add Subcomponent
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingNodes ? (
                            <div className='flex items-center justify-center py-8'>
                                <div className='text-center'>
                                    <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
                                    <p className='text-sm text-muted-foreground'>
                                        Loading course structure...
                                    </p>
                                </div>
                            </div>
                        ) : rootNodes.length > 0 ? (
                            <div className='rounded-md border'>
                                <div
                                    role='list'
                                    className='divide-y divide-border'
                                >
                                    {rootNodes.map((node) => (
                                        <button
                                            type='button'
                                            key={node.id}
                                            onClick={() =>
                                                navigateToNode(node.id)
                                            }
                                            className='flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                        >
                                            <div className='min-w-0'>
                                                <div className='truncate font-medium'>
                                                    {node.name}
                                                </div>
                                                <div className='truncate text-sm text-muted-foreground'>
                                                    {node.type} •{' '}
                                                    {node.credits !== null &&
                                                    node.credits !== undefined
                                                        ? node.credits
                                                        : '-'}{' '}
                                                    credits
                                                </div>
                                            </div>
                                            <div className='ml-4 flex shrink-0 items-center gap-3'>
                                                <span className='hidden text-xs text-muted-foreground sm:inline'>
                                                    C/T/P
                                                </span>
                                                <span className='text-sm font-medium'>
                                                    <span className='text-primary'>
                                                        {(node.currentGrade ??
                                                            null) !== null
                                                            ? `${node.currentGrade}%`
                                                            : '-'}
                                                    </span>
                                                    /
                                                    {(node.targetGrade ??
                                                        null) !== null
                                                        ? `${node.targetGrade}%`
                                                        : '-'}
                                                    /
                                                    {(node.predictedGrade ??
                                                        null) !== null
                                                        ? `${node.predictedGrade}%`
                                                        : '-'}
                                                </span>
                                                <ChevronRight
                                                    className='h-4 w-4 text-muted-foreground'
                                                    aria-hidden='true'
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className='py-8 text-center'>
                                <BookOpen className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <p className='text-lg font-medium'>
                                    No modules found
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    Subcomponents will appear here once they are
                                    added to this qualification
                                </p>
                                <Button
                                    variant='outline'
                                    className='mt-4'
                                    onClick={() => setShowAddNodeModal(true)}
                                >
                                    Add First Subcomponent
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <EditQualification
                open={showEditModal}
                onCloseAction={() => setShowEditModal(false)}
                onSaveAction={(updates) => updateQualification(updates)}
            />
            <AddQualificationNode
                open={showAddNodeModal}
                onCloseAction={() => setShowAddNodeModal(false)}
                onSaveAction={async (data) => {
                    if (!currentQualificationId) return;
                    const typeStr = data.type?.id || data.type?.name || '';
                    const weightFraction =
                        Math.min(100, Math.max(0, data.weight)) / 100;

                    await createNode({
                        parentId: currentQualificationId,
                        qualificationId: currentQualificationId,
                        type: typeStr,
                        name: data.name,
                        credits: data.credits,
                        weight: weightFraction,
                    });
                }}
            />
        </div>
    );
}
