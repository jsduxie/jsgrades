-- Creates a table audit_log and triggers to audit any updates to all tables

CREATE TABLE audit_log (
    audit_id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation CHAR(1) NOT NULL,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    old_data JSONB,
    new_data JSONB
);

CREATE OR REPLACE FUNCTION audit_trigger_fn() RETURNS trigger AS $$
DECLARE
    user_name TEXT;
BEGIN
    user_name := current_user;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log(table_name, operation, changed_by, new_data)
        VALUES (TG_TABLE_NAME, 'I', user_name, to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log(table_name, operation, changed_by, old_data, new_data)
        VALUES (TG_TABLE_NAME, 'U', user_name, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log(table_name, operation, changed_by, old_data)
        VALUES (TG_TABLE_NAME, 'D', user_name, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_qualifications_trigger
AFTER INSERT OR UPDATE OR DELETE ON qualifications
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_qualification_levels_trigger
AFTER INSERT OR UPDATE OR DELETE ON qualification_levels
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_qualification_nodes_trigger
AFTER INSERT OR UPDATE OR DELETE ON qualification_nodes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_tasks_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_node_types_trigger
AFTER INSERT OR UPDATE OR DELETE ON node_types
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

GRANT USAGE, SELECT ON SEQUENCE audit_log_audit_id_seq TO app_user;