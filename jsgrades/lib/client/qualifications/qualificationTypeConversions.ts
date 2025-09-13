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
    const trimmedKeys = ['name', 'institution'] as const;
    type TrimmedKey = (typeof trimmedKeys)[number];
    const trimmedUpdates: Partial<Record<TrimmedKey, string>> = {};
    for (const key of trimmedKeys) {
        const nextVal = formData[key].trim();
        if (original[key] !== nextVal) {
            trimmedUpdates[key] = nextVal;
        }
    }

    // Level (exact comparison, no trim)
    const baseUpdates: Partial<Pick<Qualification, 'level' | 'inProgress'>> =
        {};
    if (original.level !== formData.level) {
        baseUpdates.level = formData.level;
    }
    if (original.inProgress !== formData.inProgress) {
        baseUpdates.inProgress = formData.inProgress;
    }

    // Date fields (normalize to YYYY-MM-DD for comparison)
    const dateKeys = ['startDate', 'endDate'] as const;
    type DateKey = (typeof dateKeys)[number];
    const dateUpdates: Partial<Record<DateKey, Date | undefined>> = {};
    for (const key of dateKeys) {
        const originalDateStr = formatDateForInput(original[key]);
        const nextStr = formData[key];
        if (originalDateStr !== nextStr) {
            dateUpdates[key] = nextStr ? new Date(nextStr) : undefined;
        }
    }

    // Numeric grade fields
    const gradeKeys = [
        'currentGrade',
        'targetGrade',
        'predictedGrade',
    ] as const;
    type GradeKey = (typeof gradeKeys)[number];
    const gradeUpdates: Partial<Record<GradeKey, number | undefined>> = {};
    for (const key of gradeKeys) {
        const originalStr = original[key]?.toString() ?? '';
        const nextStr = formData[key];
        if (originalStr !== nextStr) {
            gradeUpdates[key] = nextStr ? parseFloat(nextStr) : undefined;
        }
    }

    // Merge buckets into a single Partial<Qualification>
    return Object.assign(
        {},
        trimmedUpdates,
        baseUpdates,
        dateUpdates,
        gradeUpdates
    ) as Partial<Qualification>;
}
