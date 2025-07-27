CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores user data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    highest_qual_level INT,
    profile_picture varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sign_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    onBoarded BOOLEAN DEFAULT false,
    count_sign_in INT DEFAULT 0
);

CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_email ON users(email);
