# Enterprise AI Strategy - Troubleshooting Guide

**Comprehensive troubleshooting guide for enterprise deployment issues**

## 🚨 **EMERGENCY QUICK FIXES**

### **System Down - Critical Recovery**

```bash
# 1. Check system status immediately
docker-compose ps
docker stats --no-stream

# 2. View critical logs
docker-compose logs --tail=50 api postgres redis

# 3. Restart core services
docker-compose restart api postgres redis

# 4. Full system restart (if needed)
docker-compose down
docker-compose up -d

# 5. Verify recovery
curl -f http://localhost:8000/health
```

### **Database Emergency Recovery**

```bash
# 1. Check database status
docker-compose exec postgres pg_isready -U enterprise_ai_user

# 2. If database is down, restart with data preservation
docker-compose stop postgres
docker-compose start postgres

# 3. If corruption suspected, restore from backup
./scripts/restore-database.sh /backup/latest-backup.sql.gz

# 4. Verify database integrity
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy -c "SELECT COUNT(*) FROM users;"
```

---

## 🔧 **DEPLOYMENT ISSUES**

### **Issue: Docker Services Won't Start**

#### **Symptoms:**
- `docker-compose up` fails
- Services show "Exited" status
- Port binding errors

#### **Diagnosis:**
```bash
# Check Docker daemon status
sudo systemctl status docker

# Check available ports
netstat -tlnp | grep -E ':(3000|8000|5432|6379|9090|3001)'

# Check disk space
df -h
docker system df

# Check memory
free -h
```

#### **Solutions:**

**Port Conflicts:**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill conflicting process
sudo kill -9 <PID>

# Or use different ports in docker-compose.yml
```

**Insufficient Resources:**
```bash
# Clean up Docker resources
docker system prune -a --volumes
docker volume prune

# Increase Docker resources (Docker Desktop)
# Settings > Resources > Advanced
# RAM: 8GB minimum, CPU: 4 cores minimum
```

**Permission Issues:**
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER ./enterprise-ai-strategy
chmod +x operational-layer/deploy.sh
```

### **Issue: Environment Configuration Errors**

#### **Symptoms:**
- Services start but fail health checks
- Authentication errors
- API connectivity issues

#### **Diagnosis:**
```bash
# Validate .env file syntax
cat operational-layer/.env | grep -v "^#" | grep "="

# Check for missing required variables
grep -E "(AWS_ACCESS_KEY_ID|ANTHROPIC_API_KEY|POSTGRES_PASSWORD)" operational-layer/.env

# Validate environment loading
docker-compose config
```

#### **Solutions:**

**Missing Environment Variables:**
```bash
# Copy template and configure
cd operational-layer
cp .env.example .env

# Generate secure passwords
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25

# Validate configuration
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv('.env')
required = ['AWS_ACCESS_KEY_ID', 'ANTHROPIC_API_KEY', 'POSTGRES_PASSWORD']
missing = [var for var in required if not os.getenv(var)]
if missing:
    print(f'❌ Missing: {missing}')
else:
    print('✅ All required variables present')
"
```

**Invalid AWS Credentials:**
```bash
# Test AWS connectivity
aws sts get-caller-identity --region us-east-1

# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1

# If aws CLI not available, test with curl
curl -X POST https://bedrock-runtime.us-east-1.amazonaws.com/model/anthropic.claude-3-haiku-20240307-v1:0/invoke \
  -H "Authorization: AWS4-HMAC-SHA256 ..." \
  -H "Content-Type: application/json"
```

---

## 🔗 **CONNECTIVITY ISSUES**

### **Issue: API Not Responding**

#### **Symptoms:**
- HTTP 502/503 errors
- Connection timeouts
- "Connection refused" errors

#### **Diagnosis:**
```bash
# Check API container status
docker-compose ps api
docker-compose logs api

# Test direct API connectivity
curl -v http://localhost:8000/health
telnet localhost 8000

# Check internal networking
docker network ls
docker network inspect operational-layer_enterprise-ai-network
```

