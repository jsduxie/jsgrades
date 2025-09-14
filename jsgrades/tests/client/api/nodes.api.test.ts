import {
    createNode,
    deleteNode,
    fetchNodes,
    fetchNodeSummary,
    fetchNodeTypes,
    updateGrade,
    updateNode,
    updateWeights,
    validateNode,
} from '@/lib/client/qualifications/nodes.api';
import type {
    APIResponse,
    NewNode,
    Node,
    NodeAggregate,
    NodeSettings,
    NodeSummary,
    QualificationNodeType,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types';

function mockResponse<T>(data: T, message = 'ok', status = 200): Response {
    const body: APIResponse<T> = { status: 'success', message, data };
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: message,
        json: async () => body,
    } as unknown as Response;
}

describe('client nodes.api', () => {
    const fetchSpy = global.fetch as unknown as jest.Mock;
    const auth = { token: 'tkn' };

    beforeEach(() => {
        fetchSpy.mockReset();
    });

    const nodeTypes: QualificationNodeType[] = [
        { id: 'mod', name: 'Module', allowChildren: true },
        { id: 'ass', name: 'Assessment', allowChildren: false },
    ];

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

    function makeAggregate(
        overrides: Partial<NodeAggregate> = {}
    ): NodeAggregate {
        const base: NodeAggregate = {
            nodeId: 'n1',
            aggActual: 72,
            aggPredicted: 75,
            aggCompletionRatio: 0.5,
            childCounts: { mod: 2, ass: 4 },
            effectiveSettings: {
                calculationMethod: 'weighted_mean',
                weightingMode: 'percent',
                roundingMode: 'nearest',
                roundingPrecision: 2,
                excludeIncompleteFromPredicted: false,
                inheritSettings: true,
                overrides: {},
                creditEnforcement: 'none',
            } as NodeSettings,
            creditSumExpected: 30,
            creditSumActual: 15,
            configCoverage: 1,
            validationCodes: [],
            validationMeta: {},
            classificationActual: null,
            classificationPredicted: null,
            lastComputedAt: new Date('2024-01-02T00:00:00.000Z'),
        };
        return { ...base, ...overrides };
    }

    it('fetchNodeTypes returns types', async () => {
        fetchSpy.mockResolvedValue(mockResponse(nodeTypes));
        const res = await fetchNodeTypes(auth);
        expect(res.data).toEqual(nodeTypes);
    });

    it('fetchNodes returns nodes for qualification', async () => {
        const nodes = [
            makeNode(),
            makeNode({ id: 'n2', name: 'Child', parentId: 'n1' }),
        ];
        fetchSpy.mockResolvedValue(mockResponse(nodes));
        const res = await fetchNodes('q1', auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes?qualificationId=q1',
            expect.any(Object)
        );
        expect(res.data).toEqual(nodes);
    });

    it('fetchNodeSummary returns summary', async () => {
        const node = makeNode();
        const aggregate = makeAggregate();
        const summary: NodeSummary = {
            node,
            aggregate,
            effectiveSettings: aggregate.effectiveSettings,
        };
        fetchSpy.mockResolvedValue(mockResponse(summary));
        const res = await fetchNodeSummary('n1', auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1/summary',
            expect.any(Object)
        );
        expect(res.data).toEqual(summary);
    });

    it('createNode posts payload and returns created node wrapper', async () => {
        const input: NewNode = {
            parentId: 'n1',
            type: 'ass',
            name: 'Exam',
            credits: 0,
            weight: 60,
            qualificationId: 'q1',
        };
        const created = makeNode({
            id: 'n3',
            parentId: 'n1',
            name: 'Exam',
            type: 'ass',
            weight: 60,
            credits: 0,
        });
        const payload: APIResponse<{ node: Node; aggregate: unknown }> = {
            status: 'success',
            message: 'created',
            data: { node: created, aggregate: {} },
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 201,
            statusText: 'created',
            json: async () => payload,
        } as unknown as Response);

        const res = await createNode(input, auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(input),
            })
        );
        expect(res.data?.node).toEqual(created);
    });

    it('updateNode returns updated node', async () => {
        const updated = makeNode({ name: 'Updated Name' });
        fetchSpy.mockResolvedValue(mockResponse(updated));
        const res = await updateNode('n1', { name: 'Updated Name' }, auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1',
            expect.objectContaining({ method: 'PUT' })
        );
        expect(res.data).toEqual(updated);
    });

    it('deleteNode calls delete and returns success', async () => {
        const body: APIResponse<null> = {
            status: 'success',
            message: 'deleted',
            data: null,
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'ok',
            json: async () => body,
        } as unknown as Response);
        const res = await deleteNode('n1', auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(res.status).toBe('success');
    });

    it('updateGrade sends correct payload', async () => {
        const input: UpdateGradeInput = {
            nodeId: 'n1',
            kind: 'actual',
            value: 80,
            completed: true,
        };
        const body: APIResponse<null> = {
            status: 'success',
            message: 'updated',
            data: null,
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'ok',
            json: async () => body,
        } as unknown as Response);
        const res = await updateGrade(input, auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1/grade',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(input),
            })
        );
        expect(res.status).toBe('success');
    });

    it('updateWeights sends correct payload', async () => {
        const input: WeightUpdateInput = {
            mode: 'percent',
            items: [{ childId: 'n2', value: 60 }],
            dryRun: false,
        };
        const body: APIResponse<null> = {
            status: 'success',
            message: 'weights updated',
            data: null,
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'ok',
            json: async () => body,
        } as unknown as Response);
        const res = await updateWeights('n1', input, auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1/weights',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(input),
            })
        );
        expect(res.status).toBe('success');
    });

    it('validateNode returns ValidationResult', async () => {
        const validation: ValidationResult = {
            issues: [],
            configStatus: 'valid',
            coverage: 1,
        };
        fetchSpy.mockResolvedValue(mockResponse(validation));
        const res = await validateNode('n1', auth);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/nodes/n1/validate',
            expect.any(Object)
        );
        expect(res.data).toEqual(validation);
    });
});
