# Enterprise AI Strategy Command Center - Operational Layer

A comprehensive operational infrastructure for managing AI agents, workflows, and enterprise AI strategy at scale.

## 🚀 Overview

The Operational Layer provides the complete infrastructure needed to run the Enterprise AI Strategy Command Center in production. It includes:

- **Backend API Service** - FastAPI-based REST API for agent management
- **Web Dashboard** - React-based UI for operations management
- **Manual Trigger System** - CLI and web interfaces for running agents
- **Approval Workflows** - Content review and approval system
- **Authentication & Authorization** - Enterprise-grade security
- **Monitoring & Logging** - Comprehensive observability stack
- **Data Management** - PostgreSQL database with audit trails

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                   │
├─────────────────────┬───────────────────────────────────────┤
│   Frontend (React)  │         Backend API (FastAPI)        │
├─────────────────────┼───────────────────────────────────────┤
│                     │  ┌─────────────┐ ┌─────────────────┐  │
│                     │  │   Agents    │ │   Workflows     │  │
│                     │  │   Manager   │ │   Engine        │  │
│                     │  └─────────────┘ └─────────────────┘  │
├─────────────────────┴───────────────────────────────────────┤
│              Data Layer (PostgreSQL + Redis)               │
├─────────────────────────────────────────────────────────────┤
│                    Monitoring Stack                        │
│   Prometheus | Grafana | ELK | Jaeger | AlertManager      │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Python** 3.9+ for local development
- **Node.js** 16+ for frontend development
- **AWS Account** with Bedrock access
- **Anthropic API Key** for Claude access
- **4GB+ RAM** and **20GB+ disk space**

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the operational layer
cd operational-layer

# Make deployment script executable
chmod +x deploy.sh

# Run full deployment
./deploy.sh
```

### 2. Configure Environment

Edit the generated `.env` file with your credentials:

```bash
# Required: AWS credentials for Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# Required: Anthropic API key for Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Customize other settings
GRAFANA_PASSWORD=your_grafana_password
```

### 3. Access the System

- **Web Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Grafana Monitoring**: http://localhost:3001

## 🛠️ Components

### Backend API Service

**Location**: `api/main.py`

FastAPI-based REST API providing:

- Agent execution and management
- Job queue and status tracking
- Content approval workflows
- User authentication and authorization
- Real-time monitoring and metrics

**Key Endpoints**:
```
GET  /agents                    # List available agents
POST /agents/{name}/execute     # Execute an agent
GET  /jobs                      # List job executions
GET  /jobs/{id}                 # Get job status
GET  /approvals                 # List pending approvals
POST /approvals/{id}/review     # Approve/reject content
```

### Command Line Interface

**Location**: `cli/command_center.py`

Rich CLI for system management:

```bash
# Install CLI dependencies
pip install click rich requests

# Basic usage
python command_center.py status                    # System status
python command_center.py agents                    # List agents
python command_center.py execute tool_discovery "Find new AI tools"
python command_center.py jobs --status running     # List running jobs
python command_center.py approvals                 # List pending approvals

# Interactive mode
python command_center.py interactive execute-agent
python command_center.py interactive review-approvals
```

### Web Dashboard

**Location**: `web-ui/`

React-based operational dashboard with:

- Real-time system monitoring
- Agent execution interface
- Job management and tracking
- Approval workflow management
- User and permission management
- Analytics and reporting

**Development**:
```bash
cd web-ui
npm install
npm start
```

### Database Schema

**Location**: `database/init.sql`

PostgreSQL database with:

- **Users**: Authentication and authorization
- **Job Executions**: Agent job tracking
- **Content Approvals**: Workflow management
- **Audit Log**: Complete audit trail
- **System Metrics**: Performance monitoring

**Key Tables**:
- `users` - User accounts and roles
- `job_executions` - Agent execution tracking
- `content_approvals` - Content review workflow
- `audit_log` - System audit trail

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | Generated |
| `REDIS_URL` | Redis connection string | Yes | Generated |
| `JWT_SECRET` | JWT signing secret | Yes | Generated |
| `AWS_ACCESS_KEY_ID` | AWS access key for Bedrock | Yes | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Bedrock | Yes | - |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes | - |
| `LOG_LEVEL` | Logging level | No | INFO |

### Agent Configuration

Agents are configured in the `agent_configurations` table:

```sql
INSERT INTO agent_configurations (agent_name, configuration) VALUES 
('tool_discovery', '{"max_tools": 50, "sources": ["github", "producthunt"]}');
```

### User Roles

- **Developer**: Can execute agents and view own jobs
- **Manager**: Can approve content and manage teams
- **Admin**: Full system access and user management
- **Executive**: Read-only access to high-level metrics

## 📊 Monitoring and Observability

### Prometheus Metrics

**Endpoint**: http://localhost:9090

Custom metrics include:
- `ai_agent_executions_total` - Agent execution count
- `ai_job_duration_seconds` - Job execution time
- `ai_approval_queue_size` - Pending approvals
- `ai_user_activity_total` - User activity metrics

### Grafana Dashboards

**Endpoint**: http://localhost:3001

Pre-configured dashboards:
- **System Overview** - High-level metrics
- **Agent Performance** - Agent execution analytics
- **User Activity** - User engagement metrics
- **Infrastructure** - System health metrics

### Centralized Logging

**Kibana**: http://localhost:5601

Log aggregation from all services with:
- Structured logging in JSON format
- Log correlation across services
- Real-time log streaming
- Advanced search and filtering

### Distributed Tracing

**Jaeger**: http://localhost:16686

Request tracing across:
- API calls and database queries
- Agent executions
- External service calls
- User authentication flows

## 🔒 Security

### Authentication

- **JWT-based authentication** with configurable expiration
- **Role-based access control** (RBAC)
- **API token support** for service accounts
- **Session management** with Redis

### Data Protection

- **Encrypted passwords** using bcrypt
- **Audit logging** for all sensitive operations
- **Data anonymization** options
- **Backup encryption** support

### Network Security

- **Nginx reverse proxy** with SSL termination
- **Internal network isolation** via Docker networks
- **Rate limiting** and DDoS protection
- **Security headers** and CORS configuration

## 🔄 Operations

### Deployment

```bash
# Full deployment
./deploy.sh

