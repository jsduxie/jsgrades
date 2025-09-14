/** @jest-environment jsdom */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import AddQualificationNode from '@/components/qualifications/AddQualificationNode';
import { mockNodeTypes } from '@/__mocks__/qualificationNode';

jest.mock('@/context/QualificationContext', () => ({
    useQualification: jest.fn(),
}));

const { useQualification } = jest.requireMock('@/context/QualificationContext');

describe('AddQualificationNode', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        (useQualification as jest.Mock).mockReturnValue({
            qualificationNodeTypes: mockNodeTypes(),
            qualifications: [{ id: 'q1', name: 'Maths' }],
            currentQualificationId: 'q1',
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        jest.clearAllMocks();
    });

    it('saves node form data and closes on success', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest.fn().mockResolvedValue(undefined);

        act(() => {
            root.render(
                <AddQualificationNode
                    open
                    onCloseAction={onCloseAction}
                    onSaveAction={onSaveAction}
                />
            );
        });

        const $ = (sel: string) =>
            container.querySelector(sel) as
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLFormElement;

        // Fill minimal fields: name, credits, weight, type
        act(() => {
            const name = $('input#name') as HTMLInputElement;
            name.value = 'Comp 1';
            name.dispatchEvent(new Event('input', { bubbles: true }));

            const credits = $('input#credits') as HTMLInputElement;
            credits.value = '20';
            credits.dispatchEvent(new Event('input', { bubbles: true }));

            const weight = $('input#weight') as HTMLInputElement;
            weight.value = '40';
            weight.dispatchEvent(new Event('input', { bubbles: true }));

            const type = $('select#type') as HTMLSelectElement;
            type.value = 'ass';
            type.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await act(async () => {
            ($('form') as HTMLFormElement).dispatchEvent(
                new Event('submit', { bubbles: true })
            );
        });

        expect(onSaveAction).toHaveBeenCalledTimes(1);
        const payload = (onSaveAction as jest.Mock).mock.calls[0][0];
        expect(payload).toMatchObject({
            name: 'Comp 1',
            credits: 20,
            weight: 40,
        });
        expect(payload.type?.id).toBe('ass');
        expect(onCloseAction).toHaveBeenCalled();

        // After reset, name should be cleared
        expect(
            (container.querySelector('input#name') as HTMLInputElement).value
        ).toBe('');
    });

    it('shows error when save fails', async () => {
        const onCloseAction = jest.fn();
        const onSaveAction = jest
            .fn()
            .mockRejectedValue(new Error('create failed'));

        act(() => {
            root.render(
                <AddQualificationNode
                    open
                    onCloseAction={onCloseAction}
                    onSaveAction={onSaveAction}
                />
            );
        });

        await act(async () => {
            (container.querySelector('form') as HTMLFormElement).dispatchEvent(
                new Event('submit', { bubbles: true })
            );
        });

        const alert = container.querySelector('[role="alert"]');
        expect(alert?.textContent).toContain('create failed');
        expect(onCloseAction).not.toHaveBeenCalled();
    });
});
