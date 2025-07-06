# Enterprise Configuration Guide

**Comprehensive configuration guide for enterprise deployment and corporate integration**

## 🏢 **CORPORATE ENVIRONMENT SETUP**

### **Network and Security Configuration**

#### **Firewall Requirements**
```bash
# Required outbound ports for AI services
HTTPS (443) -> api.anthropic.com
HTTPS (443) -> bedrock.us-east-1.amazonaws.com
HTTPS (443) -> *.amazonaws.com

# Internal application ports
HTTP (80)   -> Load balancer / reverse proxy
HTTPS (443) -> SSL-terminated applications
TCP (3000)  -> Frontend application (internal)
TCP (8000)  -> API service (internal)
TCP (5432)  -> PostgreSQL database (internal)
TCP (6379)  -> Redis cache (internal)
TCP (9090)  -> Prometheus metrics (internal)
TCP (3001)  -> Grafana dashboard (internal)
TCP (5601)  -> Kibana logs (internal)
```

#### **Corporate Proxy Configuration**
```bash
# If behind corporate proxy, configure Docker
mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
    "proxies": {
        "default": {
            "httpProxy": "http://proxy.yourenterprise.com:8080",
            "httpsProxy": "http://proxy.yourenterprise.com:8080",
            "noProxy": "localhost,127.0.0.1,.yourenterprise.com,10.0.0.0/8,192.168.0.0/16"
        }
    }
}
EOF

# Set environment variables for build process
export HTTP_PROXY=http://proxy.yourenterprise.com:8080
export HTTPS_PROXY=http://proxy.yourenterprise.com:8080
export NO_PROXY=localhost,127.0.0.1,.yourenterprise.com
```

#### **DNS Configuration**
```bash
# Add to /etc/hosts or corporate DNS
127.0.0.1 ai-strategy.yourenterprise.com
127.0.0.1 ai-strategy-api.yourenterprise.com
127.0.0.1 grafana.yourenterprise.com
```

---

## 🔐 **CORPORATE AUTHENTICATION**

### **LDAP/Active Directory Integration**

#### **LDAP Configuration**
```bash
# Add to .env file
ENABLE_LDAP=true
LDAP_SERVER=ldap://ad.yourenterprise.com:389
LDAP_BASE_DN=dc=yourenterprise,dc=com
LDAP_BIND_DN=cn=service-ai-strategy,ou=service-accounts,dc=yourenterprise,dc=com
LDAP_BIND_PASSWORD=your_service_account_password
LDAP_USER_FILTER=(sAMAccountName={username})
LDAP_GROUP_FILTER=(member={dn})

# User attribute mappings
LDAP_ATTR_EMAIL=mail
LDAP_ATTR_FIRST_NAME=givenName
LDAP_ATTR_LAST_NAME=sn
LDAP_ATTR_DISPLAY_NAME=displayName
LDAP_ATTR_DEPARTMENT=department
LDAP_ATTR_TITLE=title

# Group mappings for roles
LDAP_GROUP_ADMIN=CN=AI-Strategy-Admins,OU=Groups,DC=yourenterprise,DC=com
LDAP_GROUP_MANAGER=CN=AI-Strategy-Managers,OU=Groups,DC=yourenterprise,DC=com
LDAP_GROUP_DEVELOPER=CN=AI-Strategy-Developers,OU=Groups,DC=yourenterprise,DC=com
LDAP_GROUP_EXECUTIVE=CN=AI-Strategy-Executives,OU=Groups,DC=yourenterprise,DC=com
```

#### **SAML/SSO Configuration**
```bash
# Add to .env file
ENABLE_SAML=true
SAML_SP_ENTITY_ID=ai-strategy.yourenterprise.com
SAML_SP_ACS_URL=https://ai-strategy.yourenterprise.com/auth/saml/acs
SAML_IDP_ENTITY_ID=https://adfs.yourenterprise.com/adfs/services/trust
SAML_IDP_SSO_URL=https://adfs.yourenterprise.com/adfs/ls/
SAML_IDP_X509_CERT_PATH=/etc/ssl/certs/adfs-signing.crt

# User attribute mappings
SAML_ATTR_EMAIL=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
SAML_ATTR_FIRST_NAME=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname
SAML_ATTR_LAST_NAME=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname
SAML_ATTR_GROUPS=http://schemas.microsoft.com/ws/2008/06/identity/claims/groups
```

