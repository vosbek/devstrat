# AWS Bedrock Inference Profiles Configuration Guide

**Recommended approach for enterprise deployment with cost control and governance**

## 🎯 **What are Bedrock Inference Profiles?**

AWS Bedrock Inference Profiles provide enterprise-grade cost management, governance, and monitoring for AI model usage. They're the recommended approach for enterprise deployments as they offer:

- **Cost Control**: Set budgets and usage limits
- **Governance**: Track usage across teams and projects
- **Security**: Enhanced access controls and monitoring
- **Compliance**: Detailed audit trails and reporting

## 📋 **Prerequisites for Inference Profiles**

### **AWS Account Requirements**
- [ ] **Bedrock service enabled** in your AWS account
- [ ] **Inference Profiles feature** enabled (may require AWS support)
- [ ] **Appropriate IAM permissions** for profile management
- [ ] **Claude models** available in your region (us-east-1 recommended)

### **AWS Permissions Required**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream",
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel",
                "bedrock:ListInferenceProfiles",
                "bedrock:GetInferenceProfile"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🔧 **Setting Up Inference Profiles**

### **Step 1: Create Inference Profile (AWS Admin)**

```bash
# Using AWS CLI to create an inference profile
aws bedrock create-inference-profile \
    --inference-profile-name "enterprise-ai-strategy-profile" \
    --description "Inference profile for Enterprise AI Strategy Command Center" \
    --model-source "ANTHROPIC" \
    --models "anthropic.claude-3-5-sonnet-20241022-v2:0" \
    --monthly-budget 1000 \
    --usage-quota 50000 \
    --region us-east-1
```

### **Step 2: Configure Application**

Add to your `.env` file:

```bash
# Primary method: Use Inference Profile ID
BEDROCK_INFERENCE_PROFILE_ID=your-inference-profile-id

# Alternative: Use full ARN
BEDROCK_INFERENCE_PROFILE_ARN=arn:aws:bedrock:us-east-1:123456789012:inference-profile/your-profile-id

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# Model settings (will use the profile's model)
DEFAULT_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
DEFAULT_MAX_TOKENS=4000
DEFAULT_TEMPERATURE=0.7
```

### **Step 3: Verify Configuration**

Test your inference profile setup:

```bash
# Test profile access
aws bedrock list-inference-profiles --region us-east-1

# Test model invocation through profile
aws bedrock-runtime invoke-model \
    --model-id "your-inference-profile-id" \
    --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":10,"messages":[{"role":"user","content":"Hello"}]}' \
    --region us-east-1 \
    output.json
```

## 🏢 **Enterprise Configuration Options**

### **Option 1: Single Shared Profile**
**Best for**: Small to medium organizations (< 500 users)

```bash
# Shared profile for all AI Strategy users
BEDROCK_INFERENCE_PROFILE_ID=shared-enterprise-ai-profile

# Benefits:
# - Simple management
# - Consolidated billing
# - Easy monitoring

# Considerations:
# - No per-team cost tracking
# - Shared quotas across all users
```

### **Option 2: Team-Based Profiles**
**Best for**: Large organizations (500+ users) with multiple teams

```bash
# Different profiles per team/department
BEDROCK_INFERENCE_PROFILE_ID_MARKET_INTEL=market-intel-profile
BEDROCK_INFERENCE_PROFILE_ID_TRAINING=training-team-profile
BEDROCK_INFERENCE_PROFILE_ID_OPERATIONS=operations-team-profile

# Benefits:
# - Per-team cost tracking
# - Independent quotas
# - Fine-grained access control

# Implementation:
# Configure different profiles per agent category
```

### **Option 3: Environment-Based Profiles**
**Best for**: Organizations with strict dev/test/prod separation

```bash
# Development environment
BEDROCK_INFERENCE_PROFILE_ID=ai-strategy-dev-profile

# Production environment  
BEDROCK_INFERENCE_PROFILE_ID=ai-strategy-prod-profile

# Benefits:
# - Separate billing for environments
# - Different quotas for dev vs prod
# - Enhanced security isolation
```

## 📊 **Cost Management and Monitoring**

### **Setting Up Budget Alerts**

```bash
# Create CloudWatch alarm for budget threshold
aws cloudwatch put-metric-alarm \
    --alarm-name "AI-Strategy-Budget-Alert" \
    --alarm-description "Alert when AI Strategy costs exceed 80% of budget" \
    --metric-name "EstimatedCharges" \
    --namespace "AWS/Billing" \
    --statistic "Maximum" \
    --period 86400 \
    --threshold 800 \
    --comparison-operator "GreaterThanThreshold" \
    --dimensions Name=Currency,Value=USD Name=ServiceName,Value=AmazonBedrock \
    --alarm-actions "arn:aws:sns:us-east-1:123456789012:ai-strategy-alerts"
```

