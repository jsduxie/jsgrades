'use client';

import React, { useMemo, useState } from 'react';
import { useQualification } from '@/context/QualificationContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, ChevronRight, Layers3, Plus } from 'lucide-react';
import AddQualificationNode from '@/components/qualifications/AddQualificationNode';
import EditQualificationNode from '@/components/qualifications/EditQualificationNode';
import {
    filterNodeTypesByNames,
    getAllowedChildTypeNames,
    getUiLabelForType,
    resolveLevelNumber,
} from '@/lib/client/qualifications/structure';
import { Calendar, CheckCircle, Clock, Target, TrendingUp, BookOpen, ArrowLeft as BackIcon } from 'lucide-react';
import {
    summaryPageContainerClass,
    summaryPageBackdropClass,
    summaryPageContentClass,
    summaryHeaderClass,
    summaryHeaderTitleWrapperClass,
    summaryHeaderTitleClass,
    summaryHeaderSubtitleClass,
    summaryHeaderActionsClass,
    summaryStatsGridClass,
    summaryStatCardHeaderClass,
    summaryStatCardTitleClass,
    summaryStatCardIconClass,
    summaryStatCardValueClass,
    summaryListBorderClass,
    summaryListClass,
    summaryListItemClass,
    summaryListItemContentClass,
    summaryListItemTitleClass,
    summaryListItemSubtitleClass,
    summaryListItemMetaClass,
    summaryListItemMetaLabelClass,
    summaryListItemMetaValueClass,
    summaryListItemMetaHighlightClass,
    summaryListItemIconClass,
    summaryEmptyStateClass,
    summaryEmptyStateIconClass,
    summaryEmptyStateTitleClass,
    summaryEmptyStateDescClass,
    statusBadgeBaseClass,
    statusBadgeCompletedClass,
    statusBadgeInProgressClass,
    statusBadgeIconClass,
} from '@/styles/qualifications.style';

type NodeKind = 'year' | 'module' | 'assessment';
function toNodeKind(name: string): NodeKind {
    if (name === 'year' || name === 'module' || name === 'assessment')
        return name;
    return 'module';
}

