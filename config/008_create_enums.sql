CREATE TYPE calculation_method_enum as ENUM (
    'weighted_mean',
    'sum',
    'max',
    'min'
);

CREATE TYPE weighting_mode_enum as ENUM (
    'percent',
    'credits',
    'ratio',
    'equal'
);

CREATE TYPE rounding_mode_enum as ENUM (
    'none',
    'nearest',
    'floor',
    'ceil'
);

CREATE TYPE grade_kind_enum as ENUM (
    'actual',
    'predicted',
    'target'
);

CREATE TYPE credit_enforcement_enum as ENUM (
    'none',
    'warn',
    'strict'
);

CREATE TYPE config_status_enum as ENUM (
    'draft',
    'partial',
    'valid',
    'locked'
);

CREATE TYPE classification_scale_enum as ENUM (
    'percentage',
    'points'
);
