/** @jest-environment jsdom */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { useQualificationForm } from '@/hooks/useQualificationForm';
import type { QualificationFormData } from '@/types';

function Probe({
    initial,
    onRender,
}: {
    initial: QualificationFormData;
    onRender: (s: ReturnType<typeof useQualificationForm>) => void;
}) {
    const api = useQualificationForm({ initial });
    onRender(api as any);
    return null as unknown as React.ReactElement;
}

describe('useQualificationForm', () => {
    let container: HTMLDivElement;
    let root: Root;

    const initial: QualificationFormData = {
        name: 'Maths',
        institution: 'Inst',
        level: '',
        startDate: '',
        endDate: '',
        currentGrade: '',
        targetGrade: '',
        predictedGrade: '',
        inProgress: true,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('initializes, updates fields, toggles checkbox, and resets', () => {
        let api!: ReturnType<typeof useQualificationForm>;
        act(() => {
            root.render(
                <Probe initial={initial} onRender={(s) => (api = s as any)} />
            );
        });
        expect(api.formData.name).toBe('Maths');

        // text change
        act(() => {
            api.handleChange({
                target: { name: 'name', value: 'Physics', type: 'text' },
            } as any);
        });
        expect(api.formData.name).toBe('Physics');

        // checkbox toggle
        act(() => {
            api.handleChange({
                target: {
                    name: 'inProgress',
                    checked: false,
                    type: 'checkbox',
                },
            } as any);
        });
        expect(api.formData.inProgress).toBe(false);

        // reset
        act(() => api.reset());
        expect(api.formData.name).toBe('Maths');
        expect(api.formData.inProgress).toBe(true);
    });
});