#### **Solutions:**

**Container Health Issues:**
```bash
# Restart API service
docker-compose restart api

# Check health check configuration
docker inspect operational-layer_api | jq '.[0].Config.Healthcheck'

# View detailed logs
docker-compose logs -f api
```

**Network Configuration Issues:**
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d

# Check port mapping
docker port operational-layer_api
```

### **Issue: Database Connection Failed**

#### **Symptoms:**
- "Connection to database failed" errors
- PostgreSQL authentication errors
- Database timeout errors

#### **Diagnosis:**
```bash
# Check PostgreSQL container
docker-compose ps postgres
docker-compose logs postgres

# Test database connectivity
docker-compose exec postgres pg_isready -U enterprise_ai_user -d enterprise_ai_strategy

# Check database process
docker-compose exec postgres ps aux | grep postgres
```

#### **Solutions:**

**Authentication Issues:**
```bash
# Verify credentials in .env
grep POSTGRES operational-layer/.env

# Reset database password
docker-compose exec postgres psql -U postgres -c "ALTER USER enterprise_ai_user PASSWORD 'new_password';"

# Update .env with new password
sed -i 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=new_password/' operational-layer/.env

# Restart API to pick up new password
docker-compose restart api
```

**Database Corruption:**
```bash
# Check database integrity
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy -c "SELECT version();"

# Repair database (if minor corruption)
docker-compose exec postgres psql -U postgres -c "REINDEX DATABASE enterprise_ai_strategy;"

# Restore from backup (if major corruption)
docker-compose down
docker volume rm operational-layer_postgres_data
docker-compose up -d postgres
# Wait for PostgreSQL to start
./scripts/restore-database.sh /backup/latest-backup.sql.gz
```

---

## 🤖 **AI AGENT ISSUES**

### **Issue: Agents Not Executing**

#### **Symptoms:**
- Agent execution fails immediately
- "Agent not found" errors
- Import/module errors

#### **Diagnosis:**
```bash
# Test agent import
cd enterprise-ai-strategy
python3 -c "
import sys
sys.path.append('.')
from agents.market_intelligence.tool_discovery_agent import ToolDiscoveryAgent
print('✅ Agent imports working')
"

# Check agent registration
docker-compose exec api python -c "
from api.main import AGENT_REGISTRY
print('Registered agents:', list(AGENT_REGISTRY.keys()))
"

# Test CLI agent execution
cd operational-layer
python cli/command_center.py agents
```

#### **Solutions:**

**Import Path Issues:**
```bash
# Fix import paths in API
sed -i 's/agents\.training\./agents.training_content./g' operational-layer/api/main.py

# Verify Python path
docker-compose exec api python -c "import sys; print('\n'.join(sys.path))"

# Add agents directory to Python path
echo "PYTHONPATH=/app:/app/agents" >> operational-layer/.env
docker-compose restart api
```

**Missing Dependencies:**
```bash
# Check Python dependencies
docker-compose exec api pip list | grep -E "(anthropic|boto3|fastapi)"

# Install missing dependencies
docker-compose exec api pip install -r requirements.txt

# Rebuild API container if needed
docker-compose build api
docker-compose up -d api
```

### **Issue: AI API Connectivity Problems**

#### **Symptoms:**
- "Invalid API key" errors
- Network timeout errors
- Rate limiting errors

#### **Diagnosis:**
```bash
# Test Anthropic API key
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${ANTHROPIC_API_KEY}" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Test AWS Bedrock connectivity
aws bedrock list-foundation-models --region us-east-1

