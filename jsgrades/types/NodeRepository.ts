import {
    CalculationMethod,
    ConfigStatus,
    RoundingMode,
    WeightingMode,
} from './qualificationEnums';

export interface CreateNodeInput {
    qualificationId: string;
    userId: string;
    type: string;
    name: string;
    parentId?: string | null;
    weight?: number;
    credits?: number;
    calculationMethod?: CalculationMethod;
    weightingMode?: WeightingMode;
    roundingMode?: RoundingMode;
    roundingPrecision?: number;
    excludeIncompleteFromPredicted?: boolean;
    inheritSettings?: boolean;
    overrides?: Record<string, any>;
    creditEnforcement?: CreditEnf;
    configStatus?: ConfigStatus;
    lockConfig?: boolean;
    currentGrade?: number;
    targetGrade?: number;
    predictedGrade?: number;
    inProgress?: boolean;
    startDate?: Date;
    endDate?: Date;
}
