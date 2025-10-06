'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQualification } from '@/context/QualificationContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import QualificationNodeForm from '@/components/qualifications/QualificationNodeForm';
import { formCardClass, formModalClass } from '@/styles/forms.style';
import { useQualificationNodeForm } from '@/hooks/useQualificationNodeForm';
import type { Node, QualificationNodeFormData, QualificationNodeType } from '@/types';
import { detectNodeChanges } from '@/lib/client/qualifications/conversions';

export type EditQualificationNodeProps = {
    open: boolean;
    onCloseAction: () => void;
    onSaveAction: (updates: Partial<Node>) => void | Promise<void>;
    typesOverride?: QualificationNodeType[];
};

export default function EditQualificationNode({
    open,
    onCloseAction,
    onSaveAction,
    typesOverride,
}: EditQualificationNodeProps) {
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        currentNodeSummary,
        currentNodeId,
        nodeHierarchy,
        qualificationNodeTypes,
        qualifications,
        currentQualificationId,
    } = useQualification();

    const currentNode: Node | null = useMemo(() => {
        return (
            currentNodeSummary?.node ||
            nodeHierarchy.find((n) => n.id === currentNodeId) ||
            null
        );
    }, [currentNodeSummary?.node, nodeHierarchy, currentNodeId]);

    const currentQualification = useMemo(
        () => qualifications.find((q) => q.id === currentQualificationId),
        [qualifications, currentQualificationId]
    );

    const types: QualificationNodeType[] = useMemo(
        () => typesOverride ?? qualificationNodeTypes ?? [],
        [typesOverride, qualificationNodeTypes]
    );

    const initialForm: QualificationNodeFormData = useMemo(
        () => ({
            qualificationId: currentNode?.qualificationId || currentQualificationId || '',
            userId: currentNode?.userId || '',
            parentId: currentNode?.parentId || '',
            name: currentNode?.name || '',
            type:
                types.find((t) => t.id === currentNode?.type || t.name === currentNode?.type) ||
                undefined,
            weight:
                currentNode?.weight != null
                    ? Math.round(Number(currentNode.weight) * 100)
                    : 0,
            credits: currentNode?.credits != null ? Number(currentNode.credits) : 0,
            startDate: currentNode?.startDate
                ? new Date(currentNode.startDate).toISOString().slice(0, 10)
                : '',
            endDate: currentNode?.endDate
                ? new Date(currentNode.endDate).toISOString().slice(0, 10)
                : '',
            targetGrade:
                currentNode?.targetGrade != null
                    ? String(currentNode.targetGrade)
                    : '',
            currentGrade:
                currentNode?.currentGrade != null
                    ? String(currentNode.currentGrade)
                    : '',
            predictedGrade:
                currentNode?.predictedGrade != null
                    ? String(currentNode.predictedGrade)
                    : '',
            inProgress: currentNode?.inProgress ?? true,
        }),
        [currentNode, currentQualificationId, types]
    );

    const {
        formData,
        setFormData,
        handleChange,
        handleCreditsChange,
        handleWeightChange,
        handleTypeChange,
    } = useQualificationNodeForm({ initial: initialForm, types });

    useEffect(() => {
        if (open && currentNode) {
            setFormData(initialForm);
        }
    }, [open, currentNode, initialForm, setFormData]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentNode) return onCloseAction();
        setErrorMsg(null);
        setSubmitting(true);
        try {
            const updates = detectNodeChanges(currentNode, formData);
            if (Object.keys(updates).length === 0) {
                setSubmitting(false);
                return onCloseAction();
            }
            await onSaveAction(updates);
            onCloseAction();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update component';
            setErrorMsg(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className={formModalClass}>
            <Card className={formCardClass}>
                <CardHeader>
                    <CardTitle>Edit Subcomponent</CardTitle>
                    <CardDescription>
                        Update details for {currentNode?.name || 'this component'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QualificationNodeForm
                        value={formData}
                        types={types}
                        submitting={submitting}
                        isLoadingTypes={false}
                        errorMsg={errorMsg}
                        submitLabel="Save Changes"
                        onChangeAction={handleChange}
                        onCreditsChangeAction={handleCreditsChange}
                        onWeightChangeAction={handleWeightChange}
                        onTypeChangeAction={handleTypeChange}
                        onSubmitAction={handleSubmit}
                        onCancelAction={onCloseAction}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

