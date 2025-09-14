/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QualificationForm from '@/components/qualifications/QualificationForm';
import type { QualificationFormData, QualificationLevel } from '@/types';

describe('QualificationForm (presentational)', () => {
    const levels: QualificationLevel[] = [
        { id: 'L1', name: 'Cert', level: 1 },
        { id: 'L2', name: 'Diploma', level: 2 },
    ];

    const base: QualificationFormData = {
        name: 'Mathematics',
        institution: 'Some School',
        level: '',
        startDate: '',
        endDate: '',
        currentGrade: '',
        targetGrade: '',
        predictedGrade: '',
        inProgress: true,
    };

    it('renders fields and fires callbacks', async () => {
        const user = userEvent.setup();
        const onChangeAction = jest.fn();
        const onSubmitAction = jest.fn((e: React.FormEvent) =>
            e.preventDefault()
        );
        const onCancelAction = jest.fn();

        render(
            <QualificationForm
                value={base}
                levels={levels}
                submitLabel='Save'
                onChangeAction={onChangeAction}
                onSubmitAction={onSubmitAction}
                onCancelAction={onCancelAction}
            />
        );

        // Labels present
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/level/i)).toBeInTheDocument();

        // Change name
        await user.clear(screen.getByLabelText(/name/i));
        await user.type(screen.getByLabelText(/name/i), 'Physics');
        expect(onChangeAction).toHaveBeenCalled();

        // Toggle in progress
        await user.click(
            screen.getByRole('checkbox', { name: /in progress/i })
        );
        expect(onChangeAction).toHaveBeenCalled();

        // Submit
        await user.click(screen.getByRole('button', { name: /save/i }));
        expect(onSubmitAction).toHaveBeenCalled();
    });

    it('disables endDate when inProgress is true', () => {
        render(
            <QualificationForm
                value={{ ...base, inProgress: true }}
                levels={levels}
                submitLabel='Save'
                onChangeAction={jest.fn()}
                onSubmitAction={jest.fn()}
            />
        );

        expect(screen.getByLabelText(/end date/i)).toBeDisabled();
    });
});
