CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE task_priority_enum AS ENUM ('Critical', 'High', 'Medium', 'Low');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    qual_node_id UUID,
    parent_id UUID,
    title TEXT,
    priority task_priority_enum,
    progress FLOAT,
    due_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    in_progress BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (qual_node_id) REFERENCES qualification_nodes(id),
    FOREIGN KEY (parent_id) REFERENCES tasks(id)
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_node_id ON tasks(qual_node_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_complete ON tasks(is_completed);