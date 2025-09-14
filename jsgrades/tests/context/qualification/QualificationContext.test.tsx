import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    QualificationProvider,
    useQualification,
} from '@/context/QualificationContext';

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        currentUser: null,
        userLoggedIn: true,
        loading: false,
        userDetails: { id: 'u1' },
    })),
}));

jest.mock('@/lib/client/qualifications/selectors', () => ({
    buildBreadcrumb: jest.fn(() => [{ id: 'A' }, { id: 'B' }]),
}));

const actionSpies = {
    refreshQualifications: jest.fn(),
    fetchQualificationLevels: jest.fn(),
    fetchQualificationNodeTypes: jest.fn(),
    refreshNodes: jest.fn(),
    fetchNodeSummary: jest.fn(),
    addQualification: jest.fn(),
    updateQualification: jest.fn(),
    deleteQualification: jest.fn(),
    createNode: jest.fn(),
    updateNode: jest.fn(),
    deleteNode: jest.fn(),
    updateGrade: jest.fn(),
    updateWeights: jest.fn(),
    validateNode: jest.fn(async () => ({
        issues: [],
        configStatus: 'valid',
        coverage: 1,
    })),
};

jest.mock('@/context/qualification/actions', () => ({
    createQualificationActions: jest.fn(() => actionSpies),
}));

function captureContext(): ReturnType<typeof useQualification> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let captured: any;
    function Consumer() {
        captured = useQualification();
        return null as unknown as React.ReactElement;
    }
    ReactDOMServer.renderToString(
        <QualificationProvider>
            <Consumer />
        </QualificationProvider>
    );
    return captured;
}

describe('QualificationContext wrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('exposes the expected API surface', () => {
        const ctx = captureContext();

        expect(ctx).toHaveProperty('qualifications');
        expect(ctx).toHaveProperty('currentQualificationId');
        expect(ctx).toHaveProperty('qualificationLevels');
        expect(ctx).toHaveProperty('qualificationNodeTypes');
        expect(ctx).toHaveProperty('currentNodeId');
        expect(ctx).toHaveProperty('navigation');
        expect(ctx).toHaveProperty('nodeHierarchy');
        expect(ctx).toHaveProperty('currentNodeSummary');
        expect(ctx).toHaveProperty('loading');
        expect(ctx).toHaveProperty('loadingNodes');

        [
            'setCurrentQualification',
            'setCurrentNode',
            'addQualification',
            'updateQualification',
            'deleteQualification',
            'createNode',
            'updateNode',
            'deleteNode',
            'updateGrade',
            'updateWeights',
            'validateNode',
            'navigateToNode',
            'navigateBack',
            'getBreadcrumbPath',
            'refreshQualifications',
            'refreshNodes',
        ].forEach((key) => expect(typeof ctx[key]).toBe('function'));
    });

    it('delegates to actions for CRUD and refresh methods', async () => {
        const ctx = captureContext();

        await ctx.refreshQualifications();
        expect(actionSpies.refreshQualifications).toHaveBeenCalledTimes(1);

        await ctx.refreshNodes('q1');
        expect(actionSpies.refreshNodes).toHaveBeenCalledWith('q1');

        await ctx.addQualification({
            name: 'Maths',
            level: 'A',
            institution: 'Inst',
        });
        expect(actionSpies.addQualification).toHaveBeenCalledWith({
            name: 'Maths',
            level: 'A',
            institution: 'Inst',
        });

        await ctx.updateQualification({ name: 'Maths 2' }, 'q1');
        expect(actionSpies.updateQualification).toHaveBeenCalledWith(
            { name: 'Maths 2' },
            'q1'
        );

        await ctx.deleteQualification('q1');
        expect(actionSpies.deleteQualification).toHaveBeenCalledWith('q1');

        await ctx.createNode({
            parentId: 'n0',
            type: 'mod',
            name: 'Child',
            qualificationId: 'q1',
        });
        expect(actionSpies.createNode).toHaveBeenCalledWith({
            parentId: 'n0',
            type: 'mod',
            name: 'Child',
            qualificationId: 'q1',
        });

        await ctx.updateNode('n1', { name: 'Updated' });
        expect(actionSpies.updateNode).toHaveBeenCalledWith('n1', {
            name: 'Updated',
        });

        await ctx.deleteNode('n1');
        expect(actionSpies.deleteNode).toHaveBeenCalledWith('n1');

        await ctx.updateGrade({
            nodeId: 'n1',
            kind: 'actual',
            value: 80,
            completed: true,
        });
        expect(actionSpies.updateGrade).toHaveBeenCalledWith({
            nodeId: 'n1',
            kind: 'actual',
            value: 80,
            completed: true,
        });

        await ctx.updateWeights('n0', {
            mode: 'percent',
            items: [{ childId: 'n1', value: 60 }],
        });
        expect(actionSpies.updateWeights).toHaveBeenCalledWith('n0', {
            mode: 'percent',
            items: [{ childId: 'n1', value: 60 }],
        });

        const v = await ctx.validateNode('n1');
        expect(actionSpies.validateNode).toHaveBeenCalledWith('n1');
        expect(v.configStatus).toBe('valid');
    });
});
