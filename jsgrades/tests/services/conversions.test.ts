import { describe, expect, it } from '@jest/globals';
import {
    convertQualificationToFormData,
    detectQualificationChanges,
    stringNumberOrBlankToNumber,
    stringDateOrBlankToDate,
    qualificationFormToCreatePayload,
    nodeFormToCreatePayload,
    detectNodeChanges,
} from '@/lib/client/qualifications/conversions';
import {
    mockQualification,
    mockQualificationFormData,
} from '@/__mocks__/qualification';
import type { Node } from '@/types';
describe('convertQualificationToFormData', () => {
    it('converts dates to YYYY-MM-DD and numbers to strings, preserving booleans', () => {
        const q = mockQualification();
        const fd = convertQualificationToFormData(q);
        expect(fd).toEqual({
            name: 'Mathematics',
            institution: 'Some School',
            level: 'A-Level',
            startDate: '2024-03-05',
            endDate: '2024-09-10',
            currentGrade: '75',
            targetGrade: '90',
            predictedGrade: '88',
            inProgress: true,
        });
    });

    it('handles missing/invalid dates by returning empty strings', () => {
        const q1 = mockQualification({
            startDate: undefined,
            endDate: null as unknown as Date,
        });
        const fd1 = convertQualificationToFormData(q1);
        expect(fd1.startDate).toBe('');
        expect(fd1.endDate).toBe('');

        const q2 = mockQualification({
            startDate: new Date('invalid'),
            endDate: new Date('invalid'),
        });
        const fd2 = convertQualificationToFormData(q2);
        expect(fd2.startDate).toBe('');
        expect(fd2.endDate).toBe('');
    });

    it('string fields default to empty string if falsy', () => {
        const q = mockQualification({
            name: '' as unknown as string,
            institution: '' as unknown as string,
            level: '' as unknown as string,
        });
        const fd = convertQualificationToFormData(q);
        expect(fd.name).toBe('');
        expect(fd.institution).toBe('');
        expect(fd.level).toBe('');
    });
});

describe('detectQualificationChanges', () => {
    it('returns empty object when no changes are detected', () => {
        const original = mockQualification();
        const fd = convertQualificationToFormData(original);
        const updates = detectQualificationChanges(original, fd);
        expect(updates).toEqual({});
    });

    it('applies trimmed string comparisons for name and institution', () => {
        const original = mockQualification({
            name: 'Alpha',
            institution: 'School',
        });
        const fd = mockQualificationFormData({
            name: '  Beta  ',
            institution: '  School  ',
        });
        const updates = detectQualificationChanges(original, fd);
        expect(updates).toEqual({ name: 'Beta' });
    });

    it('includes level when it changes exactly', () => {
        const original = mockQualification({ level: 'GCSE' });
        const fd = mockQualificationFormData({ level: 'A-Level' });
        const updates = detectQualificationChanges(original, fd);
        expect(updates).toEqual({ level: 'A-Level' });
    });

    it('includes inProgress when it changes', () => {
        const original = mockQualification({ inProgress: true });
        const fd = mockQualificationFormData({ inProgress: false });
        const updates = detectQualificationChanges(original, fd);
        expect(updates).toEqual({ inProgress: false });
    });

    it('updates startDate/endDate correctly', () => {
        const original = mockQualification({
            startDate: new Date('2024-03-05'),
            endDate: new Date('2024-09-10'),
        });

        const fd1 = mockQualificationFormData({
            startDate: '2024-04-01',
            endDate: '2024-10-01',
        });
        const updates1 = detectQualificationChanges(original, fd1);
        expect(updates1.startDate).toBeInstanceOf(Date);
        expect((updates1.startDate as Date).toISOString().slice(0, 10)).toBe(
            '2024-04-01'
        );
        expect(updates1.endDate).toBeInstanceOf(Date);
        expect((updates1.endDate as Date).toISOString().slice(0, 10)).toBe(
            '2024-10-01'
        );

        const fd2 = mockQualificationFormData({ startDate: '', endDate: '' });
        const updates2 = detectQualificationChanges(original, fd2);
        expect(updates2).toEqual({ startDate: undefined, endDate: undefined });

        const fd3 = mockQualificationFormData({
            startDate: '2024-03-05',
            endDate: '2024-09-10',
        });
        const updates3 = detectQualificationChanges(original, fd3);
        expect(updates3).toEqual({});
    });

    it('updates numeric grades correctly', () => {
        const original = mockQualification({
            currentGrade: 75,
            targetGrade: 90,
            predictedGrade: 88,
        });

        const fd1 = mockQualificationFormData({
            currentGrade: '80',
            predictedGrade: '87',
        });
        const updates1 = detectQualificationChanges(original, fd1);
        expect(updates1).toEqual({ currentGrade: 80, predictedGrade: 87 });

        const fd2 = mockQualificationFormData({
            currentGrade: '',
            targetGrade: '',
            predictedGrade: '',
        });
        const updates2 = detectQualificationChanges(original, fd2);
        expect(updates2).toEqual({
            currentGrade: undefined,
            targetGrade: undefined,
            predictedGrade: undefined,
        });

        const fd3 = mockQualificationFormData({
            currentGrade: '75',
            targetGrade: '90',
            predictedGrade: '88',
        });
        const updates3 = detectQualificationChanges(original, fd3);
        expect(updates3).toEqual({});
    });
});