#### **OAuth 2.0/OpenID Connect Configuration**
```bash
# Add to .env file
ENABLE_OAUTH=true
OAUTH_PROVIDER=azure
OAUTH_CLIENT_ID=your_azure_app_id
OAUTH_CLIENT_SECRET=your_azure_app_secret
OAUTH_TENANT_ID=your_azure_tenant_id
OAUTH_DISCOVERY_URL=https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid_configuration
OAUTH_REDIRECT_URI=https://ai-strategy.yourenterprise.com/auth/oauth/callback
OAUTH_SCOPE=openid profile email
```

---

## 📧 **CORPORATE COMMUNICATION**

### **Email Configuration**

#### **Exchange Server Integration**
```bash
# Add to .env file
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.yourenterprise.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=ai-strategy@yourenterprise.com
SMTP_PASSWORD=your_email_account_password
SMTP_FROM_NAME=AI Strategy Command Center
SMTP_FROM_EMAIL=ai-strategy@yourenterprise.com

# Email templates
EMAIL_TEMPLATE_PATH=/app/templates/email
EMAIL_LOGO_URL=https://assets.yourenterprise.com/logo.png
EMAIL_FOOTER_TEXT=© 2024 Your Enterprise. All rights reserved.
EMAIL_SIGNATURE=AI Strategy Team | Your Enterprise
```

#### **Office 365 Integration**
```bash
# Add to .env file
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_AUTH_METHOD=oauth2

# OAuth for Office 365
OFFICE365_CLIENT_ID=your_office365_app_id
OFFICE365_CLIENT_SECRET=your_office365_app_secret
OFFICE365_TENANT_ID=your_office365_tenant_id
```

### **Slack Integration**

#### **Corporate Slack Workspace**
```bash
# Add to .env file
ENABLE_SLACK_NOTIFICATIONS=true
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_DEFAULT_CHANNEL=#ai-strategy
SLACK_ALERT_CHANNEL=#ai-strategy-alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Slack app configuration required:
# 1. Create Slack app in corporate workspace
# 2. Add bot token scopes: chat:write, channels:read, groups:read
# 3. Install app to workspace
# 4. Get bot token and signing secret
```

#### **Microsoft Teams Integration**
```bash
# Add to .env file
ENABLE_TEAMS_NOTIFICATIONS=true
TEAMS_WEBHOOK_URL=https://yourenterprise.webhook.office.com/webhookb2/your-webhook-url
TEAMS_DEFAULT_CHANNEL=AI Strategy
TEAMS_ALERT_CHANNEL=AI Strategy Alerts
```

---

## 🗄️ **ENTERPRISE DATABASE**

### **External PostgreSQL Configuration**

#### **Corporate Database Server**
```bash
# Add to .env file
# Use external corporate PostgreSQL instead of containerized
DATABASE_URL=postgresql://ai_strategy_user:password@pgdb.yourenterprise.com:5432/ai_strategy_prod
POSTGRES_HOST=pgdb.yourenterprise.com
POSTGRES_PORT=5432
POSTGRES_SSL_MODE=require
POSTGRES_SSL_CERT_PATH=/etc/ssl/certs/postgresql-client.crt
POSTGRES_SSL_KEY_PATH=/etc/ssl/private/postgresql-client.key
POSTGRES_SSL_CA_PATH=/etc/ssl/certs/postgresql-ca.crt

# Connection pool settings for enterprise
DATABASE_POOL_SIZE=25
DATABASE_MAX_OVERFLOW=50
DATABASE_POOL_TIMEOUT=30
DATABASE_POOL_RECYCLE=3600
DATABASE_ECHO=false
```

#### **High Availability Setup**
```bash
# Primary and replica configuration
DATABASE_PRIMARY_URL=postgresql://user:pass@pg-primary.yourenterprise.com:5432/ai_strategy
DATABASE_REPLICA_URL=postgresql://user:pass@pg-replica.yourenterprise.com:5432/ai_strategy

# Automatic failover settings
DATABASE_FAILOVER_ENABLED=true
DATABASE_HEALTH_CHECK_INTERVAL=30
DATABASE_FAILOVER_TIMEOUT=60
```

### **Enterprise Redis Configuration**

