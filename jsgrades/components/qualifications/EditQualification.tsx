'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AddQualificationProps, QualificationFormData } from '@/types';
import { useQualification } from '@/context/QualificationContext';
import {
    convertQualificationToFormData,
    detectQualificationChanges,
} from '@/lib/client/qualifications/conversions';

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

    const [formData, setFormData] = useState<QualificationFormData>({
        name: '',
        institution: '',
        level: '',
        startDate: '',
        endDate: '',
        currentGrade: '',
        targetGrade: '',
        predictedGrade: '',
        inProgress: true,
    });

    useEffect(() => {
        if (open && currentQualification) {
            setFormData(convertQualificationToFormData(currentQualification));
        }
    }, [open, currentQualification]);

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <Card className='mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto'>
                <CardHeader>
                    <CardTitle>Edit Qualification</CardTitle>
                    <CardDescription>
                        Make changes to your qualification details. Only
                        modified fields will be updated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMsg && (
                        <div className='mb-3 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                            {errorMsg}
                        </div>
                    )}
                    {isLoadingLevels ? (
                        <div className='flex flex-col items-center justify-center space-y-4 py-8'>
                            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
                            <p className='text-sm text-muted-foreground'>
                                Loading qualification levels...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-2'>
                                <label
                                    htmlFor='name'
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                >
                                    Name *
                                </label>
                                <Input
                                    id='name'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder='e.g., Mathematics A Level'
                                />
                            </div>

                            <div className='space-y-2'>
                                <label
                                    htmlFor='institution'
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                >
                                    Institution *
                                </label>
                                <Input
                                    id='institution'
                                    name='institution'
                                    value={formData.institution}
                                    onChange={handleChange}
                                    required
                                    placeholder='e.g., School or College name'
                                />
                            </div>

                            <div className='space-y-2'>
                                <label
                                    htmlFor='level'
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                >
                                    Level *
                                </label>
                                <select
                                    id='level'
                                    name='level'
                                    value={formData.level}
                                    onChange={handleChange}
                                    required
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <option value=''>Select a level...</option>
                                    {qualContext.qualificationLevels.map(
                                        (l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name} (Level {l.level})
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='startDate'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Start Date
                                    </label>
                                    <Input
                                        id='startDate'
                                        name='startDate'
                                        type='date'
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label
                                        htmlFor='endDate'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        End Date
                                    </label>
                                    <Input
                                        id='endDate'
                                        name='endDate'
                                        type='date'
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        disabled={formData.inProgress}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-3 gap-4'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='currentGrade'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Current Grade
                                    </label>
                                    <Input
                                        id='currentGrade'
                                        name='currentGrade'
                                        value={formData.currentGrade}
                                        onChange={handleChange}
                                        placeholder='e.g., 85'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label
                                        htmlFor='targetGrade'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Target Grade
                                    </label>
                                    <Input
                                        id='targetGrade'
                                        name='targetGrade'
                                        value={formData.targetGrade}
                                        onChange={handleChange}
                                        placeholder='e.g., 90'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label
                                        htmlFor='predictedGrade'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Predicted Grade
                                    </label>
                                    <Input
                                        id='predictedGrade'
                                        name='predictedGrade'
                                        value={formData.predictedGrade}
                                        onChange={handleChange}
                                        placeholder='e.g., 88'
                                    />
                                </div>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <input
                                    id='inProgress'
                                    name='inProgress'
                                    type='checkbox'
                                    checked={formData.inProgress}
                                    onChange={handleChange}
                                    className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary'
                                />
                                <label
                                    htmlFor='inProgress'
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                >
                                    In Progress
                                </label>
                            </div>

                            <div className='flex justify-end space-x-2 pt-4'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={onCloseAction}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    disabled={
                                        submitting ||
                                        isLoadingLevels ||
                                        !formData.name ||
                                        !formData.institution ||
                                        !formData.level
                                    }
                                >
                                    {submitting ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
