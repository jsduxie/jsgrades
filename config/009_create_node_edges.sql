CREATE TABLE IF NOT EXISTS node_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES qualification_nodes(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES qualification_nodes(id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 0,
    weight_value NUMERIC(12,4) NULL,
    weight_override BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (parent_id, child_id)
);

CREATE INDEX idx_node_edge_parent_id ON node_edges(parent_id);
CREATE INDEX idx_node_edge_child_id ON node_edges(child_id);