# Check rate limits and quotas
grep -i "rate\|quota\|limit" operational-layer/logs/*.log
```

#### **Solutions:**

**API Key Issues:**
```bash
# Validate API key format
echo $ANTHROPIC_API_KEY | grep -E "^sk-ant-api03-"

# Test with minimal request
docker-compose exec api python -c "
import os
import anthropic
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
try:
    response = client.messages.create(
        model='claude-3-haiku-20240307',
        max_tokens=10,
        messages=[{'role': 'user', 'content': 'Hi'}]
    )
    print('✅ Anthropic API working')
except Exception as e:
    print(f'❌ Anthropic API error: {e}')
"
```

**Rate Limiting:**
```bash
# Implement exponential backoff
# Edit agents/base_agent.py to add retry logic

# Reduce concurrent agent executions
sed -i 's/MAX_CONCURRENT_AGENTS=.*/MAX_CONCURRENT_AGENTS=2/' operational-layer/.env

# Add rate limiting to API
# Update api/main.py to include rate limiting middleware
```

---

## 🌐 **FRONTEND ISSUES**

### **Issue: Frontend Not Loading**

#### **Symptoms:**
- Blank page or loading spinner
- JavaScript errors in console
- 404 errors for assets

#### **Diagnosis:**
```bash
# Check frontend container status
docker-compose ps frontend
docker-compose logs frontend

# Test frontend connectivity
curl -v http://localhost:3000

# Check nginx configuration
docker-compose exec nginx nginx -t
docker-compose logs nginx
```

#### **Solutions:**

**Build Issues:**
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check build logs
docker-compose logs frontend | grep -E "(error|Error|ERROR)"

# Manual build test
cd operational-layer/web-ui
npm install
npm run build
```

**Nginx Configuration:**
```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# Check nginx error logs
docker-compose logs nginx | grep error
```

### **Issue: Authentication Not Working**

#### **Symptoms:**
- Login page redirects loop
- "Invalid credentials" for valid users
- JWT token errors

#### **Diagnosis:**
```bash
# Check JWT configuration
grep JWT_SECRET operational-layer/.env

# Test API authentication
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@nationwide.com&password=admin123"

# Check user creation
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy \
  -c "SELECT email, role, is_active FROM users;"
```

#### **Solutions:**

**Missing Default Users:**
```bash
# Create admin user
docker-compose exec api python -c "
from api.main import create_admin_user
create_admin_user('admin@yourenterprise.com', 'Admin User', 'admin123')
print('✅ Admin user created')
"

# Verify user creation
docker-compose exec postgres psql -U enterprise_ai_user -d enterprise_ai_strategy \
  -c "SELECT email, name, role FROM users WHERE role = 'admin';"
```

**JWT Issues:**
```bash
# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" operational-layer/.env

# Restart API
docker-compose restart api

# Clear browser cache and cookies
```

---

## 📊 **MONITORING ISSUES**

### **Issue: Grafana Not Accessible**

#### **Symptoms:**
- Grafana login page not loading
- "Admin user not found" errors
- Dashboard data not displaying

#### **Diagnosis:**
```bash
# Check Grafana container
docker-compose ps grafana
docker-compose logs grafana

# Test Grafana connectivity
curl -v http://localhost:3001

# Check Grafana configuration
docker-compose exec grafana cat /etc/grafana/grafana.ini | grep -A5 -B5 admin
```

#### **Solutions:**

**Password Issues:**
```bash
# Reset Grafana admin password
GRAFANA_PASSWORD=$(grep GRAFANA_PASSWORD operational-layer/.env | cut -d'=' -f2)
echo "Grafana password: $GRAFANA_PASSWORD"

# Reset password in container
docker-compose exec grafana grafana-cli admin reset-admin-password $GRAFANA_PASSWORD

# Or use environment variable reset
docker-compose restart grafana
```

**Data Source Issues:**
```bash
# Check Prometheus connectivity from Grafana
docker-compose exec grafana curl -f http://prometheus:9090/api/v1/query?query=up

# Manually add Prometheus data source
curl -X POST http://admin:$GRAFANA_PASSWORD@localhost:3001/api/datasources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "http://prometheus:9090",
    "access": "proxy",
    "isDefault": true
  }'
```

### **Issue: Logs Not Appearing in Kibana**

