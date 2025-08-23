import { APIResponse } from './api';

export interface NodeSettings {
    calculationMethod: 'weighted_mean' | 'sum' | 'max' | 'min';
    weightingMode: 'percent' | 'credits' | 'ratio' | 'equal';
    roundingMode: 'none' | 'nearest' | 'floor' | 'ceil' | 'bankers';
    roundingPrecision: number;
    excludeIncompleteFromPredicted: boolean;
    inheritSettings: boolean;
    overrides: Record<string, any>;
    creditEnforcement?: 'none' | 'warn' | 'strict';
}

export interface Node {
    id: string;
    qualificationId: string;
    userId: string;
    parentId?: string | null;
    name: string;
    type: string;
    weight?: number | null;
    credits?: number | null;
    calculationMethod: 'weighted_mean' | 'sum' | 'max' | 'min';
    weightingMode: 'percent' | 'credits' | 'ratio' | 'equal';
    roundingMode: 'none' | 'nearest' | 'floor' | 'ceil' | 'bankers';
    roundingPrecision: number;
    excludeIncompleteFromPredicted: boolean;
    inheritSettings: boolean;
    overrides: Record<string, any>;
    creditEnforcement: 'none' | 'warn' | 'strict';
    configStatus: 'draft' | 'partial' | 'valid' | 'locked';
    lockConfig: boolean;
    currentGrade?: number | null;
    targetGrade?: number | null;
    predictedGrade?: number | null;
    inProgress: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface NodeAggregate {
    nodeId: string;
    aggActual?: number | null;
    aggPredicted?: number | null;
    aggCompletionRatio?: number | null;
    childCounts: Record<string, number>;
    effectiveSettings: NodeSettings;
    creditSumExpected?: number | null;
    creditSumActual?: number | null;
    configCoverage?: number | null;
    validationCodes: string[];
    validationMeta: Record<string, any>;
    classificationActual?: string | null;
    classificationPredicted?: string | null;
    lastComputedAt: Date;
}

export interface UpdateGradeInput {
    nodeId: string;
    kind: 'actual' | 'predicted' | 'target';
    value?: number | null;
    completed?: boolean;
}

export interface ValidationResult {
    issues: Array<{
        code: string;
        severity: 'info' | 'warning' | 'error';
        message: string;
        meta?: Record<string, any>;
    }>;
    configStatus: 'draft' | 'partial' | 'valid' | 'locked';
    coverage?: number | null;
}

export interface WeightUpdateInput {
    mode: 'percent' | 'ratio' | 'credits';
    items: Array<{
        childId: string;
        value: number;
    }>;
    dryRun?: boolean;
}

export interface NodeSummary {
    node: Node;
    aggregate: NodeAggregate;
    effectiveSettings: NodeSettings;
}

export interface NewNode {
    parentId: string;
    type: string;
    name: string;
    credits?: number;
    settings?: Partial<NodeSettings>;
    qualificationId: string;
}