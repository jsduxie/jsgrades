CREATE TABLE IF NOT EXISTS node_aggregates (
    node_id UUID PRIMARY KEY REFERENCES qualification_nodes(id) ON DELETE CASCADE,
    agg_actual NUMERIC(6,3) NULL,
    agg_predicted NUMERIC(6,3) NULL,
    agg_completion_ratio NUMERIC(6,3) NULL,
    child_counts JSONB NOT NULL DEFAULT '{}'::JSONB,
    effective_settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    credit_sum_expected NUMERIC(10,2) NULL,
    credit_sum_actual NUMERIC(10,2) NULL,
    config_coverage NUMERIC(6,3) NULL,
    validation_codes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    validation_meta JSONB NOT NULL DEFAULT '{}'::JSONB,
    classification_actual TEXT NULL,
    classification_predicted TEXT NULL,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
