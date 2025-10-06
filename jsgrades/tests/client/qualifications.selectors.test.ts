import {
    buildBreadcrumb,
    findNode,
    flattenTree,
    getChildren,
    getParent,
} from '@/lib/client/qualifications/selectors';
import type { Node } from '@/types';

describe('qualifications selectors', () => {
    const nodes: Node[] = [
        {
            id: 'y1',
            qualificationId: 'q1',
            userId: 'u1',
            parentId: null,
            name: 'Year 1',
            type: 'year',
            weight: null,
            credits: 120,
            calculationMethod: 'weighted_mean',
            weightingMode: 'equal',
            roundingMode: 'none',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: true,
            inheritSettings: true,
            overrides: {},
            creditEnforcement: 'none',
            configStatus: 'partial',
            lockConfig: false,
            inProgress: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        {
            id: 'm1',
            qualificationId: 'q1',
            userId: 'u1',
            parentId: 'y1',
            name: 'Module A',
            type: 'module',
            weight: 0.5,
            credits: 15,
            calculationMethod: 'weighted_mean',
            weightingMode: 'equal',
            roundingMode: 'none',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: true,
            inheritSettings: true,
            overrides: {},
            creditEnforcement: 'none',
            configStatus: 'partial',
            lockConfig: false,
            inProgress: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'm2',
            qualificationId: 'q1',
            userId: 'u1',
            parentId: 'y1',
            name: 'Module B',
            type: 'module',
            weight: 0.5,
            credits: 15,
            calculationMethod: 'weighted_mean',
            weightingMode: 'equal',
            roundingMode: 'none',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: true,
            inheritSettings: true,
            overrides: {},
            creditEnforcement: 'none',
            configStatus: 'partial',
            lockConfig: false,
            inProgress: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        {
            id: 'a1',
            qualificationId: 'q1',
            userId: 'u1',
            parentId: 'm1',
            name: 'Exam',
            type: 'assessment',
            weight: 1,
            credits: 0,
            calculationMethod: 'weighted_mean',
            weightingMode: 'equal',
            roundingMode: 'none',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: true,
            inheritSettings: true,
            overrides: {},
            creditEnforcement: 'none',
            configStatus: 'partial',
            lockConfig: false,
            inProgress: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    it('findNode returns node by id', () => {
        expect(findNode(nodes, 'm1')?.name).toBe('Module A');
        expect(findNode(nodes, 'zzz')).toBeUndefined();
    });

    it('getParent returns direct parent', () => {
        const parent = getParent(nodes, nodes[3]);
        expect(parent?.id).toBe('m1');
        expect(getParent(nodes, nodes[0])).toBeUndefined();
    });

    it('getChildren returns children under a parent id', () => {
        const y1Children = getChildren(nodes, 'y1');
        expect(y1Children.map((n) => n.id).sort()).toEqual(['m1', 'm2']);
        const rootChildren = getChildren(nodes, null);
        expect(rootChildren.map((n) => n.id)).toEqual(['y1']);
    });

    it('buildBreadcrumb builds chain from root to node', () => {
        const chain = buildBreadcrumb(nodes, 'a1');
        expect(chain.map((n) => n.id)).toEqual(['y1', 'm1', 'a1']);
    });

    it('flattenTree returns pre-order list from a root or all roots when none provided', () => {
        const flat = flattenTree(nodes);
        expect(flat.find((n) => n.id === 'y1')).toBeDefined();
        const fromRoot = flattenTree(nodes, 'y1');
        expect(fromRoot.some((n) => n.id === 'a1')).toBe(true);
    });
});