### **Usage Monitoring Dashboard**

Create CloudWatch dashboard for monitoring:

```json
{
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/Bedrock", "InvocationsCount", "InferenceProfileId", "your-profile-id"],
                    ["AWS/Bedrock", "TokensUsed", "InferenceProfileId", "your-profile-id"],
                    ["AWS/Bedrock", "Latency", "InferenceProfileId", "your-profile-id"]
                ],
                "period": 300,
                "stat": "Sum",
                "region": "us-east-1",
                "title": "AI Strategy Bedrock Usage"
            }
        }
    ]
}
```

## 🔒 **Security and Governance**

### **IAM Role for Application**

Create dedicated IAM role for the application:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1:*:inference-profile/your-profile-id"
            ],
            "Condition": {
                "StringEquals": {
                    "bedrock:InferenceProfileId": "your-profile-id"
                }
            }
        }
    ]
}
```

### **Cross-Account Access (if needed)**

For cross-account deployment:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::ACCOUNT-B:role/AI-Strategy-App-Role"
            },
            "Action": "bedrock:InvokeModel",
            "Resource": "arn:aws:bedrock:us-east-1:ACCOUNT-A:inference-profile/shared-profile"
        }
    ]
}
```

## 🚨 **Troubleshooting Inference Profiles**

### **Common Issues and Solutions**

#### **Profile Not Found Error**
```bash
# Verify profile exists
aws bedrock list-inference-profiles --region us-east-1

# Check profile details
aws bedrock get-inference-profile \
    --inference-profile-identifier "your-profile-id" \
    --region us-east-1
```

#### **Access Denied Error**
```bash
# Check IAM permissions
aws sts get-caller-identity

# Test basic Bedrock access
aws bedrock list-foundation-models --region us-east-1

# Verify profile-specific permissions
aws bedrock get-inference-profile \
    --inference-profile-identifier "your-profile-id" \
    --region us-east-1
```

#### **Quota Exceeded Error**
```bash
# Check current usage
aws bedrock get-inference-profile-usage \
    --inference-profile-identifier "your-profile-id" \
    --region us-east-1

# Request quota increase (if needed)
# Use AWS Support Console to request limit increase
```

#### **Model Not Available in Profile**
```bash
# List available models in profile
aws bedrock get-inference-profile \
    --inference-profile-identifier "your-profile-id" \
    --region us-east-1 \
    --query 'models[*].modelId'

# Update profile to include required model
aws bedrock update-inference-profile \
    --inference-profile-identifier "your-profile-id" \
    --models "anthropic.claude-3-5-sonnet-20241022-v2:0" \
    --region us-east-1
```

## 📈 **Performance Optimization**

### **Recommended Settings for Enterprise**

```bash
# High-performance profile configuration
DEFAULT_MAX_TOKENS=4000          # Balance between capability and cost
DEFAULT_TEMPERATURE=0.3          # Consistent results for enterprise use
RATE_LIMIT_PER_USER_HOUR=50      # Prevent individual user overuse
MAX_CONCURRENT_AGENTS=5          # Balance performance with cost
AGENT_TIMEOUT_SECONDS=300        # Prevent runaway processes
```

### **Cost Optimization Tips**

1. **Use appropriate token limits**: Set `max_tokens` based on actual needs
2. **Implement caching**: Cache similar requests to reduce API calls
3. **Monitor usage patterns**: Identify peak usage times and optimize
4. **Use lower-cost models**: Consider Claude 3 Haiku for simple tasks
5. **Implement request batching**: Combine multiple requests when possible

## 📞 **Getting Help**

### **AWS Support Resources**
- **AWS Support Console**: For quota increases and technical issues
- **AWS Bedrock Documentation**: https://docs.aws.amazon.com/bedrock/
- **AWS Well-Architected Framework**: For architecture best practices

### **Application Configuration Support**
- **Configuration Issues**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Deployment Problems**: See [ENTERPRISE_DEPLOYMENT_GUIDE.md](ENTERPRISE_DEPLOYMENT_GUIDE.md)
- **Security Questions**: Contact your AWS security team

---

**✅ Using Bedrock Inference Profiles provides enterprise-grade cost control, governance, and monitoring for your AI Strategy Command Center deployment.**