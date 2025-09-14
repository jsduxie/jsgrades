// Helpers for mocking qualification node-related data
import type { QualificationNodeFormData, QualificationNodeType } from '@/types';

export function mockNodeTypes(): QualificationNodeType[] {
    return [
        { id: 'mod', name: 'Module', allowChildren: true },
        { id: 'ass', name: 'Assessment', allowChildren: false },
    ];
}

export function mockNodeFormData(
    overrides: Partial<QualificationNodeFormData> = {}
): QualificationNodeFormData {
    const base: QualificationNodeFormData = {
        qualificationId: 'q1',
        userId: 'u1',
        parentId: 'p1',
        name: 'Node Name',
        type: { id: 'mod', name: 'Module', allowChildren: true },
        weight: 50,
        credits: 15,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        targetGrade: '85',
        currentGrade: '75',
        predictedGrade: '80',
        inProgress: true,
    };
    return { ...base, ...overrides };
}
