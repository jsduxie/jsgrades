CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores primary (high-level) qualifications information
CREATE TABLE qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    level UUID,
    name VARCHAR(255),
    institution VARCHAR(255),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_grade FLOAT,
    target_grade FLOAT,
    predicted_grade FLOAT,
    in_progress BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (level) REFERENCES qualification_levels(id)
);

CREATE INDEX idx_qualifications_user_id ON qualifications(user_id);
CREATE INDEX idx_qualifications_level ON qualifications(level);