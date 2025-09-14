import {
    createQualificationActions,
    type ActionsDeps,
} from '@/context/qualification/actions';
import type {
    APIResponse,
    Qualification,
    QualificationLevel,
    QualificationNodeType,
    Node,
    NodeSummary,
} from '@/types';

jest.mock('@/lib/client/qualifications/qualifications.api', () => ({
    fetchQualifications: jest.fn(),
    fetchQualificationLevels: jest.fn(),
    createQualification: jest.fn(),
    updateQualification: jest.fn(),
    deleteQualification: jest.fn(),
}));

jest.mock('@/lib/client/qualifications/nodes.api', () => ({
    fetchNodeTypes: jest.fn(),
    fetchNodes: jest.fn(),
    fetchNodeSummary: jest.fn(),
    createNode: jest.fn(),
    updateNode: jest.fn(),
    deleteNode: jest.fn(),
    updateGrade: jest.fn(),
    updateWeights: jest.fn(),
    validateNode: jest.fn(),
}));

import * as qapi from '@/lib/client/qualifications/qualifications.api';
import * as napi from '@/lib/client/qualifications/nodes.api';

function ok<T>(data: T, message = 'ok'): APIResponse<T> {
    return { status: 'success', message, data };
}

function okNull(message = 'ok'): APIResponse<null> {
    return { status: 'success', message, data: null };
}

