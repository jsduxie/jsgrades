/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NodeSummary from '@/components/qualifications/NodeSummary';

jest.mock('@/context/QualificationContext', () => ({
    useQualification: jest.fn(),
}));

const { useQualification } = jest.requireMock('@/context/QualificationContext');

describe('NodeSummary', () => {
    beforeEach(() => {
        (useQualification as jest.Mock).mockReturnValue({
            qualifications: [
                { id: 'q1', level: 'lvl6', name: 'BSc CS', institution: 'Uni' },
            ],
            qualificationLevels: [{ id: 'lvl6', name: 'Bachelors', level: 6 }],
            currentQualificationId: 'q1',
            currentNodeId: 'n1',
            nodeHierarchy: [
                {
                    id: 'n1',
                    qualificationId: 'q1',
                    userId: 'u1',
                    parentId: null,
                    name: 'Year 1',
                    type: 'year',
                    credits: 120,
                    weight: null,
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
                    id: 'n2',
                    qualificationId: 'q1',
                    userId: 'u1',
                    parentId: 'n1',
                    name: 'Intro to CS',
                    type: 'module',
                    credits: 15,
                    weight: 0.1,
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
            ],
            currentNodeSummary: {
                node: {
                    id: 'n1',
                    qualificationId: 'q1',
                    userId: 'u1',
                    parentId: null,
                    name: 'Year 1',
                    type: 'year',
                    credits: 120,
                    weight: null,
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
                aggregate: {
                    nodeId: 'n1',
                    childCounts: {},
                    effectiveSettings: {
                        calculationMethod: 'weighted_mean',
                        weightingMode: 'equal',
                        roundingMode: 'none',
                        roundingPrecision: 2,
                        excludeIncompleteFromPredicted: true,
                        inheritSettings: true,
                        overrides: {},
                    },
                    validationCodes: [],
                    validationMeta: {},
                    lastComputedAt: new Date(),
                },
                effectiveSettings: {
                    calculationMethod: 'weighted_mean',
                    weightingMode: 'equal',
                    roundingMode: 'none',
                    roundingPrecision: 2,
                    excludeIncompleteFromPredicted: true,
                    inheritSettings: true,
                    overrides: {},
                },
            },
            qualificationNodeTypes: [
                { id: 'year', name: 'year', allowChildren: true },
                { id: 'module', name: 'module', allowChildren: true },
                { id: 'assessment', name: 'assessment', allowChildren: false },
            ],
            navigateBack: jest.fn(),
            navigateToNode: jest.fn(),
            createNode: jest.fn().mockResolvedValue(null),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders node details and children, and exposes Add button for allowed child type', async () => {
        render(<NodeSummary />);

        expect(screen.getByText('Year 1')).toBeInTheDocument();

        expect(screen.getByText(/year$/i)).toBeInTheDocument();

        expect(screen.getByText('Intro to CS')).toBeInTheDocument();

        expect(
            screen
                .getAllByRole('button')
                .some((b) => /add module/i.test(b.textContent || ''))
        ).toBe(true);
    });

    it('navigates to child on click', async () => {
        const user = userEvent.setup();
        const q = useQualification() as any;
        render(<NodeSummary />);
        await user.click(screen.getByText('Intro to CS'));
        expect(q.navigateToNode).toHaveBeenCalledWith('n2');
    });
});