#### **External Redis Cluster**
```bash
# Add to .env file
REDIS_CLUSTER_ENABLED=true
REDIS_HOSTS=redis1.yourenterprise.com:6379,redis2.yourenterprise.com:6379,redis3.yourenterprise.com:6379
REDIS_PASSWORD=your_redis_cluster_password
REDIS_SSL_ENABLED=true
REDIS_SSL_CERT_PATH=/etc/ssl/certs/redis-client.crt
REDIS_SSL_KEY_PATH=/etc/ssl/private/redis-client.key
REDIS_SSL_CA_PATH=/etc/ssl/certs/redis-ca.crt

# Redis settings
REDIS_MAX_CONNECTIONS=100
REDIS_CONNECTION_TIMEOUT=10
REDIS_SOCKET_TIMEOUT=10
REDIS_RETRY_ON_TIMEOUT=true
```

---

## 🔒 **ENTERPRISE SECURITY**

### **SSL/TLS Configuration**

#### **Corporate Certificates**
```bash
# Certificate paths
SSL_CERT_PATH=/etc/ssl/certs/yourenterprise.crt
SSL_KEY_PATH=/etc/ssl/private/yourenterprise.key
SSL_CA_PATH=/etc/ssl/certs/yourenterprise-ca.crt

# SSL settings
SSL_PROTOCOLS=TLSv1.2,TLSv1.3
SSL_CIPHERS=ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256
SSL_PREFER_SERVER_CIPHERS=on
SSL_SESSION_CACHE=shared:SSL:10m
SSL_SESSION_TIMEOUT=10m

# HSTS settings
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
```

#### **Certificate Management**
```bash
# Automatic certificate renewal with corporate CA
CERT_RENEWAL_ENABLED=true
CERT_RENEWAL_DAYS_BEFORE_EXPIRY=30
CERT_RENEWAL_EMAIL=ssl-admin@yourenterprise.com

# Certificate validation
CERT_VALIDATION_ENABLED=true
CERT_VALIDATION_INTERVAL=86400  # Daily
```

### **Security Headers**

#### **Application Security Headers**
```bash
# Add to nginx configuration or application
SECURITY_HEADERS_ENABLED=true
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
X_FRAME_OPTIONS=SAMEORIGIN
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION="1; mode=block"
REFERRER_POLICY=strict-origin-when-cross-origin
PERMISSIONS_POLICY="camera=(), microphone=(), geolocation=()"
```

### **Audit and Compliance**

#### **Audit Logging Configuration**
```bash
# Add to .env file
AUDIT_LOGGING_ENABLED=true
AUDIT_LOG_LEVEL=INFO
AUDIT_LOG_FORMAT=json
AUDIT_LOG_DESTINATION=syslog
AUDIT_SYSLOG_HOST=syslog.yourenterprise.com
AUDIT_SYSLOG_PORT=514
AUDIT_SYSLOG_FACILITY=local0

# Audit events to log
AUDIT_LOGIN_EVENTS=true
AUDIT_ADMIN_ACTIONS=true
AUDIT_DATA_ACCESS=true
AUDIT_CONFIGURATION_CHANGES=true
AUDIT_AGENT_EXECUTIONS=true
AUDIT_APPROVAL_ACTIONS=true
```

#### **Compliance Settings**
```bash
# Compliance frameworks
COMPLIANCE_SOC2=true
COMPLIANCE_GDPR=true
COMPLIANCE_HIPAA=false
COMPLIANCE_PCI_DSS=false

# Data retention policies
DATA_RETENTION_POLICY_ENABLED=true
USER_DATA_RETENTION_DAYS=2555  # 7 years
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
JOB_DATA_RETENTION_DAYS=365    # 1 year
TEMP_DATA_RETENTION_DAYS=30    # 30 days

# Privacy settings
PRIVACY_DATA_ANONYMIZATION=true
PRIVACY_RIGHT_TO_ERASURE=true
PRIVACY_DATA_PORTABILITY=true
PRIVACY_CONSENT_MANAGEMENT=true
```

---

## 📊 **ENTERPRISE MONITORING**

### **SIEM Integration**