// New helper tests
describe('conversions helpers', () => {
    it('stringNumberOrBlankToNumber parses numbers and blanks', () => {
        expect(stringNumberOrBlankToNumber(' 42 ')).toBe(42);
        expect(stringNumberOrBlankToNumber('')).toBeUndefined();
        expect(stringNumberOrBlankToNumber('  ')).toBeUndefined();
        expect(stringNumberOrBlankToNumber('abc')).toBeUndefined();
    });

    it('stringDateOrBlankToDate parses valid dates and blanks', () => {
        const d = stringDateOrBlankToDate('2024-02-29');
        expect(d).toBeInstanceOf(Date);
        expect(d?.toISOString().slice(0, 10)).toBe('2024-02-29');
        expect(stringDateOrBlankToDate('')).toBeUndefined();
        expect(stringDateOrBlankToDate('not-a-date')).toBeUndefined();
    });

    it('qualificationFormToCreatePayload builds NewQualification', () => {
        const fd = mockQualificationFormData({
            name: '  Maths  ',
            institution: '  School  ',
            startDate: '2024-01-01',
            endDate: '',
            currentGrade: '75',
            targetGrade: '90',
            predictedGrade: '',
        });
        const payload = qualificationFormToCreatePayload(fd, 'user-1');
        expect(payload).toEqual({
            userId: 'user-1',
            level: fd.level,
            name: 'Maths',
            institution: 'School',
            startDate: new Date('2024-01-01'),
            endDate: undefined,
            currentGrade: 75,
            targetGrade: 90,
            predictedGrade: undefined,
            inProgress: fd.inProgress,
        });
    });
});

// Node conversions
describe('node conversions', () => {
    function makeNode(overrides: Partial<Node> = {}): Node {
        const base: Node = {
            id: 'n1',
            qualificationId: 'q1',
            userId: 'u1',
            parentId: null,
            name: 'Root',
            type: 'mod',
            weight: null,
            credits: 15,
            calculationMethod: 'weighted_mean',
            weightingMode: 'percent',
            roundingMode: 'nearest',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: false,
            inheritSettings: true,
            overrides: {},
            creditEnforcement: 'none',
            configStatus: 'valid',
            lockConfig: false,
            currentGrade: 72,
            targetGrade: 80,
            predictedGrade: 75,
            inProgress: true,
            startDate: new Date('2024-01-01T00:00:00.000Z'),
            endDate: new Date('2024-06-01T00:00:00.000Z'),
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        };
        return { ...base, ...overrides };
    }

    it('nodeFormToCreatePayload builds newNode payload', () => {
        const payload = nodeFormToCreatePayload({
            qualificationId: 'q1',
            userId: 'u1',
            parentId: 'n1',
            name: ' Exam ',
            type: { id: 'ass', name: 'Assessment', allowChildren: false },
            weight: 60,
            credits: 0,
            startDate: '',
            endDate: '',
            targetGrade: '',
            currentGrade: '',
            predictedGrade: '',
            inProgress: true,
        });
        expect(payload).toEqual({
            newNode: {
                parentId: 'n1',
                type: 'ass',
                name: 'Exam',
                credits: undefined,
                weight: 60,
                qualificationId: 'q1',
            },
        });
    });

    it('detectNodeChanges returns only changed fields', () => {
        const original = makeNode();
        const updates = detectNodeChanges(original, {
            qualificationId: 'q1',
            userId: 'u1',
            parentId: '',
            name: ' Root ',
            type: { id: 'mod', name: 'Module', allowChildren: true },
            weight: 15,
            credits: 15,
            startDate: '2024-01-01',
            endDate: '2024-06-01',
            targetGrade: '80',
            currentGrade: '72',
            predictedGrade: '75',
            inProgress: true,
        });
        // Only weight changed from null->15
        expect(updates).toEqual({ weight: 15 });

        const updates2 = detectNodeChanges(original, {
            qualificationId: 'q1',
            userId: 'u1',
            parentId: '',
            name: ' Updated ',
            type: { id: 'ass', name: 'Assessment', allowChildren: false },
            weight: 0,
            credits: 20,
            startDate: '2024-02-01',
            endDate: '',
            targetGrade: '',
            currentGrade: '80',
            predictedGrade: '',
            inProgress: false,
        });
        expect(updates2).toEqual({
            name: 'Updated',
            type: 'ass',
            credits: 20,
            weight: undefined,
            startDate: new Date('2024-02-01'),
            endDate: undefined,
            currentGrade: 80,
            targetGrade: undefined,
            predictedGrade: undefined,
            inProgress: false,
        });
    });
});
