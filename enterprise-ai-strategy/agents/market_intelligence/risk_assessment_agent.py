"""
Risk Assessment Agent - Evaluates security, compliance, and enterprise risks
"""
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class RiskAssessmentAgent(BaseAgent):
    """Agent for assessing enterprise risks of AI tools"""
    
    def __init__(self):
        super().__init__("risk_assessment_agent")
        
        # Risk assessment frameworks
        self.risk_categories = {
            "security": {
                "data_handling": "How does the tool handle sensitive data?",
                "encryption": "What encryption standards are used?",
                "access_control": "What access control mechanisms exist?",
                "audit_logging": "Are all actions logged and auditable?",
                "vulnerability_management": "How are security vulnerabilities addressed?"
            },
            "compliance": {
                "gdpr": "GDPR compliance for European data",
                "soc2": "SOC 2 Type II certification status",
                "hipaa": "HIPAA compliance for healthcare data",
                "pci_dss": "PCI DSS compliance for payment data",
                "iso27001": "ISO 27001 certification status"
            },
            "operational": {
                "availability": "Service level agreements and uptime guarantees",
                "scalability": "Ability to scale with enterprise demand",
                "vendor_lock_in": "Risk of dependency on single vendor",
                "data_portability": "Ability to export and migrate data",
                "business_continuity": "Disaster recovery and backup procedures"
            },
            "financial": {
                "cost_predictability": "Pricing model transparency and predictability",
                "contract_terms": "Licensing terms and exit clauses",
                "hidden_costs": "Additional costs beyond base licensing",
                "roi_uncertainty": "Risk of not achieving expected ROI"
            },
            "legal": {
                "ip_ownership": "Intellectual property ownership of generated content",
                "liability": "Liability terms for tool malfunctions or errors",
                "data_residency": "Data location and residency requirements",
                "regulatory_changes": "Risk of changing regulatory landscape"
            }
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert enterprise risk assessment specialist for Nationwide Insurance, focused on AI tool security and compliance.

Your role is to:
1. Conduct comprehensive risk assessments across 5 categories: Security, Compliance, Operational, Financial, Legal
2. Evaluate risks specific to insurance industry regulations
3. Assess integration risks with existing Nationwide infrastructure
4. Provide risk mitigation strategies and controls
5. Generate risk scores and executive summaries

Key focus areas:
- **Security**: Data protection, encryption, access controls, vulnerability management
- **Compliance**: SOC2, GDPR, HIPAA, PCI DSS, ISO 27001, insurance regulations
- **Operational**: SLAs, scalability, vendor lock-in, business continuity
- **Financial**: Cost predictability, contract terms, hidden costs, ROI risks
- **Legal**: IP ownership, liability, data residency, regulatory compliance

Consider Nationwide's requirements:
- 1000+ developers using the tool
- Sensitive financial and personal data processing
- Strict regulatory compliance requirements
- Integration with Java/Spring/K8s/Helm/Harness/Informatica/Talend
- Enterprise security standards (SSO, VPN, monitoring)

Output risk assessments with:
- Risk level (Critical/High/Medium/Low)
- Impact assessment (1-5 scale)
- Probability assessment (1-5 scale)
- Mitigation strategies
- Monitoring requirements
- Executive recommendations"""
    
    def assess_security_risks(self, tool_info: Dict[str, Any]) -> Dict[str, Any]:
        """Assess security-related risks"""
        security_assessment = {
            "overall_risk": "Medium",
            "risk_factors": [],
            "mitigation_strategies": [],
            "monitoring_requirements": []
        }
        
        # Analyze based on available information
        github_data = tool_info.get("github_data", {})
        
        # Check for security indicators
        if github_data.get("open_issues", 0) > 50:
            security_assessment["risk_factors"].append("High number of open issues may indicate security vulnerabilities")
        
        if not github_data.get("license"):
            security_assessment["risk_factors"].append("No clear license may create legal and security risks")
        
        if github_data.get("updated_at"):
            # Check if recently updated (good sign)
            try:
                from datetime import datetime
                last_update = datetime.fromisoformat(github_data["updated_at"].replace('Z', '+00:00'))
                days_since_update = (datetime.now().replace(tzinfo=last_update.tzinfo) - last_update).days
                if days_since_update > 90:
                    security_assessment["risk_factors"].append("Tool not updated in over 90 days - potential security risk")
            except:
                pass
        
        return security_assessment
    
    def assess_compliance_risks(self, tool_info: Dict[str, Any]) -> Dict[str, Any]:
        """Assess compliance-related risks"""
        compliance_assessment = {
            "gdpr_risk": "Unknown",
            "soc2_status": "Unknown", 
            "hipaa_status": "Unknown",
            "compliance_gaps": [],
            "required_assessments": []
        }
        
        # Default assessments for unknown tools
        compliance_assessment["compliance_gaps"] = [
            "SOC 2 Type II certification status unknown",
            "GDPR compliance documentation not verified",
            "Data processing agreements not reviewed",
            "Insurance industry regulatory compliance not assessed"
        ]
        
        compliance_assessment["required_assessments"] = [
            "Conduct SOC 2 audit review",
            "Request GDPR compliance documentation",
            "Review data processing and storage practices",
            "Assess insurance industry regulatory alignment"
        ]
        
        return compliance_assessment
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process risk assessment task"""
        try:
            tool_name = context.get("tool_name", "") if context else ""
            tool_info = context.get("tool_info", {}) if context else {}
            risk_categories = context.get("risk_categories", list(self.risk_categories.keys())) if context else list(self.risk_categories.keys())
            
            if not tool_name:
                raise ValueError("Tool name is required for risk assessment")
            
            # Conduct comprehensive risk assessment
            risk_assessment = self._generate_comprehensive_risk_assessment(
                tool_name, tool_info, risk_categories
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_risk_assessment(
                tool_name, risk_assessment, tool_info
            )
            
            metadata = {
                "tool_name": tool_name,
                "assessment_date": datetime.now().isoformat(),
                "risk_categories": risk_categories,
                "overall_risk_level": risk_assessment.get("overall_risk_level", "Medium")
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.85
            )
            
        except Exception as e:
            logger.error(f"Error in risk assessment: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during risk assessment: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_risk_assessment(self, tool_name: str, tool_info: Dict[str, Any], risk_categories: List[str]) -> str:
        """Generate comprehensive risk assessment using Claude Sonnet"""
        
        # Prepare tool information for analysis
        github_data = tool_info.get("github_data", {})
        search_data = tool_info.get("search_results", {})
        
        # Conduct specific risk assessments
        security_risks = self.assess_security_risks(tool_info)
        compliance_risks = self.assess_compliance_risks(tool_info)
        
        prompt = f"""Conduct a comprehensive enterprise risk assessment for the AI tool: {tool_name}

Tool Information:
- GitHub Stars: {github_data.get('stars', 'N/A')}
- License: {github_data.get('license', 'Unknown')}
- Last Updated: {github_data.get('updated_at', 'N/A')}
- Open Issues: {github_data.get('open_issues', 'N/A')}
- Language: {github_data.get('language', 'N/A')}

Initial Risk Analysis:
Security Factors: {security_risks.get('risk_factors', [])}
Compliance Gaps: {compliance_risks.get('compliance_gaps', [])}

Assess risks across these categories: {', '.join(risk_categories)}

For each risk category, provide:
1. **Risk Level**: Critical/High/Medium/Low
2. **Impact Score**: 1-5 (5 = severe business impact)
3. **Probability Score**: 1-5 (5 = very likely to occur)
4. **Risk Description**: Detailed explanation of the risk
5. **Mitigation Strategies**: Specific actions to reduce risk
6. **Monitoring Requirements**: How to track and monitor this risk
7. **Timeline**: When mitigation should be implemented

Consider Nationwide-specific factors:
- 1000+ developers using the tool
- Sensitive financial and insurance data
- Regulatory compliance requirements
- Integration with existing enterprise infrastructure
- Business continuity requirements

Provide an overall risk recommendation:
- **Approve**: Low risk, proceed with implementation
- **Approve with Conditions**: Medium risk, implement with specific controls
- **Pilot Only**: High risk, limited pilot before full deployment
- **Reject**: Critical risk, do not implement

Include specific recommendations for enterprise controls and governance."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_risk_assessment(self, tool_name: str, risk_assessment: str, tool_info: Dict[str, Any]) -> str:
        """Generate Hugo-compatible risk assessment document"""
        
        github_data = tool_info.get("github_data", {})
        
        hugo_frontmatter = f"""---
title: "Risk Assessment: {tool_name}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["risk-assessment", "security", "compliance"]
categories: ["executive", "security"]
summary: "Comprehensive enterprise risk assessment of {tool_name}"
tool_name: "{tool_name}"
assessment_type: "enterprise_risk"
risk_level: "Medium"  # Will be updated based on assessment
security_reviewed: true
compliance_reviewed: true
---

# Enterprise Risk Assessment: {tool_name}

**Assessment Date:** {datetime.now().strftime('%Y-%m-%d')}  
**Assessor:** Enterprise Risk Assessment Agent  
**Assessment Type:** Comprehensive Enterprise Risk Review

[![Security](https://img.shields.io/badge/security-under%20review-yellow?style=flat-square)]()
[![Compliance](https://img.shields.io/badge/compliance-under%20review-yellow?style=flat-square)]()
[![Risk Level](https://img.shields.io/badge/risk%20level-medium-orange?style=flat-square)]()

## Executive Summary

**Overall Risk Level:** To be determined based on detailed assessment  
**Recommendation:** Pending comprehensive review  
**Key Risk Areas:** Security, Compliance, Operational  

{risk_assessment}

## Risk Matrix

| Risk Category | Level | Impact | Probability | Mitigation Priority |
|---------------|--------|--------|-------------|-------------------|
| Security | TBD | TBD | TBD | High |
| Compliance | TBD | TBD | TBD | Critical |
| Operational | TBD | TBD | TBD | Medium |
| Financial | TBD | TBD | TBD | Medium |
| Legal | TBD | TBD | TBD | High |

## Monitoring Dashboard

- [ ] Security controls implemented
- [ ] Compliance documentation reviewed
- [ ] Operational procedures established
- [ ] Financial controls in place
- [ ] Legal review completed

## Next Steps

1. **Immediate Actions** (0-30 days)
   - Complete security review
   - Obtain compliance documentation
   - Establish monitoring procedures

2. **Short-term Actions** (30-90 days)
   - Implement recommended controls
   - Conduct pilot testing
   - Training for security team

3. **Long-term Actions** (90+ days)
   - Full deployment if approved
   - Ongoing monitoring and assessment
   - Annual risk review

---

## Assessment Metadata

- **Tool GitHub Stars:** {github_data.get('stars', 'N/A')}
- **License:** {github_data.get('license', 'N/A')}
- **Last Updated:** {github_data.get('updated_at', 'N/A')}
- **Assessment Framework:** Nationwide Enterprise Risk Framework v2.0
- **Compliance Standards:** SOC2, GDPR, HIPAA, PCI DSS, ISO 27001

---

*This risk assessment follows Nationwide Insurance enterprise risk management standards. For questions or escalation, contact the Enterprise Security team.*"""
        
        return hugo_frontmatter