# Setup only (no deployment)
./deploy.sh --setup-only

# Deploy with existing config
./deploy.sh --deploy-only

# Clean everything
./deploy.sh --clean
```

### Backup and Recovery

```bash
# Create backup
./deploy.sh --backup

# Restore from backup
./deploy.sh --restore backup_20240101_120000.sql.gz

# Automated backups (configured via cron)
# Daily at 2 AM: 0 2 * * * /path/to/deploy.sh --backup
```

### Scaling

**Horizontal Scaling**:
```bash
# Scale API service
docker-compose up -d --scale api=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

**Database Scaling**:
- Read replicas for analytics
- Connection pooling
- Query optimization

### Maintenance

```bash
# Update services
docker-compose pull
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Database maintenance
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy
```

## 🧪 Testing

### API Testing

```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run API tests
cd api
pytest tests/

# Test with coverage
pytest --cov=api tests/
```

### Frontend Testing

```bash
# Run frontend tests
cd web-ui
npm test

# E2E testing
npm run test:e2e
```

### Load Testing

```bash
# Install load testing tools
pip install locust

# Run load tests
locust -f tests/load_test.py --host=http://localhost:8000
```

## 🐛 Troubleshooting

### Common Issues

**Services won't start**:
```bash
# Check Docker status
docker-compose ps

# View service logs
docker-compose logs api

# Check resource usage
docker stats
```

**Database connection issues**:
```bash
# Test database connectivity
docker-compose exec postgres pg_isready

# Check database logs
docker-compose logs postgres

# Manual connection test
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy
```

**API authentication issues**:
```bash
# Check JWT configuration
echo $JWT_SECRET

# Verify user creation
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy -c "SELECT * FROM users;"

# Reset admin password
# (Implementation would be via CLI command)
```

### Performance Issues

**High memory usage**:
- Adjust container memory limits
- Check for memory leaks in logs
- Scale down non-essential services

**Slow database queries**:
- Check PostgreSQL slow query log
- Analyze query execution plans
- Add database indexes

**High API latency**:
- Check Prometheus metrics
- Review Jaeger traces
- Scale API service horizontally

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd enterprise-ai-strategy/operational-layer

# Setup development environment
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Run in development mode
docker-compose -f docker-compose.dev.yml up -d
```

### Code Style

- **Python**: Black formatting, flake8 linting
- **TypeScript**: Prettier formatting, ESLint
- **SQL**: Standard SQL formatting
- **Docker**: Hadolint for Dockerfile linting

### Testing Requirements

- Unit tests for all new features
- Integration tests for API endpoints
- E2E tests for critical workflows
- Performance tests for scalability

## 📚 API Documentation

### Authentication

All API endpoints require JWT authentication except `/auth/login` and `/health`.

**Login**:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=user@example.com&password=password"
```

**Using Token**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/agents
```

### Agent Execution

**Execute Agent**:
```bash
curl -X POST http://localhost:8000/agents/tool_discovery/execute \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Find new AI development tools",
    "parameters": {"max_results": 20},
    "requires_approval": true
  }'
```

**Check Job Status**:
```bash
curl http://localhost:8000/jobs/{job_id} \
  -H "Authorization: Bearer <token>"
```

### Content Approval

**List Pending Approvals**:
```bash
curl http://localhost:8000/approvals \
  -H "Authorization: Bearer <token>"
```

**Approve Content**:
```bash
curl -X POST http://localhost:8000/approvals/{approval_id}/review \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "reason": "Content looks good"}'
```

## 📞 Support

For support and questions:

- **Documentation**: Check this README and API docs at `/docs`
- **Logs**: Use `docker-compose logs <service>` for debugging
- **Monitoring**: Check Grafana dashboards for system health
- **Issues**: Create GitHub issues for bugs and feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Enterprise AI Strategy Command Center** - Empowering enterprise AI adoption through intelligent automation and operational excellence.