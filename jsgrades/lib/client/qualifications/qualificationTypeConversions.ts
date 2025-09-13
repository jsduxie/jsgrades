import { Qualification, QualificationFormData } from '@/types';

/**
 * Safely converts a date value to ISO string format for form inputs
 */
function formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';

    try {
        // If it's already a string, parse it first
        if (typeof date === 'string') {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            return dateObj.toISOString().slice(0, 10);
        }

        // If it's a Date object, use it directly
        if (isNaN((date as Date).getTime())) return '';
        return (date as Date).toISOString().slice(0, 10);
    } catch (error) {
        console.warn('Error formatting date for input:', error);
        return '';
    }
}

export function convertQualificationToFormData(
    q: Qualification
): QualificationFormData {
    console.log('convertQualificationToFormData called with:', q);
    console.log('startDate type:', typeof q.startDate, 'value:', q.startDate);
    console.log('endDate type:', typeof q.endDate, 'value:', q.endDate);

    return {
        name: q.name || '',
        institution: q.institution || '',
        level: q.level || '',
        startDate: formatDateForInput(q.startDate),
        endDate: formatDateForInput(q.endDate),
        currentGrade: q.currentGrade?.toString() ?? '',
        targetGrade: q.targetGrade?.toString() ?? '',
        predictedGrade: q.predictedGrade?.toString() ?? '',
        inProgress: q.inProgress ?? true,
    };
}

export function detectQualificationChanges(
    original: Qualification,
    formData: QualificationFormData
): Partial<Qualification> {
    const updates: Partial<Qualification> = {};

    // Trimmed string fields
    const trimmedStringFields = ['name', 'institution'] as const;
    for (const key of trimmedStringFields) {
        const nextVal = formData[key].trim();
        if (original[key] !== nextVal) {
            updates[key] = nextVal as unknown as Qualification[typeof key];
        }
    }

    // Exact string field (no trim)
    if (original.level !== formData.level) {
        updates.level = formData.level;
    }

    // Boolean field
    if (original.inProgress !== formData.inProgress) {
        updates.inProgress = formData.inProgress;
    }

    // Date fields (compare normalized to YYYY-MM-DD, set Date or undefined)
    const dateFields = ['startDate', 'endDate'] as const;
    for (const key of dateFields) {
        const originalDateStr = formatDateForInput(original[key]);
        const nextStr = formData[key];
        if (originalDateStr !== nextStr) {
            updates[key] = nextStr ? (new Date(nextStr) as any) : (undefined as any);
        }
    }

    // Numeric grade fields (compare stringified, set number or undefined)
    const gradeFields = ['currentGrade', 'targetGrade', 'predictedGrade'] as const;
    for (const key of gradeFields) {
        const originalStr = original[key]?.toString() ?? '';
        const nextStr = formData[key];
        if (originalStr !== nextStr) {
            updates[key] = nextStr ? (parseFloat(nextStr) as any) : (undefined as any);
        }
    }

    return updates;
}
