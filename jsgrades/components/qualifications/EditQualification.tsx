'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { AddQualificationProps, QualificationFormData, QualificationLevel, } from '@/types';

export default function EditQualification({
    open,
    onCloseAction,
    onSaveAction,
}: AddQualificationProps) {
    const [levels, setLevels] = useState<QualificationLevel[]>([]);
    const [isLoadingLevels, setIsLoadingLevels] = useState(false);
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
        if (!open) return;
        const fetchLevels = async () => {
            setIsLoadingLevels(true);
            try {
                const res = await fetch('/api/qualifications/levels');
                const json = await res.json();
                if (json.status === 'success') setLevels(json.data);
            } catch (error) {
                console.error('Failed to fetch qualification levels:', error);
            } finally {
                setIsLoadingLevels(false);
            }
        };
        fetchLevels();
    }, [open]);

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
        const payload = {
            ...formData,
            currentGrade: parseFloat(formData.currentGrade) || undefined,
            targetGrade: parseFloat(formData.targetGrade) || undefined,
            predictedGrade: parseFloat(formData.predictedGrade) || undefined,
            startDate: formData.startDate
                ? new Date(formData.startDate)
                : undefined,
            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        };

        await onSaveAction(payload);
        onCloseAction();
        setFormData({
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
    };

    if (!open) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <Card className='mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto'>
                <CardHeader>
                    <CardTitle>Add Qualification</CardTitle>
                    <CardDescription>
                        Add a new qualification to track your progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    {levels.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name} (Level {l.level})
                                        </option>
                                    ))}
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
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    disabled={
                                        isLoadingLevels ||
                                        !formData.name ||
                                        !formData.institution ||
                                        !formData.level
                                    }
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
