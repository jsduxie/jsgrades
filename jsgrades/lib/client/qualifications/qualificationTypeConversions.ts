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

    if (original.name !== formData.name.trim()) {
        updates.name = formData.name.trim();
    }

    if (original.institution !== formData.institution.trim()) {
        updates.institution = formData.institution.trim();
    }

    if (original.level !== formData.level) {
        updates.level = formData.level;
    }

    if (original.inProgress !== formData.inProgress) {
        updates.inProgress = formData.inProgress;
    }

    const originalStartDate = formatDateForInput(original.startDate);
    if (originalStartDate !== formData.startDate) {
        updates.startDate = formData.startDate
            ? new Date(formData.startDate)
            : undefined;
    }

    const originalEndDate = formatDateForInput(original.endDate);
    if (originalEndDate !== formData.endDate) {
        updates.endDate = formData.endDate
            ? new Date(formData.endDate)
            : undefined;
    }

    const originalCurrentGrade = original.currentGrade?.toString() ?? '';
    if (originalCurrentGrade !== formData.currentGrade) {
        updates.currentGrade = formData.currentGrade
            ? parseFloat(formData.currentGrade)
            : undefined;
    }

    const originalTargetGrade = original.targetGrade?.toString() ?? '';
    if (originalTargetGrade !== formData.targetGrade) {
        updates.targetGrade = formData.targetGrade
            ? parseFloat(formData.targetGrade)
            : undefined;
    }

    const originalPredictedGrade = original.predictedGrade?.toString() ?? '';
    if (originalPredictedGrade !== formData.predictedGrade) {
        updates.predictedGrade = formData.predictedGrade
            ? parseFloat(formData.predictedGrade)
            : undefined;
    }

    return updates;
}
