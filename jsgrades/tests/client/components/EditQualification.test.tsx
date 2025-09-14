/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditQualification from '@/components/qualifications/EditQualification';
import { mockQualification } from '@/__mocks__/qualification';
import type { QualificationLevel } from '@/types';

jest.mock('@/context/QualificationContext', () => ({
    useQualification: jest.fn(),
}));

const { useQualification } = jest.requireMock('@/context/QualificationContext');

describe('EditQualification', () => {
    const levels: QualificationLevel[] = [
        { id: 'A-Level', name: 'A-Level', level: 3 },
        { id: 'L4', name: 'Level 4', level: 4 },
    ];

    const current = mockQualification();

    beforeEach(() => {
        (useQualification as jest.Mock).mockReturnValue({
            qualifications: [current],
            currentQualificationId: current.id,
            qualificationLevels: levels,
        });
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('populates fields from current qualification and submits only changed fields', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest.fn().mockResolvedValue(undefined);

        render(
            <EditQualification
                open
                onCloseAction={onCloseAction}
                onSaveAction={onSaveAction}
            />
        );

        // Wait for form to be populated
        const nameEl = await screen.findByLabelText(/name/i);
        expect((nameEl as HTMLInputElement).value).toBe(current.name);

        await userEvent.clear(nameEl);
        await userEvent.type(nameEl, 'Advanced Mathematics');

        await userEvent.selectOptions(screen.getByLabelText(/level/i), 'L4');

        await userEvent.click(
            screen.getByRole('button', { name: /save changes/i })
        );

        expect(onSaveAction).toHaveBeenCalledTimes(1);
        const updates = (onSaveAction as jest.Mock).mock.calls[0][0];
        expect(updates).toEqual({ name: 'Advanced Mathematics', level: 'L4' });
        expect(onCloseAction).toHaveBeenCalled();
    });

    it('closes without saving when no fields changed', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest.fn();

        render(
            <EditQualification
                open
                onCloseAction={onCloseAction}
                onSaveAction={onSaveAction}
            />
        );

        await userEvent.click(
            screen.getByRole('button', { name: /save changes/i })
        );

        expect(onSaveAction).not.toHaveBeenCalled();
        expect(onCloseAction).toHaveBeenCalled();
    });

    it('shows error when save fails', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest
            .fn()
            .mockRejectedValue(new Error('update failed'));

        render(
            <EditQualification
                open
                onCloseAction={onCloseAction}
                onSaveAction={onSaveAction}
            />
        );

        const nameEl = await screen.findByLabelText(/name/i);
        await userEvent.clear(nameEl);
        await userEvent.type(nameEl, 'Changed');

        await userEvent.click(
            screen.getByRole('button', { name: /save changes/i })
        );

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(/update failed/i);
        expect(onCloseAction).not.toHaveBeenCalled();
    });
});
