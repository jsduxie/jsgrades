CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Currently geared towards degree formats, but can be expanded for other types at a later date
CREATE TYPE node_type_enum AS ENUM ('year', 'module', 'assessment');

-- Allows different types of qualification node formats
CREATE TABLE node_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name node_type_enum NOT NULL,
    allow_children BOOLEAN DEFAULT FALSE
);