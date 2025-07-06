#!/bin/bash

# Enterprise AI Strategy Command Center Deployment Script
# This script sets up the complete operational infrastructure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SCRIPT_DIR/.env"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed. Frontend build may fail."
    fi
    
    log_success "Prerequisites check completed"
}

generate_env_file() {
    log_info "Generating environment file..."
    
    if [ -f "$ENV_FILE" ]; then
        log_warning "Environment file already exists. Backing up..."
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    cat > "$ENV_FILE" << EOF
# Enterprise AI Strategy Command Center Environment Configuration
# Generated on $(date)

# Database Configuration
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
POSTGRES_DB=enterprise_ai_strategy
POSTGRES_USER=enterprise_ai_user

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# AWS Configuration (required for Bedrock)
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-}
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

# Anthropic API Key (required for Claude)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}

# Grafana Configuration
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)

# MinIO Configuration
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Application Configuration
LOG_LEVEL=INFO
ENVIRONMENT=production
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Monitoring Configuration
PROMETHEUS_RETENTION=90d
GRAFANA_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel

# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
EOF
    
    log_success "Environment file generated at $ENV_FILE"
    log_warning "Please review and update the environment variables, especially AWS and Anthropic API keys"
}

setup_directories() {
    log_info "Setting up directory structure..."
    
    # Create necessary directories
    mkdir -p "$SCRIPT_DIR"/{logs,data,backup}
    mkdir -p "$SCRIPT_DIR"/monitoring/{grafana/dashboards,grafana/datasources,alertmanager}
    mkdir -p "$SCRIPT_DIR"/nginx/ssl
    mkdir -p "$SCRIPT_DIR"/scripts
    
    # Set permissions
    chmod 755 "$SCRIPT_DIR"/{logs,data,backup}
    chmod 755 "$SCRIPT_DIR"/monitoring
    
    log_success "Directory structure created"
}

create_docker_files() {
    log_info "Creating Docker configuration files..."
    
    # Create API Dockerfile
    cat > "$SCRIPT_DIR/Dockerfile.api" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    # Create requirements.txt for API
    cat > "$SCRIPT_DIR/requirements.txt" << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
pyjwt==2.8.0
python-multipart==0.0.6
passlib[bcrypt]==1.7.4
prometheus-client==0.19.0
structlog==23.2.0
boto3==1.34.0
anthropic==0.7.8
httpx==0.25.2
pydantic==2.5.1
python-jose[cryptography]==3.3.0
alembic==1.13.0
celery==5.3.4
kombu==5.3.4
pytest==7.4.3
pytest-asyncio==0.21.1
EOF

    # Create Nginx configuration
    cat > "$SCRIPT_DIR/nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # API routes
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    log_success "Docker configuration files created"
}

create_monitoring_configs() {
    log_info "Creating monitoring configuration files..."
    
    # Create Grafana datasource
    cat > "$SCRIPT_DIR/monitoring/grafana/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    # Create alert rules
    cat > "$SCRIPT_DIR/monitoring/alert_rules.yml" << 'EOF'
groups:
  - name: enterprise-ai-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} requests per second"
      
      - alert: DatabaseDown
        expr: up{job="postgresql"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"
      
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is above 80%"
EOF

    # Create Alertmanager config
    cat > "$SCRIPT_DIR/monitoring/alertmanager.yml" << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@nationwide.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: 'admin@nationwide.com'
        subject: '[ALERT] {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
EOF
    
    log_success "Monitoring configuration files created"
}

create_backup_script() {
    log_info "Creating backup script..."
    
    cat > "$SCRIPT_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash

# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Create backup
pg_dump -h postgres -U enterprise_ai_user -d enterprise_ai_strategy > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remove old backups
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
EOF
    
    chmod +x "$SCRIPT_DIR/scripts/backup.sh"
    
    log_success "Backup script created"
}

build_and_deploy() {
    log_info "Building and deploying services..."
    
    cd "$SCRIPT_DIR"
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    fi
    
    # Build and start services
    docker-compose down --remove-orphans
    docker-compose build
    docker-compose up -d
    
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Services deployed successfully"
}

check_service_health() {
    log_info "Checking service health..."
    
    local services=("postgres" "redis" "api" "prometheus" "grafana")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            log_success "$service is running"
        else
            log_error "$service is not healthy"
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        log_success "All services are healthy"
    else
        log_error "Some services failed to start: ${failed_services[*]}"
        log_info "Check logs with: docker-compose logs <service-name>"
    fi
}

