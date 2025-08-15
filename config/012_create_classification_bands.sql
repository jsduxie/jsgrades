CREATE TABLE IF NOT EXISTS classification_bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES classification_schemes(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    min_value NUMERIC(6,3) NOT NULL,
    max_value NUMERIC(6,3) NULL,
    rank INT NOT NULL,
    UNIQUE (scheme_id, label)
);

create index idx_classification_bands_scheme_id ON classification_bands(scheme_id);
create index idx_classification_bands_rank ON classification_bands(rank);