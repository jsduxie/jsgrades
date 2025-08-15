CREATE TABLE IF NOT EXISTS classification_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scale classification_scale_enum NOT NULL DEFAULT 'percentage',
    institution_id UUID NULL,
    qualification_id UUID NULL,
    rounding_mode rounding_mode_enum NOT NULL DEFAULT 'nearest',
    rounding_precision SMALLINT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_qualification_id_idx
    ON classification_schemes (qualification_id)
    WHERE qualification_id IS NOT NULL;