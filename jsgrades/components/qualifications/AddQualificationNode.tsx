'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useQualification } from '@/context/QualificationContext';
import { AddQualificationNodeProps } from '@/types';
import { formCardClass, formModalClass } from '@/styles/forms.style';
import QualificationNodeForm from '@/components/qualifications/QualificationNodeForm';
import { useQualificationNodeForm } from '@/hooks/useQualificationNodeForm';
import type { QualificationNodeType } from '@/types';

type Props = AddQualificationNodeProps & {
    typesOverride?: QualificationNodeType[];
};

export default function AddQualificationNode({
    open,
    onCloseAction,
    onSaveAction,
    typesOverride,
}: Props) {
    const [isLoadingNodes] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const qualContext = useQualification();

    const currentQualificationId = qualContext.currentQualificationId;
    const currentQualification = qualContext.qualifications.find(
        (q) => q.id === currentQualificationId
    );

    const typesToUse =
        typesOverride ?? qualContext.qualificationNodeTypes ?? [];

    const {
        formData,
        handleChange,
        handleCreditsChange,
        handleWeightChange,
        handleTypeChange,
        reset,
    } = useQualificationNodeForm({
        initial: {
            qualificationId: '',
            userId: '',
            parentId: '',
            name: '',
            type: undefined,
            weight: 0,
            credits: 0,
            startDate: '',
            endDate: '',
            targetGrade: '',
            currentGrade: '',
            predictedGrade: '',
            inProgress: true,
        },
        types: typesToUse,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSubmitting(true);
        try {
            await onSaveAction(formData);
            onCloseAction();
            reset();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to add subcomponent. Please try again.';
            setErrorMsg(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className={formModalClass}>
            <Card className={formCardClass}>
                <CardHeader>
                    <CardTitle>Add Subcomponent</CardTitle>
                    <CardDescription>
                        Add a sub component to{' '}
                        {currentQualification?.name
                            ? currentQualification.name
                            : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QualificationNodeForm
                        value={formData}
                        types={typesToUse}
                        submitting={submitting}
                        isLoadingTypes={isLoadingNodes}
                        errorMsg={errorMsg}
                        submitLabel='Save'
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
