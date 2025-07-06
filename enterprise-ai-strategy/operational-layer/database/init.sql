-- Enterprise AI Strategy Command Center Database Schema
-- PostgreSQL initialization script

-- Create database (if running manually)
-- CREATE DATABASE enterprise_ai_strategy;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('developer', 'manager', 'admin', 'executive');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255), -- For future password implementation
    role user_role NOT NULL DEFAULT 'developer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Job executions table
CREATE TABLE job_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    status job_status DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    approval_status approval_status DEFAULT 'pending',
    approved_by VARCHAR(100),
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    execution_log JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    CONSTRAINT valid_timing CHECK (
        (started_at IS NULL OR started_at >= created_at) AND
        (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at))
    )
);

-- Content approvals table
CREATE TABLE content_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_executions(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64), -- SHA-256 hash for integrity
    status approval_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by VARCHAR(100),
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    review_comments TEXT,
    content_metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    CONSTRAINT valid_approval_timing CHECK (
        approved_at IS NULL OR approved_at >= created_at
    )
);

-- Agent configurations table
CREATE TABLE agent_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    version VARCHAR(20),
    UNIQUE(agent_name, version)
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    additional_data JSONB DEFAULT '{}'
);

-- System notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}'
);

-- API tokens table (for service accounts and integrations)
CREATE TABLE api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    UNIQUE(token_hash)
);

-- System metrics table for monitoring
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- counter, gauge, histogram
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100) DEFAULT 'system'
);

-- Create indexes for performance
CREATE INDEX idx_job_executions_status ON job_executions(status);
CREATE INDEX idx_job_executions_created_by ON job_executions(created_by);
CREATE INDEX idx_job_executions_created_at ON job_executions(created_at DESC);
CREATE INDEX idx_job_executions_agent_name ON job_executions(agent_name);
CREATE INDEX idx_job_executions_approval_status ON job_executions(approval_status);

CREATE INDEX idx_content_approvals_status ON content_approvals(status);
CREATE INDEX idx_content_approvals_job_id ON content_approvals(job_id);
CREATE INDEX idx_content_approvals_created_at ON content_approvals(created_at DESC);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);
CREATE INDEX idx_api_tokens_expires ON api_tokens(expires_at);

CREATE INDEX idx_system_metrics_name_timestamp ON system_metrics(metric_name, timestamp DESC);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configurations_updated_at BEFORE UPDATE ON agent_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (action, resource_type, resource_id, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (action, resource_type, resource_id, old_values, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (action, resource_type, resource_id, old_values)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_job_executions AFTER INSERT OR UPDATE OR DELETE ON job_executions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_content_approvals AFTER INSERT OR UPDATE OR DELETE ON content_approvals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create views for common queries
CREATE VIEW job_execution_summary AS
SELECT 
    j.id,
    j.job_type,
    j.agent_name,
    j.status,
    j.priority,
    j.created_at,
    j.started_at,
    j.completed_at,
    j.created_by,
    u_creator.name as created_by_name,
    j.approval_status,
    j.approved_by,
    u_approver.name as approved_by_name,
    j.approved_at,
    EXTRACT(EPOCH FROM (COALESCE(j.completed_at, CURRENT_TIMESTAMP) - j.created_at)) as duration_seconds,
    CASE 
        WHEN j.status = 'completed' THEN 'success'
        WHEN j.status = 'failed' THEN 'error'
        WHEN j.status = 'running' THEN 'warning'
        ELSE 'info'
    END as status_color
FROM job_executions j
LEFT JOIN users u_creator ON j.created_by_id = u_creator.id
LEFT JOIN users u_approver ON j.approved_by_id = u_approver.id;

CREATE VIEW pending_approvals_summary AS
SELECT 
    ca.id,
    ca.job_id,
    ca.content_type,
    ca.title,
    ca.status,
    ca.created_at,
    ca.created_by,
    u_creator.name as created_by_name,
    j.agent_name,
    j.status as job_status,
    LENGTH(ca.content) as content_length
FROM content_approvals ca
LEFT JOIN users u_creator ON ca.created_by_id = u_creator.id
LEFT JOIN job_executions j ON ca.job_id = j.id
WHERE ca.status = 'pending'
ORDER BY ca.created_at ASC;

CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM job_executions) as total_jobs,
    (SELECT COUNT(*) FROM job_executions WHERE status = 'running') as running_jobs,
    (SELECT COUNT(*) FROM job_executions WHERE status = 'completed') as completed_jobs,
    (SELECT COUNT(*) FROM job_executions WHERE status = 'failed') as failed_jobs,
    (SELECT COUNT(*) FROM content_approvals WHERE status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
    ROUND(
        CASE 
            WHEN (SELECT COUNT(*) FROM job_executions WHERE status IN ('completed', 'failed')) > 0
            THEN (SELECT COUNT(*)::decimal FROM job_executions WHERE status = 'completed') * 100.0 / 
                 (SELECT COUNT(*) FROM job_executions WHERE status IN ('completed', 'failed'))
            ELSE 0
        END, 2
    ) as success_rate;

-- Insert default admin user (password should be set properly in production)
INSERT INTO users (email, name, role, password_hash) VALUES 
('admin@nationwide.com', 'System Administrator', 'admin', '$2b$12$placeholder_hash');

-- Insert sample agent configurations
INSERT INTO agent_configurations (agent_name, configuration, description, version) VALUES 
('tool_discovery', '{"max_tools": 50, "sources": ["github", "producthunt", "hackernews"]}', 'Tool discovery agent configuration', '1.0'),
('deep_evaluation', '{"evaluation_depth": "comprehensive", "include_security": true}', 'Deep evaluation agent configuration', '1.0'),
('risk_assessment', '{"risk_categories": ["security", "compliance", "operational"], "severity_levels": ["low", "medium", "high", "critical"]}', 'Risk assessment agent configuration', '1.0');

-- Create function for cleanup old records (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
BEGIN
    -- Clean up old audit logs (keep 6 months)
    DELETE FROM audit_log WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    -- Clean up old system metrics (keep 3 months)
    DELETE FROM system_metrics WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '3 months';
    
    -- Clean up read notifications older than 30 days
    DELETE FROM notifications WHERE is_read = true AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Clean up completed jobs older than 1 year (keep metadata)
    UPDATE job_executions 
    SET result = NULL, execution_log = '[]'
    WHERE status = 'completed' 
    AND completed_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
END;
$$ language 'plpgsql';

-- Grant permissions (adjust as needed for your environment)
GRANT USAGE ON SCHEMA public TO enterprise_ai_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO enterprise_ai_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO enterprise_ai_user;

-- Create read-only user for analytics/reporting
CREATE ROLE enterprise_ai_readonly;
GRANT USAGE ON SCHEMA public TO enterprise_ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO enterprise_ai_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO enterprise_ai_readonly;

COMMENT ON DATABASE CURRENT_DATABASE() IS 'Enterprise AI Strategy Command Center Database';
COMMENT ON TABLE users IS 'User accounts and authentication information';
COMMENT ON TABLE job_executions IS 'AI agent job execution tracking';
COMMENT ON TABLE content_approvals IS 'Content approval workflow management';
COMMENT ON TABLE audit_log IS 'System audit trail for compliance';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE api_tokens IS 'API authentication tokens';
COMMENT ON TABLE system_metrics IS 'System performance and usage metrics';
COMMENT ON TABLE agent_configurations IS 'AI agent configuration management';