describe('qualification actions', () => {
    const token = { token: 'tkn' };

    let state: {
        qualifications: Qualification[];
        levels: QualificationLevel[];
        nodeTypes: QualificationNodeType[];
        nodes: Node[];
        summary: NodeSummary | null;
        currentQid: string | null;
        currentNid: string | null;
        navigation: string[];
        loading: boolean;
        loadingNodes: boolean;
    };

    let deps: ActionsDeps;

    beforeEach(() => {
        jest.resetAllMocks();
        state = {
            qualifications: [],
            levels: [],
            nodeTypes: [],
            nodes: [],
            summary: null,
            currentQid: null,
            currentNid: null,
            navigation: [],
            loading: false,
            loadingNodes: false,
        };
        deps = {
            getAuthOptions: async () => token,
            getUserId: () => 'u1',
            getCurrentIds: () => ({
                qualificationId: state.currentQid,
                nodeId: state.currentNid,
            }),
            setLoading: (v) => {
                state.loading = v;
            },
            setLoadingNodes: (v) => {
                state.loadingNodes = v;
            },
            setQualifications: (updater) => {
                state.qualifications = updater(state.qualifications);
            },
            setQualificationLevels: (levels) => {
                state.levels = levels;
            },
            setQualificationNodeTypes: (types) => {
                state.nodeTypes = types;
            },
            setNodeHierarchy: (v) => {
                state.nodes =
                    typeof v === 'function'
                        ? (v as (p: Node[]) => Node[])(state.nodes)
                        : v;
            },
            setCurrentNodeSummary: (s) => {
                state.summary = s;
            },
            setCurrentQualificationId: (id) => {
                state.currentQid = id;
            },
            setCurrentNodeId: (id) => {
                state.currentNid = id;
            },
            setNavigation: (ids) => {
                state.navigation = ids;
            },
        };
    });

    it('refreshQualifications loads and sets state', async () => {
        const actions = createQualificationActions(deps);
        const sample: Qualification[] = [
            {
                id: 'q1',
                userId: 'u1',
                level: 'A',
                name: 'Maths',
                institution: 'Inst',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-06-01'),
                currentGrade: 70,
                targetGrade: 90,
                predictedGrade: 80,
                inProgress: true,
                created: new Date('2024-01-01'),
                updated: new Date('2024-01-01'),
            },
        ];
        (qapi.fetchQualifications as jest.Mock).mockResolvedValue(ok(sample));
        await actions.refreshQualifications();
        expect(state.loading).toBe(false);
        expect(state.qualifications).toEqual(sample);
        expect(qapi.fetchQualifications).toHaveBeenCalledWith('u1', token);
    });

    it('addQualification appends and updateQualification modifies', async () => {
        const actions = createQualificationActions(deps);
        const created: Qualification = {
            id: 'q2',
            userId: 'u1',
            level: 'B',
            name: 'Physics',
            institution: 'Inst',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-01'),
            currentGrade: 75,
            targetGrade: 95,
            predictedGrade: 85,
            inProgress: true,
            created: new Date('2024-01-02'),
            updated: new Date('2024-01-02'),
        };
        (qapi.createQualification as jest.Mock).mockResolvedValue(ok(created));
        await actions.addQualification({
            level: 'B',
            name: 'Physics',
            institution: 'Inst',
        });
        expect(state.qualifications).toEqual([created]);

        const updated = { ...created, name: 'Advanced Physics' };
        (qapi.updateQualification as jest.Mock).mockResolvedValue(ok(updated));
        state.currentQid = 'q2';
        await actions.updateQualification({ name: 'Advanced Physics' });
        expect(state.qualifications[0].name).toBe('Advanced Physics');
    });

    it('deleteQualification removes and resets when deleting current', async () => {
        const actions = createQualificationActions(deps);
        state.qualifications = [
            {
                id: 'q3',
                userId: 'u1',
                level: 'C',
                name: 'Chemistry',
                institution: 'Inst',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-06-01'),
                currentGrade: null,
                targetGrade: null,
                predictedGrade: null,
                inProgress: true,
                created: new Date('2024-01-01'),
                updated: new Date('2024-01-01'),
            },
        ];
        state.currentQid = 'q3';
        (qapi.deleteQualification as jest.Mock).mockResolvedValue(
            okNull('deleted')
        );
        await actions.deleteQualification('q3');
        expect(state.qualifications).toEqual([]);
        expect(state.currentQid).toBeNull();
        expect(state.currentNid).toBeNull();
        expect(state.navigation).toEqual([]);
    });

    it('refreshNodes and fetchNodeSummary update nodes and summary', async () => {
        const actions = createQualificationActions(deps);
        state.currentQid = 'q1';
        const nodes: Node[] = [
            {
                id: 'n1',
                qualificationId: 'q1',
                userId: 'u1',
                parentId: null,
                name: 'Root',
                type: 'mod',
                weight: null,
                credits: 10,
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
                currentGrade: null,
                targetGrade: null,
                predictedGrade: null,
                inProgress: true,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-06-01'),
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
        ];
        (napi.fetchNodes as jest.Mock).mockResolvedValue(ok(nodes));
        await actions.refreshNodes();
        expect(state.loadingNodes).toBe(false);
        expect(state.nodes).toEqual(nodes);

        const summary: NodeSummary = {
            node: nodes[0],
            aggregate: {
                nodeId: 'n1',
                aggActual: null,
                aggPredicted: null,
                aggCompletionRatio: 0,
                childCounts: {},
                effectiveSettings: {
                    calculationMethod: 'weighted_mean',
                    weightingMode: 'percent',
                    roundingMode: 'nearest',
                    roundingPrecision: 2,
                    excludeIncompleteFromPredicted: false,
                    inheritSettings: true,
                    overrides: {},
                    creditEnforcement: 'none',
                },
                creditSumExpected: null,
                creditSumActual: null,
                configCoverage: 1,
                validationCodes: [],
                validationMeta: {},
                classificationActual: null,
                classificationPredicted: null,
                lastComputedAt: new Date('2024-01-01'),
            },
            effectiveSettings: {
                calculationMethod: 'weighted_mean',
                weightingMode: 'percent',
                roundingMode: 'nearest',
                roundingPrecision: 2,
                excludeIncompleteFromPredicted: false,
                inheritSettings: true,
                overrides: {},
                creditEnforcement: 'none',
            },
        };
        (napi.fetchNodeSummary as jest.Mock).mockResolvedValue(ok(summary));
        await actions.fetchNodeSummary('n1');
        expect(state.summary).toEqual(summary);
    });
});
