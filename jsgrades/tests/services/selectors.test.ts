import {
    buildBreadcrumb,
    findNode,
    getChildren,
    getParent,
    flattenTree,
} from '@/lib/client/qualifications/selectors';
import { makeNode } from '@/__mocks__/nodes';
import type { Node as QNode } from '@/types';

describe('qualification selectors', () => {
    const A = () => makeNode({ id: 'A', name: 'A', parentId: null });
    const B = () => makeNode({ id: 'B', name: 'B', parentId: 'A' });
    const C = () => makeNode({ id: 'C', name: 'C', parentId: 'B' });
    const D = () => makeNode({ id: 'D', name: 'D', parentId: 'A' });
    const E = () => makeNode({ id: 'E', name: 'E', parentId: null });

    it('findNode returns node by id', () => {
        const nodes = [A(), B(), C()];
        expect(findNode(nodes, 'B')?.name).toBe('B');
        expect(findNode(nodes, 'Z')).toBeUndefined();
    });

    it('getParent returns direct parent or undefined for root', () => {
        const nodes = [A(), B(), C()];
        const b = findNode(nodes, 'B')!;
        const c = findNode(nodes, 'C')!;
        const a = findNode(nodes, 'A')!;
        expect(getParent(nodes, b)?.id).toBe('A');
        expect(getParent(nodes, c)?.id).toBe('B');
        expect(getParent(nodes, a)).toBeUndefined();
    });

    it('getChildren returns children for a parent id and preserves input order', () => {
        const nodes = [A(), D(), B(), C()];
        const childrenOfA = getChildren(nodes, 'A');
        expect(childrenOfA.map((n) => n.id)).toEqual(['D', 'B']);
        const roots = getChildren(nodes, null);
        expect(roots.map((n) => n.id)).toEqual(['A']);
    });

    it('buildBreadcrumb returns path from root to target and handles missing node/parent', () => {
        const nodes = [A(), B(), C(), D(), E()];
        expect(buildBreadcrumb(nodes, 'C').map((n) => n.id)).toEqual([
            'A',
            'B',
            'C',
        ]);
        expect(buildBreadcrumb(nodes, 'E').map((n) => n.id)).toEqual(['E']);
        expect(buildBreadcrumb(nodes, 'Z')).toEqual([]);

        const nodesBroken = [makeNode({ id: 'X', name: 'X', parentId: 'Z' })];
        expect(buildBreadcrumb(nodesBroken, 'X').map((n) => n.id)).toEqual([
            'X',
        ]);
    });

    it('flattenTree pre-order traversal with and without rootId', () => {
        const nodes = [A(), B(), C(), D(), E()];
        expect(flattenTree(nodes, 'A').map((n) => n.id)).toEqual([
            'A',
            'B',
            'C',
            'D',
        ]);

        expect(flattenTree(nodes).map((n) => n.id)).toEqual([
            'A',
            'B',
            'C',
            'D',
            'E',
        ]);
    });

    it('buildBreadcrumb handles cycles gracefully (A<->B)', () => {
        const Acyc = makeNode({ id: 'A', name: 'A', parentId: 'B' });
        const Bcyc = makeNode({ id: 'B', name: 'B', parentId: 'A' });
        const nodes = [Acyc, Bcyc];
        // Expected to stop when encountering a visited node; path will be [B, A]
        expect(buildBreadcrumb(nodes, 'A').map((n) => n.id)).toEqual([
            'B',
            'A',
        ]);
        expect(buildBreadcrumb(nodes, 'B').map((n) => n.id)).toEqual([
            'A',
            'B',
        ]);
    });

    it('buildBreadcrumb handles self-parent gracefully', () => {
        const X = makeNode({ id: 'X', name: 'X', parentId: 'X' });
        expect(buildBreadcrumb([X], 'X').map((n) => n.id)).toEqual(['X']);
    });

    it('flattenTree handles cycles without infinite recursion', () => {
        const Acyc = makeNode({ id: 'A', name: 'A', parentId: 'B' });
        const Bcyc = makeNode({ id: 'B', name: 'B', parentId: 'A' });
        // Start from A explicitly since there are no roots (both have parents)
        expect(flattenTree([Acyc, Bcyc], 'A').map((n) => n.id)).toEqual([
            'A',
            'B',
        ]);
    });

    it('flattenTree returns empty for unknown rootId and respects undefined/null roots', () => {
        const nodes = [A(), B(), C(), E()];
        // Unknown root
        expect(flattenTree(nodes, 'Z')).toEqual([]);
        // undefined should be equivalent to omitting rootId and list all roots
        expect(flattenTree(nodes).map((n) => n.id)).toEqual([
            'A',
            'B',
            'C',
            'E',
        ]);
        // getChildren(undefined) should return roots as well
        expect(getChildren(nodes, undefined).map((n) => n.id)).toEqual([
            'A',
            'E',
        ]);
        expect(getChildren(nodes, null).map((n) => n.id)).toEqual(['A', 'E']);
    });

    it('buildBreadcrumb supports deep chains', () => {
        const chain: QNode[] = [];
        let parentId: string | null = null;
        for (let i = 1; i <= 10; i++) {
            const id = `N${i}`;
            chain.push(makeNode({ id, name: id, parentId }));
            parentId = id;
        }

        expect(buildBreadcrumb(chain, 'N10').map((n) => n.id)).toEqual([
            'N1',
            'N2',
            'N3',
            'N4',
            'N5',
            'N6',
            'N7',
            'N8',
            'N9',
            'N10',
        ]);
    });
});
