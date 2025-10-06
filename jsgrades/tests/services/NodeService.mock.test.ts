import '@jest/globals';
import { NodeService } from '@/lib/server/NodeService';

const queryMock = jest.fn();
const releaseMock = jest.fn();

jest.mock('@/lib/server/db', () => ({
    __esModule: true,
    default: {
        connect: jest.fn(async () => ({
            query: queryMock,
            release: releaseMock,
        })),
    },
}));

describe('NodeService (mocked db)', () => {
    beforeEach(() => {
        queryMock.mockReset();
        releaseMock.mockReset();
    });

    it('getNodesByQualification returns mapped nodes with resolved type names', async () => {
        const qualificationId = 'q1';
        const typeId1 = 'type-uuid-1';
        const typeId2 = 'type-uuid-2';

        queryMock
            .mockImplementationOnce(async (sql: string) => {
                expect(sql).toMatch(/SELECT \* FROM qualification_nodes/);
                return {
                    rows: [
                        {
                            id: 'n1',
                            qualification_id: qualificationId,
                            user_id: 'u1',
                            parent_id: null,
                            name: 'Year 1',
                            type: typeId1,
                            rounding_precision: 2,
                            inherit_settings: true,
                            overrides: '{}',
                        },
                        {
                            id: 'n2',
                            qualification_id: qualificationId,
                            user_id: 'u1',
                            parent_id: 'n1',
                            name: 'Module A',
                            type: typeId2,
                            rounding_precision: 2,
                            inherit_settings: true,
                            overrides: '{}',
                        },
                    ],
                };
            })

            .mockImplementationOnce(
                async (_sql: string, params: unknown[]) => ({
                    rows: [{ name: 'year' }],
                })
            )

            .mockImplementationOnce(
                async (_sql: string, params: unknown[]) => ({
                    rows: [{ name: 'module' }],
                })
            );

        const nodes =
            await NodeService.getNodesByQualification(qualificationId);
        expect(nodes).toHaveLength(2);
        const [n1, n2] = nodes;
        expect(n1.type).toBe('year');
        expect(n2.type).toBe('module');
        expect(releaseMock).toHaveBeenCalled();
    });

    it('getNode returns summary with effective settings and aggregate', async () => {
        const nodeId = 'n1';

        queryMock
            // 1) Load node row
            .mockImplementationOnce(async (sql: string) => ({
                rows: [
                    {
                        id: nodeId,
                        qualification_id: 'q1',
                        user_id: 'u1',
                        parent_id: null,
                        name: 'Year 1',
                        type: 'type-uuid-1',
                        rounding_precision: 2,
                        overrides: '{}',
                    },
                ],
            }))
            // 2) Resolve type UUID -> type name
            .mockImplementationOnce(async (_sql: string) => ({
                rows: [{ name: 'year' }],
            }))
            // 3) Load aggregate for node
            .mockImplementationOnce(async (_sql: string) => ({
                rows: [
                    {
                        node_id: nodeId,
                        child_counts: '{}',
                        effective_settings: '{"roundingPrecision":2}',
                        validation_codes: '[]',
                        validation_meta: '{}',
                        last_computed_at: new Date().toISOString(),
                    },
                ],
            }))
            // 4) Resolve effective settings via recursive query
            .mockImplementationOnce(async () => ({
                rows: [
                    {
                        calculation_method: 'weighted_mean',
                        weighting_mode: 'equal',
                        rounding_mode: 'none',
                        rounding_precision: 2,
                        exclude_incomplete_from_predicted: true,
                        inherit_settings: true,
                        overrides: '{}',
                    },
                ],
            }));

        const summary = await NodeService.getNode(nodeId);
        expect(summary.node.id).toBe(nodeId);
        expect(summary.node.type).toBe('year');
        expect(summary.aggregate.nodeId).toBe(nodeId);
        expect(summary.effectiveSettings.roundingPrecision).toBe(2);
        expect(releaseMock).toHaveBeenCalled();
    });
});
