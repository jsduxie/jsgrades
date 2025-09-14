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
import { formCardClass, formModalClass } from '@/styles/forms.style';
import { AddQualificationProps, Qualification } from '@/types';
import QualificationForm from '@/components/qualifications/QualificationForm';
import { useQualificationForm } from '@/hooks/useQualificationForm';
import {
    stringNumberOrBlankToNumber,
    stringDateOrBlankToDate,
} from '@/lib/client/qualifications/conversions';

export default function AddQualification({
    open,
    onCloseAction,
    onSaveAction,
}: AddQualificationProps) {
    const [isLoadingLevels] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const qualContext = useQualification();

    const { formData, handleChange, reset } = useQualificationForm({
        initial: {
            name: '',
            institution: '',
            level: '',
            startDate: '',
            endDate: '',
            currentGrade: '',
            targetGrade: '',
            predictedGrade: '',
            inProgress: true,
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSubmitting(true);

        const payload = {
            name: formData.name,
            institution: formData.institution,
            level: formData.level,
            currentGrade: stringNumberOrBlankToNumber(formData.currentGrade),
            targetGrade: stringNumberOrBlankToNumber(formData.targetGrade),
            predictedGrade: stringNumberOrBlankToNumber(
                formData.predictedGrade
            ),
            startDate: stringDateOrBlankToDate(formData.startDate),
            endDate: stringDateOrBlankToDate(formData.endDate),
            inProgress: formData.inProgress,
        } as Partial<Qualification> & Record<string, unknown>;

        try {
            await onSaveAction(payload);
            onCloseAction();
            reset();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to save qualification. Please try again.';
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
                    <CardTitle>Add Qualification</CardTitle>
                    <CardDescription>
                        Add a new qualification to track your progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QualificationForm
                        value={formData}
                        levels={qualContext.qualificationLevels}
                        submitting={submitting}
                        isLoadingLevels={isLoadingLevels}
                        errorMsg={errorMsg}
                        submitLabel='Save'
                        onChangeAction={handleChange}
                        onSubmitAction={handleSubmit}
                        onCancelAction={onCloseAction}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
