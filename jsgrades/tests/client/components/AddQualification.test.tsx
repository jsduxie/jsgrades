/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddQualification from '@/components/qualifications/AddQualification';
import type { QualificationLevel } from '@/types';

jest.mock('@/context/QualificationContext', () => ({
    useQualification: jest.fn(),
}));

const { useQualification } = jest.requireMock('@/context/QualificationContext');

describe('AddQualification', () => {
    const levels: QualificationLevel[] = [
        { id: 'L1', name: 'Cert', level: 1 },
        { id: 'L2', name: 'Diploma', level: 2 },
    ];

    beforeEach(() => {
        (useQualification as jest.Mock).mockReturnValue({
            qualificationLevels: levels,
        });
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('submits converted payload, resets form, and calls close', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest.fn().mockResolvedValue(undefined);

        render(
            <AddQualification
                open
                onCloseAction={onCloseAction}
                onSaveAction={onSaveAction}
            />
        );

        const user = userEvent.setup();

        // Toggle inProgress to false
        await user.click(screen.getByLabelText(/in progress/i));

        await user.type(screen.getByLabelText(/name/i), 'Physics');
        await user.type(screen.getByLabelText(/institution/i), 'Uni');

        await user.selectOptions(screen.getByLabelText(/level/i), 'L1');

        await user.type(screen.getByLabelText(/start date/i), '2024-01-10');
        await user.type(screen.getByLabelText(/end date/i), '2024-02-20');

        await user.type(screen.getByLabelText(/current grade/i), '70');
        await user.type(screen.getByLabelText(/target grade/i), '85');
        await user.type(screen.getByLabelText(/predicted grade/i), '80');

        await user.click(screen.getByRole('button', { name: /save/i }));

        expect(onSaveAction).toHaveBeenCalledTimes(1);
        const arg = (onSaveAction as jest.Mock).mock.calls[0][0];
        expect(arg).toMatchObject({
            name: 'Physics',
            institution: 'Uni',
            level: 'L1',
            currentGrade: 70,
            targetGrade: 85,
            predictedGrade: 80,
            inProgress: false,
        });
        expect(arg.startDate instanceof Date).toBe(true);
        expect(arg.endDate instanceof Date).toBe(true);
        expect((arg.startDate as Date).toISOString().slice(0, 10)).toBe(
            '2024-01-10'
        );
        expect((arg.endDate as Date).toISOString().slice(0, 10)).toBe(
            '2024-02-20'
        );

        // Closed and reset back to initial values
        expect(onCloseAction).toHaveBeenCalled();
        expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe(
            ''
        );
    });

    it('shows error and does not close when save fails', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest
            .fn()
            .mockRejectedValue(new Error('save failed'));

        render(
            <AddQualification
                open
                onCloseAction={onCloseAction}
                onSaveAction={onSaveAction}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(/save failed/i);
        expect(onCloseAction).not.toHaveBeenCalled();
    });
});
