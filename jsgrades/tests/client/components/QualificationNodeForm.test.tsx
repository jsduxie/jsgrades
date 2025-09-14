/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QualificationNodeForm from '@/components/qualifications/QualificationNodeForm';
import type { QualificationNodeFormData, QualificationNodeType } from '@/types';

describe('QualificationNodeForm (presentational)', () => {
    const types: QualificationNodeType[] = [
        { id: 'mod', name: 'Module', allowChildren: true },
        { id: 'ass', name: 'Assessment', allowChildren: false },
    ];

    const base: QualificationNodeFormData = {
        qualificationId: 'q1',
        userId: 'u1',
        parentId: 'p1',
        name: 'Name',
        type: types[0],
        weight: 50,
        credits: 15,
        startDate: '',
        endDate: '',
        targetGrade: '',
        currentGrade: '',
        predictedGrade: '',
        inProgress: true,
    };

    it('renders fields and fires handlers', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const onCreditsChange = jest.fn();
        const onWeightChange = jest.fn();
        const onTypeChange = jest.fn();
        const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
        const onCancel = jest.fn();

        render(
            <QualificationNodeForm
                value={base}
                types={types}
                submitLabel='Save'
                onChangeAction={onChange}
                onCreditsChangeAction={onCreditsChange}
                onWeightChangeAction={onWeightChange}
                onTypeChangeAction={onTypeChange}
                onSubmitAction={onSubmit}
                onCancelAction={onCancel}
            />
        );

        // Change name
        const name = screen.getByLabelText(/name/i);
        await user.clear(name);
        await user.type(name, 'Changed');
        expect(onChange).toHaveBeenCalled();

        // Change credits
        const credits = screen.getByLabelText(/credits/i);
        await user.clear(credits);
        await user.type(credits, '30');
        expect(onCreditsChange).toHaveBeenCalled();

        // Change weight
        const weight = screen.getByLabelText(/weight/i);
        await user.clear(weight);
        await user.type(weight, '60');
        expect(onWeightChange).toHaveBeenCalled();

        // Change type
        const typeSel = screen.getByLabelText(/type/i);
        await user.selectOptions(typeSel, 'ass');
        expect(onTypeChange).toHaveBeenCalledWith('ass');

        // Submit
        await user.click(screen.getByRole('button', { name: /save/i }));
        expect(onSubmit).toHaveBeenCalled();

        // Cancel
        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalled();
    });
});