#### **Symptoms:**
- Kibana shows no data
- Elasticsearch indices not created
- Logstash parsing errors

#### **Diagnosis:**
```bash
# Check ELK stack status
docker-compose ps elasticsearch logstash kibana

# Check Elasticsearch indices
curl -X GET "http://localhost:9200/_cat/indices?v"

# Check Logstash pipeline
docker-compose logs logstash | grep -E "(error|Error|ERROR)"

# Test log ingestion
echo '{"message": "test log", "level": "INFO"}' | curl -X POST "http://localhost:5000" -H "Content-Type: application/json" -d @-
```

#### **Solutions:**

**Elasticsearch Issues:**
```bash
# Increase Elasticsearch memory
# Add to docker-compose.yml:
# ES_JAVA_OPTS: "-Xms1g -Xmx1g"

# Recreate Elasticsearch volume
docker-compose down
docker volume rm operational-layer_elasticsearch_data
docker-compose up -d elasticsearch
```

**Logstash Configuration:**
```bash
# Test Logstash configuration
docker-compose exec logstash /usr/share/logstash/bin/logstash --config.test_and_exit

# Restart Logstash with debug
docker-compose stop logstash
docker-compose run --rm logstash logstash --config.reload.automatic --log.level=debug
```

---

## 🔒 **SECURITY ISSUES**

### **Issue: SSL/TLS Certificate Problems**

#### **Symptoms:**
- Browser security warnings
- "Certificate not trusted" errors
- HTTPS connections failing

#### **Diagnosis:**
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/yourenterprise.crt -text -noout | grep -E "(Not Before|Not After|Subject|Issuer)"

# Test SSL configuration
openssl s_client -connect localhost:443 -servername yourenterprise.com

# Check nginx SSL configuration
docker-compose exec nginx nginx -t
```

#### **Solutions:**

**Self-Signed Certificates:**
```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/self-signed.key \
  -out nginx/ssl/self-signed.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Update nginx configuration to use self-signed certificate
```

**Corporate Certificate Issues:**
```bash
# Verify certificate chain
cat nginx/ssl/yourenterprise.crt nginx/ssl/intermediate.crt nginx/ssl/root.crt > nginx/ssl/full-chain.crt

# Update nginx to use full chain
# ssl_certificate /etc/nginx/ssl/full-chain.crt;
```

---

## 📞 **GETTING HELP**

### **Escalation Process**

1. **Level 1 - Self-Service** (0-2 hours)
   - Check this troubleshooting guide
   - Review system logs
   - Test basic connectivity

2. **Level 2 - Team Support** (2-8 hours)
   - Contact your DevOps team
   - Engage platform administrators
   - Check with security team for access issues

3. **Level 3 - Vendor Support** (8-24 hours)
   - Contact Docker support for container issues
   - Contact AWS support for Bedrock issues
   - Contact Anthropic support for Claude API issues

4. **Level 4 - Emergency** (<1 hour)
   - Critical system down
   - Security breach suspected
   - Data loss occurred

### **Information to Collect Before Escalating**

```bash
# System information
uname -a
docker version
docker-compose version

# Service status
docker-compose ps
docker-compose logs --tail=100 > system-logs.txt

# Resource usage
docker stats --no-stream
df -h
free -h

# Network connectivity
curl -v http://localhost:8000/health
netstat -tlnp | grep -E ':(3000|8000|5432|6379)'

# Configuration (sanitized)
grep -v -E "(PASSWORD|SECRET|KEY)" operational-layer/.env
```

### **Common Log Locations**

- **Application Logs**: `operational-layer/logs/`
- **Container Logs**: `docker-compose logs <service>`
- **System Logs**: `/var/log/syslog` (Linux), `Console.app` (macOS)
- **Docker Logs**: `~/.docker/daemon.json`, `/var/lib/docker/`
- **Nginx Logs**: `operational-layer/logs/nginx/`

Remember: When in doubt, restart services individually rather than the entire system to minimize downtime.