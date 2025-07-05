"""
Executive Briefing Agent - Creates leadership-ready reports and position papers
"""
import json
from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class ExecutiveBriefingAgent(BaseAgent):
    """Agent for creating executive-level briefings and position papers"""
    
    def __init__(self):
        super().__init__("executive_briefing_agent")
        
        # Executive briefing types and templates
        self.briefing_types = {
            "strategic_update": {
                "description": "Regular strategic progress and status update",
                "frequency": "Monthly",
                "sections": ["Executive Summary", "Key Achievements", "Strategic Metrics", "Issues and Risks", "Resource Requirements", "Next Actions"],
                "length": "2 pages",
                "audience": "C-Suite, VPs, Directors"
            },
            "tool_position": {
                "description": "Position paper on specific AI tool evaluation",
                "frequency": "As needed",
                "sections": ["Tool Overview", "Strategic Fit", "Business Case", "Risk Assessment", "Implementation Plan", "Recommendation"],
                "length": "3-4 pages",
                "audience": "Technology leaders, Procurement, Finance"
            },
            "market_intelligence": {
                "description": "AI tool market landscape and competitive analysis",
                "frequency": "Quarterly",
                "sections": ["Market Overview", "Key Trends", "Competitive Positioning", "Opportunities", "Threats", "Strategic Implications"],
                "length": "4-5 pages",
                "audience": "Strategic planning, Technology leadership"
            },
            "investment_review": {
                "description": "Investment performance and optimization analysis",
                "frequency": "Quarterly",
                "sections": ["Investment Summary", "ROI Analysis", "Performance Metrics", "Cost Optimization", "Future Investment Plans"],
                "length": "3 pages",
                "audience": "Finance, Budget committee, C-Suite"
            },
            "risk_alert": {
                "description": "Critical risk identification and mitigation",
                "frequency": "As needed",
                "sections": ["Risk Summary", "Impact Assessment", "Mitigation Strategies", "Resource Requirements", "Timeline", "Escalation Plan"],
                "length": "2 pages",
                "audience": "Risk committee, C-Suite, Legal"
            }
        }
        
        # Executive communication principles
        self.communication_principles = {
            "clarity": "Use clear, direct language without technical jargon",
            "brevity": "Communicate key points concisely and efficiently",
            "action_oriented": "Focus on decisions needed and actions required",
            "data_driven": "Support recommendations with concrete data and metrics",
            "risk_aware": "Address potential risks and mitigation strategies",
            "business_focused": "Emphasize business value and strategic alignment"
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert executive communications specialist for Nationwide Insurance's AI strategy leadership team.

Your role is to create high-quality, executive-level briefings and position papers that inform strategic decision-making:

1. **Executive Communication Excellence**
   - Clear, concise writing appropriate for C-suite audience
   - Strategic focus on business impact and value creation
   - Data-driven insights with actionable recommendations
   - Professional presentation with executive summary format

2. **Strategic Briefing Development**
   - Regular strategic updates and progress reports
   - Tool evaluation position papers and recommendations
   - Market intelligence and competitive analysis briefings
   - Investment review and optimization analyses
   - Risk alerts and mitigation strategy documents

3. **Business Case Development**
   - ROI analysis and financial impact assessment
   - Cost-benefit analysis and optimization opportunities
   - Resource requirement planning and justification
   - Timeline and milestone definition
   - Success metrics and KPI framework

4. **Risk and Opportunity Analysis**
   - Strategic risk identification and assessment
   - Competitive threat and opportunity analysis
   - Technology trend impact evaluation
   - Regulatory and compliance consideration
   - Market timing and positioning analysis

5. **Decision Support Framework**
   - Clear recommendation with supporting rationale
   - Alternative options analysis and comparison
   - Implementation planning and resource requirements
   - Success criteria and measurement framework
   - Escalation and approval pathway definition

6. **Stakeholder Communication**
   - Audience-appropriate messaging and detail level
   - Cross-functional impact consideration
   - Change management and communication planning
   - Stakeholder alignment and buy-in strategies
   - Feedback integration and iteration process

Focus on creating briefings that:
- **Enable Informed Decisions**: Provide all necessary information for strategic choices
- **Drive Action**: Clear next steps and resource requirements
- **Manage Risk**: Identify and address potential challenges
- **Create Value**: Emphasize business benefits and competitive advantages
- **Build Confidence**: Professional presentation with data-backed recommendations

Consider Nationwide's executive context:
- Insurance industry strategic priorities and constraints
- Enterprise-scale implementation and change management
- Regulatory compliance and risk management requirements
- Multi-year strategic planning and investment cycles
- Stakeholder diversity and communication preferences"""
    
    def create_briefing_outline(self, briefing_type: str, topic: str) -> Dict[str, Any]:
        """Create structured outline for executive briefing"""
        
        if briefing_type not in self.briefing_types:
            briefing_type = "strategic_update"  # Default fallback
        
        template = self.briefing_types[briefing_type]
        
        outline = {
            "briefing_type": briefing_type,
            "topic": topic,
            "template": template,
            "sections": template["sections"],
            "target_length": template["length"],
            "target_audience": template["audience"],
            "key_messages": [],
            "supporting_data": [],
            "recommendations": []
        }
        
        return outline
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process executive briefing creation task"""
        try:
            # Extract parameters from context
            briefing_type = context.get("briefing_type", "strategic_update") if context else "strategic_update"
            topic = context.get("topic", "AI Strategy Update") if context else "AI Strategy Update"
            urgency = context.get("urgency", "normal") if context else "normal"
            audience = context.get("audience", "executive_team") if context else "executive_team"
            supporting_data = context.get("supporting_data", {}) if context else {}
            
            # Generate comprehensive executive briefing
            executive_briefing = self._generate_comprehensive_briefing(
                briefing_type, topic, urgency, audience, supporting_data
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_briefing(
                briefing_type, topic, executive_briefing, context or {}
            )
            
            metadata = {
                "briefing_type": briefing_type,
                "topic": topic,
                "urgency": urgency,
                "audience": audience,
                "creation_date": datetime.now().isoformat(),
                "word_count": len(executive_briefing.split())
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.91
            )
            
        except Exception as e:
            logger.error(f"Error in executive briefing creation: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during briefing creation: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_briefing(self, briefing_type: str, topic: str, urgency: str, audience: str, supporting_data: Dict[str, Any]) -> str:
        """Generate comprehensive executive briefing using Claude Sonnet"""
        
        template = self.briefing_types.get(briefing_type, self.briefing_types["strategic_update"])
        
        # Prepare supporting data summary
        data_summary = "No specific data provided"
        if supporting_data:
            data_points = []
            for key, value in supporting_data.items():
                if isinstance(value, (int, float)):
                    data_points.append(f"{key}: {value:,}")
                else:
                    data_points.append(f"{key}: {value}")
            data_summary = ", ".join(data_points)
        
        prompt = f"""Create a comprehensive executive briefing for Nationwide Insurance leadership.

**Briefing Specifications:**
- **Type**: {briefing_type} ({template['description']})
- **Topic**: {topic}
- **Urgency**: {urgency}
- **Target Audience**: {audience} ({template['audience']})
- **Target Length**: {template['length']}
- **Required Sections**: {', '.join(template['sections'])}

**Supporting Data Available:**
{data_summary}

**Executive Briefing Requirements:**

## Document Structure and Content

### Executive Summary (1/2 page)
- **Key Message**: Primary finding or recommendation in 1-2 sentences
- **Business Impact**: Financial and strategic implications
- **Action Required**: Specific decisions or approvals needed from leadership
- **Timeline**: Critical dates and milestones
- **Resource Requirements**: Budget, personnel, or infrastructure needs

### Main Content Sections
Based on briefing type, develop each required section:

{chr(10).join([f"**{section}**: Comprehensive analysis with data, insights, and recommendations" for section in template['sections']])}

### Strategic Context and Analysis
- **Business Alignment**: Connection to Nationwide's strategic objectives
- **Competitive Positioning**: Impact on market position and competitive advantage
- **Risk Assessment**: Potential challenges and mitigation strategies
- **Opportunity Analysis**: Value creation and growth opportunities
- **Stakeholder Impact**: Effects on different business units and functions

### Financial Analysis
- **Investment Requirements**: Capital and operational expenditure needs
- **ROI Projections**: Expected returns and payback periods
- **Cost-Benefit Analysis**: Comprehensive financial impact assessment
- **Budget Implications**: Impact on current and future budget allocations
- **Risk-Adjusted Returns**: Financial analysis considering implementation risks

### Implementation Planning
- **Phase Approach**: Logical implementation sequence and milestones
- **Resource Allocation**: Personnel, budget, and infrastructure requirements
- **Timeline and Milestones**: Critical path and key deliverables
- **Success Metrics**: KPIs and measurement framework
- **Governance and Oversight**: Decision-making and approval processes

### Risk Management and Mitigation
- **Strategic Risks**: Potential threats to business objectives
- **Operational Risks**: Implementation and execution challenges
- **Financial Risks**: Cost overruns and ROI shortfalls
- **Mitigation Strategies**: Specific actions to address identified risks
- **Contingency Planning**: Alternative approaches and fallback options

### Recommendations and Next Steps
- **Primary Recommendation**: Clear, specific action for leadership approval
- **Alternative Options**: Other viable approaches with pros/cons analysis
- **Immediate Actions**: Steps to be taken in next 30 days
- **Resource Decisions**: Budget, personnel, and procurement approvals needed
- **Follow-up and Reporting**: Ongoing communication and review schedule

**Executive Communication Standards:**
- **Clarity**: Use clear, direct language without unnecessary technical jargon
- **Brevity**: Communicate key points concisely and efficiently
- **Action-Oriented**: Focus on decisions needed and specific actions required
- **Data-Driven**: Support all recommendations with concrete data and metrics
- **Risk-Aware**: Address potential challenges and mitigation strategies upfront
- **Business-Focused**: Emphasize business value and strategic alignment throughout

**Nationwide Enterprise Context:**
- Insurance industry regulatory and compliance requirements
- Enterprise-scale implementation across 1000+ developers
- Multi-year strategic planning and investment cycles
- Risk management and audit requirements
- Stakeholder diversity including IT, Finance, Legal, Operations

**Professional Presentation Standards:**
- Executive summary that stands alone as complete communication
- Logical flow and clear section transitions
- Data visualization recommendations where appropriate
- Professional tone appropriate for C-suite audience
- Actionable recommendations with clear success criteria

This briefing should enable informed decision-making and drive appropriate action while managing risks and ensuring alignment with Nationwide's strategic objectives."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_briefing(self, briefing_type: str, topic: str, executive_briefing: str, context: Dict[str, Any]) -> str:
        """Generate Hugo-compatible executive briefing document"""
        
        urgency = context.get("urgency", "normal")
        audience = context.get("audience", "executive_team")
        template = self.briefing_types.get(briefing_type, self.briefing_types["strategic_update"])
        
        # Set urgency badge color
        urgency_colors = {
            "critical": "red",
            "high": "orange", 
            "normal": "blue",
            "low": "green"
        }
        urgency_color = urgency_colors.get(urgency, "blue")
        
        hugo_frontmatter = f"""---
title: "Executive Briefing: {topic}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["executive", "briefing", "{briefing_type}", "{urgency}"]
categories: ["executive", "strategic"]
summary: "{template['description']} for executive leadership"
briefing_type: "{briefing_type}"
topic: "{topic}"
urgency: "{urgency}"
audience: "{audience}"
target_length: "{template['length']}"
creation_date: "{datetime.now().strftime('%Y-%m-%d')}"
weight: 5
---

# Executive Briefing: {topic}

[![Briefing Type](https://img.shields.io/badge/type-{briefing_type.replace('_', '%20')}-blue?style=for-the-badge)]()
[![Urgency](https://img.shields.io/badge/urgency-{urgency}-{urgency_color}?style=for-the-badge)]()
[![Audience](https://img.shields.io/badge/audience-{audience.replace('_', '%20')}-green?style=for-the-badge)]()

**Document Type**: {template['description']}  
**Target Audience**: {template['audience']}  
**Urgency Level**: {urgency.title()}  
**Document Date**: {datetime.now().strftime('%Y-%m-%d')}  
**Next Review**: {(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')}

---

{executive_briefing}

---

## Executive Action Items

### Immediate Decisions Required
- [ ] **Budget Approval**: Review and approve resource allocation
- [ ] **Strategic Direction**: Confirm alignment with business objectives
- [ ] **Risk Acceptance**: Acknowledge and accept identified risks
- [ ] **Timeline Approval**: Confirm implementation schedule

### Follow-up Actions
- [ ] **Stakeholder Communication**: Brief relevant business units
- [ ] **Resource Allocation**: Assign personnel and budget
- [ ] **Governance Setup**: Establish oversight and reporting
- [ ] **Progress Monitoring**: Schedule regular review meetings

## Document Distribution

### Primary Recipients
- **CEO**: Strategic decision and resource approval
- **CTO**: Technical direction and implementation oversight
- **CFO**: Financial approval and budget allocation
- **CISO**: Security and risk management review

### Secondary Recipients
- **Business Unit Leaders**: Impact assessment and preparation
- **IT Leadership**: Implementation planning and coordination
- **Legal Counsel**: Compliance and contract review
- **Procurement**: Vendor management and negotiations

## Related Documents

### Supporting Analysis
- [Detailed Technical Analysis](../technical-analysis/)
- [Financial Impact Assessment](../financial-analysis/)
- [Risk Assessment Report](../risk-assessment/)
- [Market Intelligence Update](../market-intelligence/)

### Implementation Planning
- [Project Charter and Timeline](../project-charter/)
- [Resource Requirements Plan](../resource-plan/)
- [Change Management Strategy](../change-management/)
- [Success Metrics Framework](../success-metrics/)

### Governance and Oversight
- [Steering Committee Charter](../steering-committee/)
- [Reporting and Review Schedule](../reporting-schedule/)
- [Escalation Procedures](../escalation/)
- [Audit and Compliance Plan](../compliance-plan/)

---

## Executive Summary for Distribution

**Subject**: {topic} - Executive Decision Required

**Key Message**: {topic} briefing prepared for leadership review and decision.

**Action Required**: Review briefing document and provide direction on recommended approach and resource allocation.

**Timeline**: Decision requested by {(datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')} to maintain project timeline.

**Contact**: AI Strategy Team for questions or additional analysis.

---

## Confidentiality and Distribution

**Classification**: Internal Use - Executive Leadership  
**Distribution**: Restricted to executive team and designated stakeholders  
**Retention**: Maintain for audit and compliance purposes  
**Review Cycle**: {template['frequency']} or as business conditions change

---

*Executive briefing prepared by AI Strategy Intelligence System | For questions or additional analysis, contact the AI Strategy Team*"""
        
        return hugo_frontmatter