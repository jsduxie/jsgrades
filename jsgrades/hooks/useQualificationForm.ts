import { useCallback, useState } from 'react';
import type { QualificationFormData } from '@/types';

export interface UseQualificationFormOptions {
    initial: QualificationFormData;
}

export interface UseQualificationFormReturn {
    formData: QualificationFormData;
    setFormData: (next: QualificationFormData) => void;
    setField: <K extends keyof QualificationFormData>(
        key: K,
        value: QualificationFormData[K]
    ) => void;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    reset: () => void;
}

export function useQualificationForm(
    options: UseQualificationFormOptions
): UseQualificationFormReturn {
    const { initial } = options;
    const [formData, setFormData] = useState<QualificationFormData>(initial);

    const setField = useCallback(
        <K extends keyof QualificationFormData>(
            key: K,
            value: QualificationFormData[K]
        ) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const handleChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
        ) => {
            const { name, value, type } = e.target as HTMLInputElement;
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]:
                    type === 'checkbox'
                        ? (checked as unknown as QualificationFormData[keyof QualificationFormData])
                        : (value as unknown as QualificationFormData[keyof QualificationFormData]),
            }));
        },
        []
    );

    const reset = useCallback(() => setFormData(initial), [initial]);

    return { formData, setFormData, setField, handleChange, reset };
}
