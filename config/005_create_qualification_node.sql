CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Represents each level of the qualifications hierarchy (i.e. year, module, assessment) in a recursive format for generalisability
CREATE TABLE qualification_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qualification_id UUID,
    user_id UUID,
    parent_id UUID DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    type UUID NOT NULL,
    weight FLOAT CHECK (weight >= 0 AND weight <= 1),
    credits INT,
    calculation_method calculation_method_enum DEFAULT 'weighted_mean',
    weighting_mode weighting_mode_enum DEFAULT 'equal',
    rounding_mode rounding_mode_enum DEFAULT 'none',
    rounding_precision SMALLINT DEFAULT 2,
    exclude_incomplete_from_predicted BOOLEAN DEFAULT TRUE,
    inherit_settings BOOLEAN DEFAULT TRUE,
    overrides JSONB DEFAULT '{}'::jsonb,
    credit_enforcement credit_enforcement_enum DEFAULT 'warn',
    config_status config_status_enum DEFAULT 'partial',
    lock_config BOOLEAN DEFAULT FALSE,
    current_grade FLOAT,
    target_grade FLOAT,
    predicted_grade FLOAT,
    in_progress BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qualification_id) REFERENCES qualifications(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES qualification_nodes(id),
    FOREIGN KEY (type) REFERENCES node_types(id)
);

CREATE INDEX idx_node_qualification_id ON qualification_nodes(qualification_id);
CREATE INDEX idx_node_user_id ON qualification_nodes(user_id);
CREATE INDEX idx_node_parent_id ON qualification_nodes(parent_id);