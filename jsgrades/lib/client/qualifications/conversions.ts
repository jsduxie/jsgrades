import type {
    Qualification,
    QualificationFormData,
    NewQualification,
    QualificationNodeFormData,
} from '@/types/qualification';
import type { Node } from '@/types/qualificationNode';

function formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    try {
        if (typeof date === 'string') {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            return dateObj.toISOString().slice(0, 10);
        }
        if (isNaN((date as Date).getTime())) return '';
        return (date as Date).toISOString().slice(0, 10);
    } catch {
        return '';
    }
}

export function convertQualificationToFormData(
    q: Qualification
): QualificationFormData {
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

export function stringNumberOrBlankToNumber(value: string): number | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
}

export function stringDateOrBlankToDate(value: string): Date | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? undefined : d;
}

export function qualificationFormToCreatePayload(
    form: QualificationFormData,
    userId: string
): NewQualification {
    return {
        userId,
        level: form.level,
        name: form.name.trim(),
        institution: form.institution.trim(),
        startDate: stringDateOrBlankToDate(form.startDate),
        endDate: stringDateOrBlankToDate(form.endDate),
        currentGrade: stringNumberOrBlankToNumber(form.currentGrade),
        targetGrade: stringNumberOrBlankToNumber(form.targetGrade),
        predictedGrade: stringNumberOrBlankToNumber(form.predictedGrade),
        inProgress: form.inProgress,
    };
}

export function detectQualificationChanges(
    original: Qualification,
    formData: QualificationFormData
): Partial<Qualification> {
    const updates: Partial<Qualification> = {};

    // Trimmed string fields
    const name = formData.name.trim();
    if (original.name !== name) updates.name = name;
    const institution = formData.institution.trim();
    if (original.institution !== institution) updates.institution = institution;

    // Simple fields
    if (original.level !== formData.level) updates.level = formData.level;
    if (original.inProgress !== formData.inProgress)
        updates.inProgress = formData.inProgress;

    // Dates
    const originalStart = formatDateForInput(original.startDate);
    const nextStart = formData.startDate;
    if (originalStart !== nextStart)
        updates.startDate = stringDateOrBlankToDate(nextStart);

    const originalEnd = formatDateForInput(original.endDate);
    const nextEnd = formData.endDate;
    if (originalEnd !== nextEnd)
        updates.endDate = stringDateOrBlankToDate(nextEnd);

    // Numbers
    const cur = stringNumberOrBlankToNumber(formData.currentGrade);
    const tgt = stringNumberOrBlankToNumber(formData.targetGrade);
    const pred = stringNumberOrBlankToNumber(formData.predictedGrade);

    if ((original.currentGrade ?? undefined) !== cur)
        updates.currentGrade = cur;
    if ((original.targetGrade ?? undefined) !== tgt) updates.targetGrade = tgt;
    if ((original.predictedGrade ?? undefined) !== pred)
        updates.predictedGrade = pred;

    return updates;
}

export function nodeFormToCreatePayload(form: QualificationNodeFormData): {
    newNode: {
        parentId: string;
        type: string;
        name: string;
        credits?: number;
        weight?: number;
        qualificationId: string;
    };
} {
    const newNode = {
        parentId: form.parentId,
        type: form.type?.id ?? '',
        name: form.name.trim(),
        credits: form.credits || undefined,
        weight: form.weight || undefined,
        qualificationId: form.qualificationId,
    };
    return { newNode };
}

export function detectNodeChanges(
    original: Node,
    form: QualificationNodeFormData
): Partial<Node> {
    const updates: Partial<Node> = {};

    const name = form.name.trim();
    if (original.name !== name) updates.name = name;

    const typeId = form.type?.id;
    if (typeId && original.type !== typeId) updates.type = typeId;

    if ((original.credits ?? undefined) !== (form.credits || undefined))
        updates.credits = form.credits || undefined;
    if ((original.weight ?? undefined) !== (form.weight || undefined))
        updates.weight = form.weight || undefined;

    // Dates
    const startNext = stringDateOrBlankToDate(form.startDate);
    const endNext = stringDateOrBlankToDate(form.endDate);
    const origStart = original.startDate ?? undefined;
    const origEnd = original.endDate ?? undefined;

    const origStartISO = origStart ? origStart.toISOString().slice(0, 10) : '';
    const nextStartISO = startNext ? startNext.toISOString().slice(0, 10) : '';
    if (origStartISO !== nextStartISO) updates.startDate = startNext;

    const origEndISO = origEnd ? origEnd.toISOString().slice(0, 10) : '';
    const nextEndISO = endNext ? endNext.toISOString().slice(0, 10) : '';
    if (origEndISO !== nextEndISO) updates.endDate = endNext;

    // Grades
    const current = stringNumberOrBlankToNumber(form.currentGrade);
    const target = stringNumberOrBlankToNumber(form.targetGrade);
    const predicted = stringNumberOrBlankToNumber(form.predictedGrade);

    if ((original.currentGrade ?? undefined) !== current)
        updates.currentGrade = current;
    if ((original.targetGrade ?? undefined) !== target)
        updates.targetGrade = target;
    if ((original.predictedGrade ?? undefined) !== predicted)
        updates.predictedGrade = predicted;

    if (original.inProgress !== form.inProgress)
        updates.inProgress = form.inProgress;

    return updates;
}
