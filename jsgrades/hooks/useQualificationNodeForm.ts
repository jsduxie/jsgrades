import { useCallback, useMemo, useState } from 'react';
import type { QualificationNodeFormData, QualificationNodeType } from '@/types';

export interface UseQualificationNodeFormOptions {
    initial: QualificationNodeFormData;
    types: QualificationNodeType[];
}

export interface UseQualificationNodeFormReturn {
    formData: QualificationNodeFormData;
    setFormData: (next: QualificationNodeFormData) => void;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    handleCreditsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTypeChange: (typeId: string) => void;
    reset: () => void;
}

export function useQualificationNodeForm(
    options: UseQualificationNodeFormOptions
): UseQualificationNodeFormReturn {
    const { initial, types } = options;
    const [formData, setFormData] =
        useState<QualificationNodeFormData>(initial);

    const typeMap = useMemo(() => {
        const m = new Map<string, QualificationNodeType>();
        types.forEach((t) => m.set(t.id, t));
        return m;
    }, [types]);

    const handleChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
        ) => {
            const target = e.target as HTMLInputElement;
            const { name, type, value } = target;
            const checked = target.checked;
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? (checked as any) : (value as any),
            }));
        },
        []
    );

    const handleCreditsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const n = Number(e.target.value);
            const next = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
            setFormData((prev) => ({ ...prev, credits: next }));
        },
        []
    );

    const handleWeightChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const n = Number(e.target.value);
            let next = Number.isFinite(n) ? n : 0;
            if (next < 0) next = 0;
            if (next > 100) next = 100;
            setFormData((prev) => ({ ...prev, weight: Math.round(next) }));
        },
        []
    );

    const handleTypeChange = useCallback(
        (typeId: string) => {
            const t = typeMap.get(typeId);
            setFormData((prev) => ({ ...prev, type: t }));
        },
        [typeMap]
    );

    const reset = useCallback(() => setFormData(initial), [initial]);

    return {
        formData,
        setFormData,
        handleChange,
        handleCreditsChange,
        handleWeightChange,
        handleTypeChange,
        reset,
    };
}
