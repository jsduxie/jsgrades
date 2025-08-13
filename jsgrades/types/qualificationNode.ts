import {
    CalculationMethod,
    ConfigStatus,
    GradeKind,
    NodeTypeId,
    RoundingMode,
    WeightingMode,
} from './qualificationEnums';

export type NodeSettings = {
    calculationMethod: CalculationMethod;
    weightingMode: WeightingMode;
    roundingMode: RoundingMode;
    roundingPrecision: number;
    excludeIncompleteFromPredicted: boolean;
    inheritSettings: boolean;
    overrides: Partial<Record<keyof NodeSettings, boolean>>;
};

export type NodeEdge = {
    id: string;
    parentId: string;
    childId: string;
    position: number;
    weightValue: number | null;
    weightOverride: boolean;
};

export type NodeAggregate = {
    nodeId: string;
    aggActual?: number | null;
    aggPredicted?: number | null;
    aggCompletionRatio?: number | null;
    childCounts: {
        total?: number;
        complete?: number;
        withPredicted?: number;
    };
    effectiveSettings: NodeSettings;
    creditSumExpected?: number | null;
    creditSumActual?: number | null;
    creditCoverage?: number | null;
    validationCodes?: string[];
    validationMeta?: Record<string, unknown>;
    configStatus?: ConfigStatus;
    lastComputedAt: Date;
};

export type Node = {
    id: string;
    qualificationId: string;
    parentId?: string | null;
    type: NodeTypeId;
    name: string;
    credits?: number | null;
    settings: NodeSettings;
    targetGrade?: number | null;
    actualGrade?: number | null;
    predictedGrade?: number | null;
    completed?: boolean;
    created: Date;
    updated: Date;
};

export type NodeSummary = {
    node: Node;
    aggregate: NodeAggregate;
    children?: Array<
        Pick<Node, 'id' | 'name' | 'type'> & {
            aggregate?: Pick<NodeAggregate, 'aggActual' | 'aggPredicted'>;
        }
    >;
};

export type QualificationDashboardItem = {
    id: string;
    name: string;
    level: string;
    institution: string;
    actualGrade?: number | null;
    predictedGrade?: number | null;
    targetGrade?: number | null;
    inProgress: boolean;
    updated: Date;
};

export type UpdateGradeInput = {
    nodeId: string;
    kind: GradeKind;
    value?: number | null;
    completed: boolean;
};
