'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AddQualificationProps } from '@/types';
import { formCardClass, formModalClass } from '@/styles/forms.style';
import { useQualification } from '@/context/QualificationContext';
import {
    convertQualificationToFormData,
    detectQualificationChanges,
} from '@/lib/client/qualifications/conversions';
import QualificationForm from '@/components/qualifications/QualificationForm';
import { useQualificationForm } from '@/hooks/useQualificationForm';

export default function EditQualification({
    open,
    onCloseAction,
    onSaveAction,
}: AddQualificationProps) {
    const [isLoadingLevels] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const qualContext = useQualification();

    const currentQualification = qualContext.qualifications.find(
        (qual) => qual.id === qualContext.currentQualificationId
    );

    const { formData, setFormData, handleChange } = useQualificationForm({
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

    useEffect(() => {
        if (open && currentQualification) {
            setFormData(convertQualificationToFormData(currentQualification));
        }
    }, [open, currentQualification, setFormData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!currentQualification) {
            return onCloseAction();
        }

        setErrorMsg(null);
        setSubmitting(true);

        const updates = detectQualificationChanges(
            currentQualification,
            formData
        );

        if (Object.keys(updates).length === 0) {
            setSubmitting(false);
            return onCloseAction();
        }

        try {
            await onSaveAction(updates);
            onCloseAction();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to update qualification. Please try again.';
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
                    <CardTitle>Edit Qualification</CardTitle>
                    <CardDescription>
                        Make changes to your qualification details. Only
                        modified fields will be updated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QualificationForm
                        value={formData}
                        levels={qualContext.qualificationLevels}
                        submitting={submitting}
                        isLoadingLevels={isLoadingLevels}
                        errorMsg={errorMsg}
                        submitLabel='Save Changes'
                        onChangeAction={handleChange}
                        onSubmitAction={handleSubmit}
                        onCancelAction={onCloseAction}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