export default function NodeSummary() {
    const {
        qualifications,
        qualificationLevels,
        currentQualificationId,
        currentNodeId,
        nodeHierarchy,
        currentNodeSummary,
        qualificationNodeTypes,
        navigateBack,
        updateNode,
        navigateToNode,
        createNode,
    } = useQualification();

    const [showAddChild, setShowAddChild] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const currentQualification = useMemo(
        () =>
            qualifications.find((q) => q.id === currentQualificationId) || null,
        [qualifications, currentQualificationId]
    );

    const levelNumber = useMemo(
        () => resolveLevelNumber(qualificationLevels, currentQualification),
        [qualificationLevels, currentQualification]
    );

    const node =
        currentNodeSummary?.node ||
        nodeHierarchy.find((n) => n.id === currentNodeId) ||
        null;

    const children = useMemo(
        () =>
            node
                ? nodeHierarchy.filter((n) => (n.parentId ?? null) === node.id)
                : [],
        [node, nodeHierarchy]
    );

    const allowedChildNames = useMemo(
        () => getAllowedChildTypeNames(levelNumber ?? 0, node?.type ?? null),
        [levelNumber, node?.type]
    );

    const filteredTypes = useMemo(
        () => filterNodeTypesByNames(qualificationNodeTypes, allowedChildNames),
        [qualificationNodeTypes, allowedChildNames]
    );

    if (!node || levelNumber == null) {
        return (
            <div className='flex h-full items-center justify-center p-6'>
                <div className='text-center'>
                    <p className='text-muted-foreground'>Node not found</p>
                    <Button onClick={navigateBack} className='mt-4'>
                        <ArrowLeft className='mr-2 h-4 w-4' /> Back
                    </Button>
                </div>
            </div>
        );
    }

    const typeLabel = getUiLabelForType(levelNumber, toNodeKind(node.type));

    const StatusBadge = ({ inProgress }: { inProgress: boolean }) => {
        const isCompleted = !inProgress;
        return (
            <span
                className={`${statusBadgeBaseClass} ${
                    isCompleted
                        ? statusBadgeCompletedClass
                        : statusBadgeInProgressClass
                }`}
            >
                {isCompleted ? (
                    <>
                        <CheckCircle className={statusBadgeIconClass} />
                        Completed
                    </>
                ) : (
                    <>
                        <Clock className={statusBadgeIconClass} />
                        In Progress
                    </>
                )}
            </span>
        );
    };

    return (
        <div className={summaryPageContainerClass}>
            <div className={summaryPageBackdropClass} />

            <div className={summaryPageContentClass}>
                {/* Header */}
                <div className={summaryHeaderClass}>
                    <div>
                        <div className={summaryHeaderTitleWrapperClass}>
                            <h1 className={summaryHeaderTitleClass}>{node.name}</h1>
                        </div>
                        <p className={summaryHeaderSubtitleClass}>
                            {typeLabel} • <StatusBadge inProgress={node.inProgress} />
                        </p>
                    </div>
                    <div className={summaryHeaderActionsClass}>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={navigateBack}
                        >
                            <BackIcon className='mr-2 h-4 w-4' /> Back
                        </Button>
                        <Button
                            variant='outline'
                            className='mt-0'
                            onClick={() => setShowEditModal(true)}
                            size='sm'
                        >
                            Edit Component
                        </Button>
                    </div>
                </div>

                {/* Node details */}
                <div className={summaryStatsGridClass}>
                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>CREDITS</CardTitle>
                            <BookOpen className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>{node.credits ?? '-'}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>WEIGHT</CardTitle>
                            <Target className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>
                                {node.weight != null
                                    ? Math.round(Number(node.weight) * 100) + '%'
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>STATUS</CardTitle>
                            <Calendar className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>
                                {node.inProgress ? 'In progress' : 'Completed'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>CURRENT GRADE</CardTitle>
                            <TrendingUp className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>
                                {(node.currentGrade ?? null) !== null
                                    ? `${node.currentGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>TARGET GRADE</CardTitle>
                            <Target className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>
                                {(node.targetGrade ?? null) !== null
                                    ? `${node.targetGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className={summaryStatCardHeaderClass}>
                            <CardTitle className={summaryStatCardTitleClass}>PREDICTED GRADE</CardTitle>
                            <TrendingUp className={summaryStatCardIconClass} />
                        </CardHeader>
                        <CardContent>
                            <div className={summaryStatCardValueClass}>
                                {(node.predictedGrade ?? null) !== null
                                    ? `${node.predictedGrade}%`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subcomponents */}
                <Card>
                    <CardHeader>
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <CardTitle>Subcomponents</CardTitle>
                                <CardDescription>
                                    {children.length > 0
                                        ? 'Click on any subcomponent to view its details'
                                        : 'None added yet'}
                                </CardDescription>
                            </div>
                            {children.length > 0 && filteredTypes.length > 0 && (
                                <Button size='sm' onClick={() => setShowAddChild(true)}>
                                    <Plus className='mr-2 h-4 w-4' /> Add Subcomponent
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {children.length > 0 ? (
                            <div className={summaryListBorderClass}>
                                <div role='list' className={summaryListClass}>
                                    {children.map((c) => (
                                        <button
                                            type='button'
                                            key={c.id}
                                            onClick={() => navigateToNode(c.id)}
                                            className={summaryListItemClass}
                                        >
                                            <div className={summaryListItemContentClass}>
                                                <div className={summaryListItemTitleClass}>{c.name}</div>
                                                <div className={summaryListItemSubtitleClass}>
                                                    {getUiLabelForType(levelNumber, toNodeKind(c.type))} •{' '}
                                                    {c.credits !== null && c.credits !== undefined
                                                        ? c.credits
                                                        : '-'}{' '}
                                                    credits
                                                </div>
                                            </div>
                                            <div className={summaryListItemMetaClass}>
                                                <span className={summaryListItemMetaLabelClass}>
                                                    C/T/P
                                                </span>
                                                <span className={summaryListItemMetaValueClass}>
                                                    <span className={summaryListItemMetaHighlightClass}>
                                                        {(c.currentGrade ?? null) !== null
                                                            ? `${c.currentGrade}%`
                                                            : '-'}
                                                    </span>
                                                    /
                                                    {(c.targetGrade ?? null) !== null
                                                        ? `${c.targetGrade}%`
                                                        : '-'}
                                                    /
                                                    {(c.predictedGrade ?? null) !== null
                                                        ? `${c.predictedGrade}%`
                                                        : '-'}
                                                </span>
                                                <ChevronRight className={summaryListItemIconClass} aria-hidden='true' />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={summaryEmptyStateClass}>
                                <Layers3 className={summaryEmptyStateIconClass} />
                                <p className={summaryEmptyStateTitleClass}>No subcomponents found</p>
                                <p className={summaryEmptyStateDescClass}>
                                    Subcomponents will appear here once they are added to this
                                    component
                                </p>
                                {filteredTypes.length > 0 && (
                                    <Button
                                        variant='outline'
                                        className='mt-4'
                                        onClick={() => setShowAddChild(true)}
                                    >
                                        <Plus className='mr-2 h-4 w-4' /> Add First Subcomponent
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditQualificationNode
                open={showEditModal}
                onCloseAction={() => setShowEditModal(false)}
                onSaveAction={async (updates) => {
                    if (!node?.id) return;
                    const adjusted: any = { ...updates };
                    if (typeof adjusted.weight === 'number') {
                        const w = Math.min(100, Math.max(0, adjusted.weight));
                        adjusted.weight = w / 100;
                    }
                    await updateNode(node.id, adjusted);
                }}
            />

            <AddQualificationNode
                open={showAddChild}
                onCloseAction={() => setShowAddChild(false)}
                onSaveAction={async (data) => {
                    if (!currentQualificationId || !node?.id) return;
                    const typeStr = data.type?.id || data.type?.name || '';
                    const weightFraction = Math.min(100, Math.max(0, data.weight)) / 100;
                    await createNode({
                        parentId: node.id,
                        qualificationId: currentQualificationId,
                        type: typeStr,
                        name: data.name,
                        credits: data.credits,
                        weight: weightFraction,
                    });
                }}
                typesOverride={filteredTypes}
            />
        </div>
    );
}