#### **Splunk Integration**
```bash
# Add to .env file
ENABLE_SPLUNK_INTEGRATION=true
SPLUNK_HOST=splunk.yourenterprise.com
SPLUNK_PORT=8088
SPLUNK_TOKEN=your_splunk_hec_token
SPLUNK_INDEX=ai_strategy
SPLUNK_SOURCE_TYPE=json
SPLUNK_SSL_VERIFY=true
```

#### **QRadar Integration**
```bash
# Add to .env file
ENABLE_QRADAR_INTEGRATION=true
QRADAR_HOST=qradar.yourenterprise.com
QRADAR_PORT=514
QRADAR_PROTOCOL=tcp
QRADAR_FORMAT=leef
```

### **Enterprise Monitoring Stack**

#### **Datadog Integration**
```bash
# Add to .env file
ENABLE_DATADOG=true
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key
DATADOG_SITE=datadoghq.com  # or datadoghq.eu
DATADOG_ENV=production
DATADOG_SERVICE=ai-strategy
DATADOG_VERSION=2.1.0
```

#### **New Relic Integration**
```bash
# Add to .env file
ENABLE_NEWRELIC=true
NEWRELIC_LICENSE_KEY=your_newrelic_license_key
NEWRELIC_APP_NAME=Enterprise AI Strategy
NEWRELIC_ENVIRONMENT=production
```

---

## 🔄 **DISASTER RECOVERY**

### **Backup Configuration**

#### **Enterprise Backup Integration**
```bash
# Add to .env file
BACKUP_ENABLED=true
BACKUP_STORAGE_TYPE=s3  # or nfs, azure_blob
BACKUP_S3_BUCKET=enterprise-ai-strategy-backups
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY=your_backup_access_key
BACKUP_S3_SECRET_KEY=your_backup_secret_key
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_ENCRYPTION_KEY=your_backup_encryption_key

# Backup schedule
BACKUP_SCHEDULE_DATABASE=0 2 * * *  # Daily at 2 AM
BACKUP_SCHEDULE_FILES=0 3 * * 0     # Weekly on Sunday at 3 AM
BACKUP_SCHEDULE_CONFIG=0 4 * * 1    # Weekly on Monday at 4 AM

# Retention policies
BACKUP_RETENTION_DAILY=30   # 30 days
BACKUP_RETENTION_WEEKLY=12  # 12 weeks
BACKUP_RETENTION_MONTHLY=12 # 12 months
BACKUP_RETENTION_YEARLY=7   # 7 years
```

### **Disaster Recovery**

#### **Multi-Site Configuration**
```bash
# Add to .env file
DR_ENABLED=true
DR_PRIMARY_SITE=us-east-1
DR_SECONDARY_SITE=us-west-2
DR_REPLICATION_INTERVAL=300  # 5 minutes
DR_FAILOVER_THRESHOLD=180    # 3 minutes
DR_AUTO_FAILOVER=false       # Manual approval required

# Cross-region replication
DR_DATABASE_REPLICATION=true
DR_FILE_REPLICATION=true
DR_CONFIG_REPLICATION=true
```

---

## 📞 **ENTERPRISE SUPPORT**

### **Integration with Corporate ITSM**

#### **ServiceNow Integration**
```bash
# Add to .env file
ENABLE_SERVICENOW=true
SERVICENOW_INSTANCE=yourenterprise.service-now.com
SERVICENOW_USERNAME=ai_strategy_integration
SERVICENOW_PASSWORD=your_servicenow_password
SERVICENOW_CLIENT_ID=your_servicenow_client_id
SERVICENOW_CLIENT_SECRET=your_servicenow_client_secret

# Incident creation
SERVICENOW_ASSIGNMENT_GROUP=AI Strategy Support
SERVICENOW_CATEGORY=Software
SERVICENOW_SUBCATEGORY=AI Strategy Platform
SERVICENOW_PRIORITY_MAPPING=critical:1,high:2,medium:3,low:4
```

#### **JIRA Integration**
```bash
# Add to .env file
ENABLE_JIRA=true
JIRA_URL=https://yourenterprise.atlassian.net
JIRA_USERNAME=ai-strategy-bot@yourenterprise.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=AISTR
JIRA_ISSUE_TYPE=Bug
JIRA_COMPONENT=AI Strategy Platform
```

This configuration guide provides enterprise-specific settings for deploying the AI Strategy Command Center in corporate environments with proper security, compliance, and integration requirements.