import {
    filterNodeTypesByNames,
    getAllowedChildTypeNames,
    getUiLabelForType,
    resolveLevelNumber,
} from '@/lib/client/qualifications/structure';
import type {
    Qualification,
    QualificationLevel,
    QualificationNodeType,
} from '@/types';

describe('structure helpers', () => {
    const nodeTypes: QualificationNodeType[] = [
        { id: 'year-id', name: 'year', allowChildren: true },
        { id: 'module-id', name: 'module', allowChildren: true },
        { id: 'assessment-id', name: 'assessment', allowChildren: false },
    ];

    it('top-level allowed types: degree (L6) -> year', () => {
        expect(getAllowedChildTypeNames(6, null)).toEqual(['year']);
    });

    it('top-level allowed types: masters (L7) -> module', () => {
        expect(getAllowedChildTypeNames(7, null)).toEqual(['module']);
    });

    it('top-level allowed types: GCSE (L2) -> module', () => {
        expect(getAllowedChildTypeNames(2, null)).toEqual(['module']);
    });

    it('child flow year -> module; module -> assessment', () => {
        expect(getAllowedChildTypeNames(6, 'year')).toEqual(['module']);
        expect(getAllowedChildTypeNames(6, 'module')).toEqual(['assessment']);
        expect(getAllowedChildTypeNames(6, 'assessment')).toEqual([]);
    });

    it('UI label uses subject for module at L2-3', () => {
        expect(getUiLabelForType(2, 'module')).toBe('subject');
        expect(getUiLabelForType(3, 'module')).toBe('subject');
        expect(getUiLabelForType(4, 'module')).toBe('module');
        expect(getUiLabelForType(6, 'year')).toBe('year');
    });

    it('filter node types by allowed names', () => {
        const filtered = filterNodeTypesByNames(nodeTypes, ['module']);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('module');
    });

    it('resolve level number from qualification + levels', () => {
        const levels: QualificationLevel[] = [
            { id: 'lvl2', name: 'GCSE', level: 2 },
            { id: 'lvl6', name: 'Bachelors', level: 6 },
        ];
        const q: Qualification = {
            id: 'q1',
            userId: 'u1',
            level: 'lvl6',
            name: 'CS BSc',
            institution: 'Uni',
            inProgress: true,
            created: new Date(),
            updated: new Date(),
        };
        expect(resolveLevelNumber(levels, q)).toBe(6);
        expect(resolveLevelNumber(levels, null)).toBeNull();
    });
});
