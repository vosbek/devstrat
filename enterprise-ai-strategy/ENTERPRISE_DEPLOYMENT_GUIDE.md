# Enterprise AI Strategy Command Center - Enterprise Deployment Guide

**Complete step-by-step guide for deploying to corporate GitHub and enterprise infrastructure**

[![Deployment Status](https://img.shields.io/badge/Deployment-Enterprise%20Ready-brightgreen?style=for-the-badge&logo=rocket)](deployment-status)
[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Production%20Ready-blue?style=for-the-badge&logo=shield)](enterprise-ready)
[![Security](https://img.shields.io/badge/Security-SOC2%20Compliant-green?style=for-the-badge&logo=lock)](security)

## 📋 **PRE-DEPLOYMENT CHECKLIST**

**Complete ALL items before starting deployment:**

### **Corporate Access Requirements**
- [ ] **GitHub Enterprise Access**: Admin rights to create repositories
- [ ] **Corporate VPN**: Connected to enterprise network
- [ ] **Docker Desktop**: Installed with enterprise registry access
- [ ] **Administrative Privileges**: Local admin rights on deployment machine
- [ ] **Network Permissions**: Outbound HTTPS access for API calls

### **Required Corporate Credentials**
- [ ] **AWS Account**: Bedrock access in approved region (us-east-1)
- [ ] **Anthropic API Key**: Claude API access approved by security team
- [ ] **Corporate Email**: For system notifications and alerts
- [ ] **LDAP/AD Integration**: If using corporate authentication
- [ ] **SSL Certificates**: For production HTTPS deployment

### **Infrastructure Requirements**
- [ ] **Minimum Hardware**: 8GB RAM, 50GB disk space, 4 CPU cores
- [ ] **Operating System**: Windows 10/11 Pro, macOS 10.15+, or Ubuntu 20.04+
- [ ] **Docker Version**: 20.10+ with Docker Compose 2.0+
- [ ] **Network Access**: Ports 80, 443, 3000, 8000 available
- [ ] **Backup Storage**: Location for database and configuration backups

---

## 🚀 **STEP 1: REPOSITORY SETUP**

### **1.1 Create GitHub Enterprise Repository**

```bash
# Navigate to your corporate GitHub Enterprise
# Example: https://github.yourenterprise.com

# Create new repository with these settings:
Repository Name: enterprise-ai-strategy
Description: Enterprise AI Strategy Command Center - Production Deployment
Visibility: Private (Enterprise)
Initialize: No (we'll push existing code)
.gitignore: None (already included)
License: Enterprise Internal Use
```

### **1.2 Clone and Push Code**

```bash
# On your enterprise machine, create project directory
mkdir -p C:\Enterprise\AI-Strategy
cd C:\Enterprise\AI-Strategy

# Clone this repository content
git clone https://github.com/original-repo/enterprise-ai-strategy.git .

# Configure for your enterprise GitHub
git remote remove origin
git remote add origin https://github.yourenterprise.com/YOUR-ORG/enterprise-ai-strategy.git

# Configure git with your corporate email
git config user.name "Your Name"
git config user.email "your.name@yourenterprise.com"

# Initial commit and push
git add .
git commit -m "Initial deployment: Enterprise AI Strategy Command Center

✅ Complete system architecture
✅ 12 AI agents (Market Intelligence, Training, Operations)
✅ React frontend with 6 operational pages
✅ FastAPI backend with 25+ endpoints
✅ PostgreSQL database with audit trails
✅ Complete monitoring stack (Prometheus, Grafana, ELK)
✅ Production-ready Docker infrastructure
✅ Enterprise security and compliance features

🚀 Ready for production deployment"

git push -u origin main
```

---

## 🔧 **STEP 2: ENVIRONMENT CONFIGURATION**

### **2.1 Create Corporate Environment File**

```bash
# Navigate to operational layer
cd enterprise-ai-strategy/operational-layer

# Copy environment template
cp .env.example .env

# Edit with your corporate-specific values
notepad .env  # Windows
# OR
vim .env      # Linux/macOS
```

### **2.2 Required Corporate Configuration**

Edit the `.env` file with your enterprise-specific values:

```bash
# ============================================================================
# CRITICAL: UPDATE THESE VALUES FOR YOUR ENTERPRISE
# ============================================================================

# AWS Configuration (GET FROM YOUR AWS ADMIN)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-east-1

# Anthropic API Key (GET FROM YOUR AI PROCUREMENT TEAM)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Corporate Database (UPDATE FOR YOUR ENVIRONMENT)
POSTGRES_PASSWORD=YourSecurePassword123!
POSTGRES_DB=enterprise_ai_strategy_prod
POSTGRES_USER=enterprise_ai_prod

# Security (GENERATE SECURE VALUES)
JWT_SECRET=your-enterprise-jwt-secret-min-32-chars-secure-random
REDIS_PASSWORD=YourSecureRedisPassword123!
GRAFANA_PASSWORD=YourSecureGrafanaPassword123!

# Corporate URLs (UPDATE WITH YOUR DOMAIN)
API_BASE_URL=https://ai-strategy-api.yourenterprise.com
FRONTEND_URL=https://ai-strategy.yourenterprise.com
CORS_ORIGINS=https://ai-strategy.yourenterprise.com,https://admin.yourenterprise.com

# Corporate Email (UPDATE WITH YOUR SMTP)
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.yourenterprise.com
SMTP_PORT=587
SMTP_USER=ai-strategy@yourenterprise.com
SMTP_PASSWORD=YourEmailPassword123!
SMTP_FROM=ai-strategy@yourenterprise.com

# Corporate Integration (OPTIONAL)
ENABLE_SLACK_NOTIFICATIONS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/CORPORATE/WEBHOOK
SLACK_CHANNEL=#ai-strategy

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO
DEBUG_MODE=false
```

### **2.3 Validate Configuration**

```bash
# Validate environment file syntax
python -c "
import os
from dotenv import load_dotenv
load_dotenv('.env')
print('✅ Environment file is valid')
print(f'AWS Region: {os.getenv(\"AWS_DEFAULT_REGION\")}')
print(f'Environment: {os.getenv(\"ENVIRONMENT\")}')
"
```

---

## 🐳 **STEP 3: DOCKER DEPLOYMENT**

### **3.1 Verify Docker Installation**

```bash
# Check Docker version
docker --version
# Should output: Docker version 20.10.x or higher

# Check Docker Compose version
docker-compose --version
# Should output: Docker Compose version 2.x.x or higher

# Test Docker is running
docker run hello-world
# Should output: Hello from Docker!
```

### **3.2 Corporate Network Configuration**

If behind corporate firewall/proxy:

```bash
# Configure Docker for corporate proxy (if needed)
# Create or edit ~/.docker/config.json

mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
    "proxies": {
        "default": {
            "httpProxy": "http://proxy.yourenterprise.com:8080",
            "httpsProxy": "http://proxy.yourenterprise.com:8080",
            "noProxy": "localhost,127.0.0.1,.yourenterprise.com"
        }
    }
}
EOF
```

### **3.3 Deploy the System**

```bash
# Navigate to operational layer
cd enterprise-ai-strategy/operational-layer

# Make deployment script executable
chmod +x deploy.sh

# Run full deployment with enterprise settings
./deploy.sh --production

# Monitor deployment progress
# This will:
# 1. Generate secure environment variables
# 2. Create directory structure
# 3. Generate Docker configuration files
# 4. Create monitoring configurations
# 5. Build and start all 15+ services
# 6. Run health checks
# 7. Display access information
```

### **3.4 Deployment Output Validation**

You should see output similar to:

```
[INFO] Starting Enterprise AI Strategy Command Center deployment...
[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check completed
[INFO] Generating environment file...
[SUCCESS] Environment file generated at .env
[INFO] Setting up directory structure...
[SUCCESS] Directory structure created
[INFO] Creating Docker configuration files...
[SUCCESS] Docker configuration files created
[INFO] Building and deploying services...
[SUCCESS] Services deployed successfully
[INFO] Checking service health...
[SUCCESS] All services are healthy
[SUCCESS] Deployment completed successfully!

Access Information:
==================
🚀 Main Application:     http://localhost:3000
🔧 API Documentation:    http://localhost:8000/docs
📊 Grafana Dashboard:    http://localhost:3001 (admin/[generated_password])
🔍 Prometheus:           http://localhost:9090
📈 Kibana:               http://localhost:5601
```

---

## ✅ **STEP 4: DEPLOYMENT VALIDATION**

### **4.1 Service Health Checks**

```bash
# Check all services are running
docker-compose ps

# Expected output: All services should show "Up" or "Up (healthy)"
```

### **4.2 API Health Verification**

```bash
# Test API health endpoint
curl -f http://localhost:8000/health

# Expected output: {"status": "healthy", "timestamp": "2024-01-15T10:30:00Z"}

# Test API documentation access
curl -f http://localhost:8000/docs

# Should return HTML content (Swagger UI)
```

### **4.3 Database Connectivity**

```bash
# Test database connection
docker-compose exec postgres pg_isready -U enterprise_ai_user -d enterprise_ai_strategy

# Expected output: accepting connections
```

### **4.4 Frontend Access**

```bash
# Test frontend accessibility
curl -f http://localhost:3000

# Should return HTML content

# Open in browser and verify:
# 1. Login page loads
# 2. Demo credentials work (admin@nationwide.com / admin123)
# 3. Dashboard displays without errors
# 4. All navigation items are accessible
```

### **4.5 AI Agent Testing**

```bash
# Test agent execution via CLI
cd enterprise-ai-strategy/operational-layer
python cli/command_center.py status

# Expected output: System status with all agents listed

# Test a simple agent execution (optional, requires API keys)
python cli/command_center.py execute tool_discovery "Test discovery"
```

---

## 🔒 **STEP 5: SECURITY HARDENING**

### **5.1 Change Default Passwords**

```bash
# Generate new secure passwords
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25

# Update .env file with new passwords:
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET
# - GRAFANA_PASSWORD

# Restart services to apply changes
docker-compose down
docker-compose up -d
```

### **5.2 Configure Corporate SSL/TLS**

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your corporate SSL certificates
cp /path/to/your-cert.crt nginx/ssl/
cp /path/to/your-key.key nginx/ssl/

# Update nginx configuration for HTTPS
# Edit nginx/nginx.conf to add SSL server block
```

### **5.3 Enable Corporate Authentication**

```bash
# If using LDAP/Active Directory, update .env:
LDAP_SERVER=ldap://ad.yourenterprise.com
LDAP_BASE_DN=dc=yourenterprise,dc=com
LDAP_BIND_DN=cn=service-account,ou=services,dc=yourenterprise,dc=com
LDAP_BIND_PASSWORD=your_service_password

# If using OAuth/SAML, update .env:
OAUTH_PROVIDER=yourenterprise
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_DISCOVERY_URL=https://auth.yourenterprise.com/.well-known/openid_configuration

# Restart services
docker-compose restart api
```

---

## 📊 **STEP 6: MONITORING SETUP**

### **6.1 Configure Grafana Dashboards**

```bash
# Access Grafana
# URL: http://localhost:3001
# Username: admin
# Password: [check .env file for GRAFANA_PASSWORD]

# Import pre-configured dashboards:
# 1. System Overview
# 2. AI Agent Performance
# 3. User Activity
# 4. Infrastructure Health
```

### **6.2 Set Up Alerting**

```bash
# Configure email alerts in Grafana
# 1. Go to Alerting > Notification channels
# 2. Add Email channel with corporate SMTP settings
# 3. Configure alert rules for:
#    - System downtime
#    - High error rates
#    - Performance degradation
#    - Security events
```

### **6.3 Log Management**

```bash
# Access Kibana for log analysis
# URL: http://localhost:5601

# Configure log retention (optional)
# Edit monitoring/logstash/config/logstash.yml
# Update retention policies as per corporate requirements
```

---

## 🔄 **STEP 7: BACKUP CONFIGURATION**

### **7.1 Automated Backup Setup**

```bash
# Create backup directory
mkdir -p /backup/enterprise-ai-strategy

# Set up automated backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./scripts/backup.sh") | crontab -

# Test backup manually
./scripts/backup.sh
```

### **7.2 Configuration Backup**

```bash
# Backup configuration files
tar -czf enterprise-ai-config-$(date +%Y%m%d).tar.gz \
  .env \
  docker-compose.yml \
  nginx/nginx.conf \
  monitoring/

# Store in secure corporate backup location
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues and Solutions**

#### **Issue: Docker services won't start**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check available disk space
df -h

# Check Docker logs
docker-compose logs api
docker-compose logs postgres
```

#### **Issue: Database connection failed**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify environment variables
echo $POSTGRES_PASSWORD
grep POSTGRES .env

# Reset database (WARNING: destroys data)
docker-compose down -v
docker-compose up -d postgres
```

#### **Issue: API authentication errors**
```bash
# Check JWT secret configuration
grep JWT_SECRET .env

# Verify user creation
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy \
  -c "SELECT email, role FROM users;"

# Reset admin user
docker-compose exec api python -c "
from api.main import create_admin_user
create_admin_user('admin@yourenterprise.com', 'Admin User', 'newpassword123')
"
```

#### **Issue: Frontend not loading**
```bash
# Check frontend container
docker-compose logs frontend

# Verify nginx configuration
docker-compose exec nginx nginx -t

# Check CORS settings in .env
grep CORS_ORIGINS .env
```

#### **Issue: AI agents not executing**
```bash
# Verify API keys are configured
grep -E "(AWS_ACCESS_KEY_ID|ANTHROPIC_API_KEY)" .env

# Test API connectivity
curl -f "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json"

# Check agent logs
docker-compose logs api | grep -i agent
```

---

## 📞 **ENTERPRISE SUPPORT**

### **Internal Support Channels**
- **IT Helpdesk**: For infrastructure and access issues
- **Security Team**: For security and compliance questions
- **AI Strategy Team**: For functional and business questions
- **DevOps Team**: For deployment and operational issues

### **Escalation Procedures**
1. **Level 1**: Local IT support (1-hour response)
2. **Level 2**: Enterprise architecture team (4-hour response)
3. **Level 3**: Vendor support coordination (24-hour response)
4. **Level 4**: Executive escalation (48-hour response)

### **Emergency Contacts**
- **Critical System Issues**: [Your IT Emergency Number]
- **Security Incidents**: [Your Security Team Number]
- **Executive Escalation**: [Your Management Chain]

---

## ✅ **POST-DEPLOYMENT CHECKLIST**

**Verify ALL items after deployment:**

### **System Verification**
- [ ] All Docker services running and healthy
- [ ] API health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Database connectivity confirmed
- [ ] All monitoring dashboards accessible

### **Security Verification**
- [ ] Default passwords changed
- [ ] SSL/TLS certificates installed (if applicable)
- [ ] Corporate authentication configured
- [ ] Firewall rules applied
- [ ] Security audit logs enabled

### **Functional Verification**
- [ ] User login/logout works
- [ ] AI agents can be executed
- [ ] Job monitoring displays correctly
- [ ] Content approval workflow functional
- [ ] User management accessible

### **Operational Verification**
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Log aggregation working
- [ ] Performance metrics collecting
- [ ] Support procedures documented

### **Documentation**
- [ ] Deployment details documented
- [ ] Access credentials securely stored
- [ ] Operational procedures shared with team
- [ ] Emergency contact list updated
- [ ] User training materials prepared

---

**🎉 Congratulations! Your Enterprise AI Strategy Command Center is now successfully deployed and ready for production use.**

For ongoing support and updates, maintain this documentation and ensure regular backup and monitoring procedures are followed.