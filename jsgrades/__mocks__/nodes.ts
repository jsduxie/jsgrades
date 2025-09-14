import type { Node } from '@/types';

export function makeNode(overrides: Partial<Node> = {}): Node {
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
