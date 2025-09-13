import { describe, expect, it } from '@jest/globals';
import {
    convertQualificationToFormData,
    detectQualificationChanges,
} from '@/lib/client/qualifications/qualificationTypeConversions';
import { mockQualification, mockQualificationFormData, } from '@/__mocks__/qualification';

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
        // name changed -> trimmed new value; institution same after trim -> no update
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

    it('updates startDate/endDate when changed, sets Date object; removes when blank', () => {
        const original = mockQualification({
            startDate: new Date('2024-03-05'),
            endDate: new Date('2024-09-10'),
        });

        // Change both dates
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

        // Remove both dates
        const fd2 = mockQualificationFormData({ startDate: '', endDate: '' });
        const updates2 = detectQualificationChanges(original, fd2);
        expect(updates2).toEqual({ startDate: undefined, endDate: undefined });

        // Unchanged (no update)
        const fd3 = mockQualificationFormData({
            startDate: '2024-03-05',
            endDate: '2024-09-10',
        });
        const updates3 = detectQualificationChanges(original, fd3);
        expect(updates3).toEqual({});
    });

    it('updates numeric grades when changed, removes when blank, leaves untouched when equivalent', () => {
        const original = mockQualification({
            currentGrade: 75,
            targetGrade: 90,
            predictedGrade: 88,
        });

        // Change two values
        const fd1 = mockQualificationFormData({
            currentGrade: '80',
            predictedGrade: '87',
        });
        const updates1 = detectQualificationChanges(original, fd1);
        expect(updates1).toEqual({ currentGrade: 80, predictedGrade: 87 });

        // Remove values (empty string -> undefined)
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

        // Equivalent string vs number -> no update
        const fd3 = mockQualificationFormData({
            currentGrade: '75',
            targetGrade: '90',
            predictedGrade: '88',
        });
        const updates3 = detectQualificationChanges(original, fd3);
        expect(updates3).toEqual({});
    });
});
