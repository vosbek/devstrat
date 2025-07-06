# Enterprise AI Strategy Command Center - Deployment Guide

**Complete step-by-step guide for deploying the AI Strategy Command Center in production**

[![Deployment Status](https://img.shields.io/badge/Deployment-Production%20Ready-brightgreen?style=for-the-badge&logo=rocket)](deployment-status)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-Docker%20Compose-blue?style=for-the-badge&logo=docker)](infrastructure)
[![Monitoring](https://img.shields.io/badge/Monitoring-Full%20Stack-purple?style=for-the-badge&logo=grafana)](monitoring)

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

### **🔧 Technical Requirements**
- [ ] **Docker** 20.10+ and **Docker Compose** 2.0+
- [ ] **4GB+ RAM** available for containers
- [ ] **20GB+ disk space** for data and logs
- [ ] **Network access** to AWS and Anthropic APIs
- [ ] **Admin privileges** on deployment server

### **🔑 Access Credentials**
- [ ] **AWS Account** with Bedrock access in us-east-1
- [ ] **AWS Access Key/Secret** with Bedrock permissions
- [ ] **Anthropic API Key** with Claude access
- [ ] **SMTP credentials** (optional, for notifications)
- [ ] **Domain/SSL certificates** (optional, for production)

### **📊 Enterprise Integration**
- [ ] **Database access** (if using external PostgreSQL)
- [ ] **LDAP/AD integration** details (if using SSO)
- [ ] **Network policies** configured for container communication
- [ ] **Backup strategy** defined for data persistence

---

## 🚀 Deployment Options

### **Option 1: Quick Start (Recommended)**

**Best for**: Initial testing, proof of concept, development

```bash
# 1. Clone repository
git clone <repository-url>
cd enterprise-ai-strategy/operational-layer

# 2. Run automated deployment
chmod +x deploy.sh
./deploy.sh

# 3. Configure credentials (edit generated .env file)
# 4. Restart services
docker-compose down && docker-compose up -d
```

**⏱️ Time to deploy**: 15-30 minutes  
**🎯 Result**: Fully functional system with sample data

### **Option 2: Production Deployment**

**Best for**: Enterprise production, high availability, compliance

```bash
# 1. Clone and prepare
git clone <repository-url>
cd enterprise-ai-strategy/operational-layer

# 2. Production setup
./deploy.sh --production
# or
./deploy.sh --setup-only  # Setup files without deployment
# Edit configuration files
./deploy.sh --deploy-only  # Deploy with custom config
```

**⏱️ Time to deploy**: 1-2 hours  
**🎯 Result**: Production-ready system with enterprise features

### **Option 3: Kubernetes Deployment**

**Best for**: Container orchestration, scalability, cloud-native

```bash
# 1. Generate Kubernetes manifests
cd operational-layer/kubernetes
./generate-manifests.sh

# 2. Deploy to cluster
kubectl apply -f manifests/
```

**⏱️ Time to deploy**: 2-4 hours  
**🎯 Result**: Scalable, cloud-native deployment

---

## 🔧 Step-by-Step Deployment

### **Step 1: Environment Preparation**

```bash
# Clone the repository
git clone <repository-url>
cd enterprise-ai-strategy

# Verify Docker installation
docker --version
docker-compose --version

# Check system resources
free -h  # At least 4GB RAM
df -h    # At least 20GB disk space
```

### **Step 2: Initial Configuration**

```bash
# Navigate to operational layer
cd operational-layer

# Run setup (creates configuration files)
chmod +x deploy.sh
./deploy.sh --setup-only
```

This creates:
- `.env` file with environment variables
- Docker configuration files
- Monitoring configurations
- Database initialization scripts

### **Step 3: Credential Configuration**

**Edit the `.env` file with your credentials:**

```bash
# Critical: AWS Bedrock access
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1

# Critical: Anthropic Claude access
ANTHROPIC_API_KEY=sk-ant-api03-...

# Database (auto-generated or custom)
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=enterprise_ai_strategy
POSTGRES_USER=enterprise_ai_user

# Security (auto-generated or custom)
JWT_SECRET=your_jwt_secret_key_here
REDIS_PASSWORD=secure_redis_password

# Monitoring (auto-generated or custom)
GRAFANA_PASSWORD=secure_grafana_password

# Optional: Email notifications
SMTP_HOST=smtp.nationwide.com
SMTP_USER=ai-strategy@nationwide.com
SMTP_PASSWORD=email_password

# Optional: Enterprise SSO
OAUTH_CLIENT_ID=your_oauth_client
OAUTH_CLIENT_SECRET=your_oauth_secret
OAUTH_DISCOVERY_URL=https://auth.nationwide.com/.well-known/openid_configuration
```

### **Step 4: Service Deployment**

```bash
# Deploy all services
./deploy.sh --deploy-only

# Or deploy manually
docker-compose up -d

# Check deployment status
docker-compose ps
```

**Expected services:**
- ✅ **postgres**: Database
- ✅ **redis**: Caching
- ✅ **api**: FastAPI backend
- ✅ **frontend**: React UI
- ✅ **nginx**: Reverse proxy
- ✅ **prometheus**: Metrics
- ✅ **grafana**: Dashboards
- ✅ **elasticsearch**: Logging
- ✅ **kibana**: Log analysis

### **Step 5: Health Verification**

```bash
# Check API health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check monitoring
curl http://localhost:9090/api/v1/query?query=up

# View logs
docker-compose logs api
docker-compose logs frontend
```

### **Step 6: Initial Data Setup**

```bash
# Create admin user
docker-compose exec api python -c "
from api.main import create_admin_user
create_admin_user('admin@nationwide.com', 'Admin User', 'password123')
"

# Execute sample agents (optional)
python cli/command_center.py execute tool_discovery "Initial tool discovery"
```

---

## 🌐 Production Configuration

### **SSL/TLS Configuration**

**Option A: Let's Encrypt (Recommended)**

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d ai-strategy.nationwide.com

# Update nginx configuration
# Edit operational-layer/nginx/nginx.conf
```

**Option B: Enterprise Certificates**

```bash
# Copy certificates
cp your-cert.crt operational-layer/nginx/ssl/
cp your-key.key operational-layer/nginx/ssl/

# Update nginx configuration
# Edit operational-layer/nginx/nginx.conf
```

### **Domain Configuration**

Update `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl;
    server_name ai-strategy.nationwide.com;
    
    ssl_certificate /etc/nginx/ssl/your-cert.crt;
    ssl_certificate_key /etc/nginx/ssl/your-key.key;
    
    # API routes
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend routes
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Enterprise Authentication**

**LDAP/Active Directory Integration:**

```yaml
# Add to .env file
LDAP_SERVER=ldap://ad.nationwide.com
LDAP_BASE_DN=dc=nationwide,dc=com
LDAP_BIND_DN=cn=service-account,ou=services,dc=nationwide,dc=com
LDAP_BIND_PASSWORD=service_password
LDAP_USER_FILTER=(sAMAccountName={username})
```

**OAuth 2.0/OpenID Connect:**

```yaml
# Add to .env file
OAUTH_PROVIDER=okta
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_DISCOVERY_URL=https://nationwide.okta.com/.well-known/openid_configuration
OAUTH_REDIRECT_URI=https://ai-strategy.nationwide.com/auth/callback
```

### **Database Configuration**

**External PostgreSQL:**

```yaml
# Update .env file
DATABASE_URL=postgresql://username:password@db.nationwide.com:5432/enterprise_ai_strategy
POSTGRES_HOST=db.nationwide.com
POSTGRES_PORT=5432
POSTGRES_SSL_MODE=require
```

**High Availability Setup:**

```yaml
# Primary database
DATABASE_URL=postgresql://user:pass@db-primary.nationwide.com:5432/enterprise_ai_strategy

# Read replica for analytics
DATABASE_READONLY_URL=postgresql://user:pass@db-replica.nationwide.com:5432/enterprise_ai_strategy
```

---

## 📊 Monitoring and Observability

### **Grafana Dashboard Setup**

1. **Access Grafana**: http://localhost:3001
2. **Login**: admin / [GRAFANA_PASSWORD from .env]
3. **Import Dashboards**:
   - System Overview (ID: 1860)
   - Docker Containers (ID: 193)
   - PostgreSQL (ID: 9628)
   - Application Metrics (custom)

### **Alert Configuration**

**Prometheus Alerts** (`monitoring/alert_rules.yml`):

```yaml
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
```

**Email Notifications** (update `monitoring/alertmanager.yml`):

```yaml
global:
  smtp_smarthost: 'smtp.nationwide.com:587'
  smtp_from: 'ai-strategy-alerts@nationwide.com'
  smtp_auth_username: 'ai-strategy@nationwide.com'
  smtp_auth_password: 'email_password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'ai-strategy-team'

receivers:
  - name: 'ai-strategy-team'
    email_configs:
      - to: 'ai-strategy-team@nationwide.com'
        subject: '[ALERT] AI Strategy System: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Severity: {{ .Labels.severity }}
          {{ end }}
```

### **Log Management**

**Configure Log Retention:**

```yaml
# Add to docker-compose.yml elasticsearch service
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  - "action.auto_create_index=false"
  - "indices.lifecycle.rollover.auto=true"
  - "indices.lifecycle.rollover.max_size=1gb"
  - "indices.lifecycle.rollover.max_age=7d"
```

**Application Logging:**

```python
# Add to api/main.py
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/application.log'),
        logging.StreamHandler()
    ]
)
```

---

## 🔒 Security Hardening

### **Network Security**

**Docker Network Isolation:**

```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  monitoring:
    driver: bridge
    internal: true

services:
  nginx:
    networks:
      - frontend
  
  api:
    networks:
      - frontend
      - backend
  
  postgres:
    networks:
      - backend
```

**Firewall Configuration:**

```bash
# UFW rules for Ubuntu
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct frontend access
sudo ufw deny 8000/tcp   # Block direct API access
sudo ufw enable
```

### **Container Security**

**Security Scanning:**

```bash
# Scan images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image enterprise-ai-api:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image enterprise-ai-frontend:latest
```

**Runtime Security:**

```yaml
# Add to docker-compose.yml services
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
read_only: true
tmpfs:
  - /tmp
  - /var/run
```

### **Data Protection**

**Database Encryption:**

```yaml
# PostgreSQL encryption at rest
POSTGRES_INITDB_ARGS: "--data-checksums --encoding=UTF8"
POSTGRES_SSL_MODE: require
POSTGRES_SSL_CERT: /etc/ssl/certs/server-cert.pem
POSTGRES_SSL_KEY: /etc/ssl/private/server-key.pem
POSTGRES_SSL_CA: /etc/ssl/certs/ca-cert.pem
```

**Secret Management:**

```bash
# Use Docker secrets for sensitive data
echo "your_postgres_password" | docker secret create postgres_password -
echo "your_jwt_secret" | docker secret create jwt_secret -
```

---

## 📈 Performance Optimization

### **Resource Allocation**

**Production Resource Limits:**

```yaml
# docker-compose.override.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
  
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
  
  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### **Database Optimization**

**PostgreSQL Tuning:**

```sql
-- Add to database/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

**Connection Pooling:**

```python
# Add to api/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### **Caching Strategy**

**Redis Configuration:**

```yaml
# Add to docker-compose.yml redis service
command: >
  redis-server 
  --maxmemory 512mb 
  --maxmemory-policy allkeys-lru 
  --save 900 1 
  --save 300 10 
  --save 60 10000
```

**Application Caching:**

```python
# Add to api/main.py
from functools import lru_cache
import redis

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

@lru_cache(maxsize=128)
def get_agent_config(agent_name: str):
    # Cache agent configurations
    return agent_configurations.get(agent_name)
```

---

## 🔄 Backup and Recovery

### **Database Backup**

**Automated Backup Script:**

```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/database"
POSTGRES_CONTAINER="enterprise-ai-postgres"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec $POSTGRES_CONTAINER pg_dump -U enterprise_ai_user -d enterprise_ai_strategy > \
  "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Cron Job Setup:**

```bash
# Add to crontab
0 2 * * * /path/to/enterprise-ai-strategy/scripts/backup-database.sh
```

### **Data Recovery**

**Database Restore:**

```bash
# Stop services
docker-compose down

# Restore database
gunzip -c backup_20250105_020000.sql.gz | \
docker exec -i enterprise-ai-postgres psql -U enterprise_ai_user -d enterprise_ai_strategy

# Restart services
docker-compose up -d
```

**Disaster Recovery:**

```bash
# Full system recovery
git clone <repository-url>
cd enterprise-ai-strategy/operational-layer

# Restore configuration
cp /backup/config/.env .
cp /backup/config/docker-compose.override.yml .

# Deploy system
./deploy.sh --deploy-only

# Restore data
./scripts/restore-database.sh /backup/database/latest.sql.gz
```

---

## 🚀 Deployment Verification

### **Post-Deployment Checklist**

**System Health:**
- [ ] All containers running (`docker-compose ps`)
- [ ] API health check passes (`curl http://localhost:8000/health`)
- [ ] Frontend accessible (`curl http://localhost:3000`)
- [ ] Database connection successful
- [ ] Redis cache operational

**Security Verification:**
- [ ] SSL certificates valid and auto-renewing
- [ ] Authentication working (login/logout)
- [ ] Authorization enforced (role-based access)
- [ ] Audit logs being generated
- [ ] Sensitive data encrypted

**Monitoring Active:**
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards displaying data
- [ ] Alerts configured and tested
- [ ] Log aggregation working
- [ ] Backup jobs scheduled

**Functional Testing:**
- [ ] AI agents executable via CLI
- [ ] Web interface fully functional
- [ ] Approval workflows operational
- [ ] Content generation working
- [ ] User management functional

### **Performance Baseline**

**Establish Performance Metrics:**

```bash
# API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/agents

# Database query performance
docker exec -it enterprise-ai-postgres psql -U enterprise_ai_user -d enterprise_ai_strategy \
  -c "EXPLAIN ANALYZE SELECT * FROM job_executions LIMIT 10;"

# Memory usage
docker stats --no-stream
```

**Load Testing:**

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoints
ab -n 1000 -c 10 http://localhost:8000/health
ab -n 100 -c 5 -H "Authorization: Bearer <token>" http://localhost:8000/agents
```

---

## 📞 Support and Troubleshooting

### **Common Issues**

**Services Won't Start:**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check disk space
df -h

# Check logs
docker-compose logs api
docker-compose logs postgres
```

**Database Connection Errors:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker exec -it enterprise-ai-postgres psql -U enterprise_ai_user -d enterprise_ai_strategy

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**Performance Issues:**
```bash
# Monitor resource usage
docker stats

# Check database performance
docker exec -it enterprise-ai-postgres psql -U enterprise_ai_user -d enterprise_ai_strategy \
  -c "SELECT * FROM pg_stat_activity;"

# Clear cache
docker exec -it enterprise-ai-redis redis-cli FLUSHALL
```

### **Log Locations**

- **Application Logs**: `/var/log/enterprise-ai/`
- **Container Logs**: `docker-compose logs <service>`
- **Database Logs**: `docker-compose logs postgres`
- **Web Server Logs**: `docker-compose logs nginx`
- **Monitoring Logs**: `docker-compose logs prometheus grafana`

### **Support Contacts**

- **Technical Issues**: ai-strategy-support@nationwide.com
- **Security Concerns**: security@nationwide.com
- **Infrastructure**: infrastructure@nationwide.com
- **Emergency**: On-call rotation via PagerDuty

---

**✅ Your Enterprise AI Strategy Command Center is now ready for production deployment with enterprise-grade security, monitoring, and operational excellence.**

For additional support or advanced configuration, refer to the [full documentation](README.md) or contact the [AI Strategy Team](mailto:ai-strategy@nationwide.com).