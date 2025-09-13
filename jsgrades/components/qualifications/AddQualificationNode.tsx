'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { useQualification } from '@/context/QualificationContext';
import { AddQualificationNodeProps, QualificationNodeFormData } from '@/types';

export default function AddQualificationNode({
    open,
    onCloseAction,
    onSaveAction,
}: AddQualificationNodeProps) {
    const [isLoadingNodes] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [formData, setFormData] = useState<QualificationNodeFormData>({
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
    });

    const qualContext = useQualification();

    const currentQualificationId = qualContext.currentQualificationId;
    const currentQualification = qualContext.qualifications.find(
        (q) => q.id === currentQualificationId
    );

    const handleChange = (
        e: React.ChangeEvent<
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSubmitting(true);
        try {
            await onSaveAction(formData);
            onCloseAction();
            setFormData({
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
            });
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <Card className='mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto'>
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
                    {errorMsg && (
                        <div className='mb-3 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                            {errorMsg}
                        </div>
                    )}
                    {isLoadingNodes ? (
                        <div className='flex flex-col items-center justify-center space-y-4 py-8'>
                            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
                            <p className='text-sm text-muted-foreground'>
                                Loading qualification node types...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            {/* Name */}
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
                                    placeholder='e.g., COMP1101 Algorithms and Data Structures'
                                />
                            </div>

                            {/* Type */}
                            <div className='space-y-2'>
                                <label
                                    htmlFor='type'
                                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                >
                                    Level *
                                </label>
                                <select
                                    id='type'
                                    name='type'
                                    value={formData.type?.id ?? ''}
                                    onChange={(e) => {
                                        const selected = (
                                            qualContext.qualificationNodeTypes ??
                                            []
                                        ).find((t) => t.id === e.target.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: selected,
                                        }));
                                    }}
                                    required
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <option value=''>Select a level...</option>
                                    {(
                                        qualContext.qualificationNodeTypes ?? []
                                    ).map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates */}
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

                            {/* Credits & Weight */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='credits'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Credits
                                    </label>
                                    <Input
                                        id='credits'
                                        name='credits'
                                        type='number'
                                        inputMode='numeric'
                                        min={0}
                                        step={1}
                                        value={formData.credits}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                credits:
                                                    e.target.value === ''
                                                        ? 0
                                                        : Math.max(
                                                              0,
                                                              Math.floor(
                                                                  Number(
                                                                      e.target
                                                                          .value
                                                                  ) || 0
                                                              )
                                                          ),
                                            }))
                                        }
                                        placeholder='e.g., 15'
                                        title='Enter a non-negative number'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='weight'
                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                        Weight (%)
                                    </label>
                                    <Input
                                        id='weight'
                                        name='weight'
                                        type='number'
                                        inputMode='decimal'
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        value={formData.weight}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                weight:
                                                    e.target.value === ''
                                                        ? 0
                                                        : Math.min(
                                                              100,
                                                              Math.max(
                                                                  0,
                                                                  Number(
                                                                      e.target
                                                                          .value
                                                                  ) || 0
                                                              )
                                                          ),
                                            }))
                                        }
                                        placeholder='e.g., 20'
                                        title='Enter a percentage between 0 and 100'
                                    />
                                </div>
                            </div>

                            {/* Grades */}
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

                            {/* In Progress */}
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
                                        isLoadingNodes ||
                                        !formData.name
                                    }
                                >
                                    {submitting ? 'Saving…' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
