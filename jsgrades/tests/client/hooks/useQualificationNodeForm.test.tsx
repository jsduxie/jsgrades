/** @jest-environment jsdom */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useQualificationNodeForm } from '@/hooks/useQualificationNodeForm';
import type { QualificationNodeFormData, QualificationNodeType } from '@/types';

describe('useQualificationNodeForm', () => {
    const types: QualificationNodeType[] = [
        { id: 'mod', name: 'Module', allowChildren: true },
        { id: 'ass', name: 'Assessment', allowChildren: false },
    ];

    const initial: QualificationNodeFormData = {
        qualificationId: 'q1',
        userId: 'u1',
        parentId: 'n0',
        name: 'Root',
        type: types[0],
        weight: 0,
        credits: 0,
        startDate: '',
        endDate: '',
        targetGrade: '',
        currentGrade: '',
        predictedGrade: '',
        inProgress: true,
    };

    it('updates fields, enforces numeric bounds, changes type, and resets', async () => {
        const { result, rerender } = renderHook(() =>
            useQualificationNodeForm({ initial, types })
        );

        // text change
        result.current.handleChange({
            target: { name: 'name', value: 'Exam', type: 'text' },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        await waitFor(() => expect(result.current.formData.name).toBe('Exam'));

        // credits numeric lower bound
        result.current.handleCreditsChange({
            target: { value: '-5' },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        await waitFor(() => expect(result.current.formData.credits).toBe(0));

        // weight numeric upper bound
        result.current.handleWeightChange({
            target: { value: '150' },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
        await waitFor(() => expect(result.current.formData.weight).toBe(100));

        // type change by id
        result.current.handleTypeChange('ass');
        await waitFor(() =>
            expect(result.current.formData.type?.id).toBe('ass')
        );

        // reset
        result.current.reset();
        // after reset, rerender to pick up new initial if needed (not required here)
        rerender();
        await waitFor(() => expect(result.current.formData.name).toBe('Root'));
        await waitFor(() => expect(result.current.formData.weight).toBe(0));
    });
});
