export enum NodeTypeId {
    qualification,
    year,
    module,
    assesment,
}

export enum WeightingMode {
    percent,
    credits,
    ratio,
    equal,
}

export enum CalculationMethod {
    weightedMean,
    sum,
    max,
    min,
}

export enum RoundingMode {
    none,
    nearest,
    floor,
    ceil,
    bankers,
}

export enum GradeKind {
    actual,
    predicted,
    target,
}

export enum ConfigStatus {
    draft,
    partial,
    valid,
    locked,
}

export enum CreditEnforcement {
    none,
    warn,
    strict,
}
