import type { Qualification, QualificationFormData } from '@/types';

export function mockQualification(
    overrides: Partial<Qualification> = {}
): Qualification {
    const base: Qualification = {
        id: 'q1',
        userId: 'u1',
        level: 'A-Level',
        name: 'Mathematics',
        institution: 'Some School',
        startDate: new Date('2024-03-05T12:34:56.000Z'),
        endDate: new Date('2024-09-10T00:00:00.000Z'),
        currentGrade: 75,
        targetGrade: 90,
        predictedGrade: 88,
        inProgress: true,
        created: new Date('2024-01-01T00:00:00.000Z'),
        updated: new Date('2024-01-02T00:00:00.000Z'),
    };
    return { ...base, ...overrides };
}

export function mockQualificationFormData(
    overrides: Partial<QualificationFormData> = {}
): QualificationFormData {
    const base: QualificationFormData = {
        name: 'Mathematics',
        institution: 'Some School',
        level: 'A-Level',
        startDate: '2024-03-05',
        endDate: '2024-09-10',
        currentGrade: '75',
        targetGrade: '90',
        predictedGrade: '88',
        inProgress: true,
    };
    return { ...base, ...overrides };
}