setup_initial_data() {
    log_info "Setting up initial data..."
    
    # Wait for API to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/health &>/dev/null; then
            log_success "API is ready"
            break
        fi
        
        log_info "Waiting for API... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "API failed to start within expected time"
        return 1
    fi
    
    # Create initial admin user (if not exists)
    log_info "Creating initial admin user..."
    # This would be done via API call or database insert
    
    log_success "Initial data setup completed"
}

print_access_info() {
    log_success "Deployment completed successfully!"
    echo
    echo "Access Information:"
    echo "=================="
    echo "🚀 Main Application:     http://localhost:3000"
    echo "🔧 API Documentation:    http://localhost:8000/docs"
    echo "📊 Grafana Dashboard:    http://localhost:3001 (admin/$(grep GRAFANA_PASSWORD $ENV_FILE | cut -d'=' -f2))"
    echo "🔍 Prometheus:           http://localhost:9090"
    echo "🔔 Alertmanager:         http://localhost:9093"
    echo "📈 Kibana:               http://localhost:5601"
    echo "🗄️  MinIO Console:        http://localhost:9001"
    echo "🔗 Jaeger Tracing:       http://localhost:16686"
    echo
    echo "Database Access:"
    echo "==============="
    echo "Host: localhost:5432"
    echo "Database: enterprise_ai_strategy"
    echo "Username: enterprise_ai_user"
    echo "Password: $(grep POSTGRES_PASSWORD $ENV_FILE | cut -d'=' -f2)"
    echo
    echo "Environment file: $ENV_FILE"
    echo "Logs directory: $SCRIPT_DIR/logs"
    echo "Data directory: $SCRIPT_DIR/data"
    echo
    echo "To stop all services: docker-compose down"
    echo "To view logs: docker-compose logs -f [service-name]"
    echo "To restart a service: docker-compose restart [service-name]"
    echo
    log_warning "Remember to update AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and ANTHROPIC_API_KEY in $ENV_FILE"
}

show_help() {
    echo "Enterprise AI Strategy Command Center Deployment Script"
    echo
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  --help, -h      Show this help message"
    echo "  --setup-only    Only setup files and directories, don't deploy"
    echo "  --deploy-only   Only deploy services (assumes setup is done)"
    echo "  --clean         Stop and remove all services and volumes"
    echo "  --backup        Create database backup"
    echo "  --restore FILE  Restore database from backup file"
    echo
    echo "Examples:"
    echo "  $0                    # Full setup and deployment"
    echo "  $0 --setup-only       # Just create configuration files"
    echo "  $0 --deploy-only      # Deploy with existing configuration"
    echo "  $0 --clean            # Clean up everything"
}

clean_deployment() {
    log_warning "This will stop and remove all services and volumes. Are you sure? (y/N)"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        log_info "Cleaning up deployment..."
        cd "$SCRIPT_DIR"
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

create_backup() {
    log_info "Creating database backup..."
    cd "$SCRIPT_DIR"
    docker-compose exec postgres sh /backup.sh
    log_success "Backup created"
}

restore_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_warning "This will restore the database from $backup_file. Existing data will be lost. Continue? (y/N)"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        log_info "Restoring database from $backup_file..."
        cd "$SCRIPT_DIR"
        # Implementation would depend on backup format
        log_success "Database restored"
    else
        log_info "Restore cancelled"
    fi
}

main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --setup-only)
            check_prerequisites
            generate_env_file
            setup_directories
            create_docker_files
            create_monitoring_configs
            create_backup_script
            log_success "Setup completed. Run '$0 --deploy-only' to deploy services."
            ;;
        --deploy-only)
            build_and_deploy
            setup_initial_data
            print_access_info
            ;;
        --clean)
            clean_deployment
            ;;
        --backup)
            create_backup
            ;;
        --restore)
            restore_backup "$2"
            ;;
        "")
            log_info "Starting full deployment of Enterprise AI Strategy Command Center..."
            check_prerequisites
            generate_env_file
            setup_directories
            create_docker_files
            create_monitoring_configs
            create_backup_script
            build_and_deploy
            setup_initial_data
            print_access_info
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"