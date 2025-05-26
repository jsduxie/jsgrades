CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores different types of qualification, and their associated levels (i.e. MEng is level 7)
CREATE TABLE qualification_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE,
    level INT
);