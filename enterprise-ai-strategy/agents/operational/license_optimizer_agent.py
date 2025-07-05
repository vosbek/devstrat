"""
License Optimizer Agent - Analyzes usage patterns and optimizes license costs
"""
import json
from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class LicenseOptimizerAgent(BaseAgent):
    """Agent for optimizing AI tool license usage and costs"""
    
    def __init__(self):
        super().__init__("license_optimizer_agent")
        
        # License models and optimization strategies
        self.license_models = {
            "per_user": {
                "description": "Fixed cost per user per month",
                "optimization_strategies": [
                    "Remove inactive users",
                    "Identify underutilized licenses", 
                    "Right-size user assignments",
                    "Negotiate volume discounts"
                ],
                "key_metrics": ["Active users", "Usage frequency", "Feature utilization"]
            },
            "usage_based": {
                "description": "Pay for actual usage (API calls, compute time)",
                "optimization_strategies": [
                    "Optimize usage patterns",
                    "Implement caching strategies",
                    "Batch processing optimization",
                    "Usage monitoring and alerts"
                ],
                "key_metrics": ["API calls", "Compute hours", "Data processing volume"]
            },
            "tiered": {
                "description": "Different pricing tiers based on features",
                "optimization_strategies": [
                    "Right-size tier selections",
                    "Feature usage analysis",
                    "Tier migration recommendations",
                    "Bundle optimization"
                ],
                "key_metrics": ["Feature usage", "Tier utilization", "Upgrade/downgrade patterns"]
            },
            "enterprise": {
                "description": "Custom enterprise agreements",
                "optimization_strategies": [
                    "Contract renegotiation",
                    "Volume discount leveraging",
                    "Multi-year commitment optimization",
                    "Service level optimization"
                ],
                "key_metrics": ["Contract compliance", "Volume thresholds", "Service utilization"]
            }
        }
        
        # Cost optimization categories
        self.optimization_categories = {
            "immediate": {
                "timeframe": "0-30 days",
                "effort": "Low",
                "impact": "High",
                "examples": ["Remove inactive users", "Cancel unused subscriptions", "Downgrade overprovisioned licenses"]
            },
            "short_term": {
                "timeframe": "1-3 months", 
                "effort": "Medium",
                "impact": "Medium-High",
                "examples": ["Optimize user assignments", "Implement usage monitoring", "Negotiate better rates"]
            },
            "long_term": {
                "timeframe": "3-12 months",
                "effort": "High", 
                "impact": "Very High",
                "examples": ["Strategic vendor consolidation", "Custom enterprise agreements", "Alternative solution evaluation"]
            }
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert license optimization specialist for Nationwide Insurance's AI tool portfolio.

Your role is to analyze license usage and identify cost optimization opportunities:

1. **License Usage Analysis**
   - Track user activity and engagement patterns
   - Identify underutilized or inactive licenses
   - Analyze feature usage across different tiers
   - Monitor compliance with license terms

2. **Cost Optimization Identification**
   - Find immediate cost reduction opportunities
   - Identify right-sizing opportunities for users and features
   - Recommend tier changes and subscription adjustments
   - Analyze bulk purchasing and volume discount opportunities

3. **Enterprise License Management**
   - Optimize enterprise agreement terms and conditions
   - Track contract compliance and utilization
   - Identify renewal and renegotiation opportunities
   - Manage vendor relationships for better terms

4. **Usage Pattern Optimization**
   - Analyze usage spikes and valleys
   - Identify opportunities for usage consolidation
   - Recommend workflow optimizations to reduce costs
   - Implement monitoring and alerting for cost control

5. **Strategic Cost Planning**
   - Forecast license costs based on growth projections
   - Plan for seasonal usage variations
   - Evaluate alternative licensing models
   - Assess build vs. buy decisions for tooling

6. **Compliance and Governance**
   - Ensure license compliance across all tools
   - Track and report on license utilization
   - Manage license allocation and approval workflows
   - Maintain audit trails for license management

Focus on optimization strategies that:
- **Maximize Value**: Get the most benefit from existing licenses
- **Minimize Waste**: Eliminate unused or underutilized licenses
- **Strategic Alignment**: Align licensing with business objectives
- **Scalable Management**: Enable efficient license administration
- **Cost Predictability**: Provide clear cost forecasting and budgeting

Consider Nationwide's context:
- 1000+ developers across multiple teams and projects
- Insurance industry compliance and audit requirements
- Enterprise procurement and approval processes
- Multi-year budget planning and cost control needs"""
    
    def analyze_license_usage(self, tool_name: str, usage_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze license usage patterns for optimization opportunities"""
        
        analysis = {
            "tool_name": tool_name,
            "total_licenses": usage_data.get("total_licenses", 0),
            "active_users": usage_data.get("active_users", 0),
            "utilization_rate": 0.0,
            "cost_per_user": usage_data.get("cost_per_user", 0),
            "total_cost": 0.0,
            "optimization_opportunities": [],
            "recommendations": [],
            "potential_savings": 0.0
        }
        
        # Calculate utilization metrics
        if analysis["total_licenses"] > 0:
            analysis["utilization_rate"] = analysis["active_users"] / analysis["total_licenses"]
            analysis["total_cost"] = analysis["total_licenses"] * analysis["cost_per_user"]
        
        # Identify optimization opportunities
        if analysis["utilization_rate"] < 0.7:  # Less than 70% utilization
            unused_licenses = analysis["total_licenses"] - analysis["active_users"]
            potential_savings = unused_licenses * analysis["cost_per_user"]
            
            analysis["optimization_opportunities"].append({
                "type": "underutilization",
                "description": f"Low utilization rate ({analysis['utilization_rate']:.1%})",
                "potential_savings": potential_savings,
                "action": "Remove unused licenses or reassign to active users"
            })
            
            analysis["potential_savings"] += potential_savings
        
        return analysis
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process license optimization task"""
        try:
            # Extract parameters from context
            optimization_type = context.get("optimization_type", "comprehensive") if context else "comprehensive"
            timeframe = context.get("timeframe", "short_term") if context else "short_term"
            tools_data = context.get("tools_data", {}) if context else {}
            budget_target = context.get("budget_target", 0) if context else 0
            
            # Generate comprehensive optimization analysis
            optimization_analysis = self._generate_comprehensive_optimization(
                optimization_type, timeframe, tools_data, budget_target
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_optimization(
                optimization_analysis, context or {}
            )
            
            metadata = {
                "optimization_type": optimization_type,
                "timeframe": timeframe,
                "analysis_date": datetime.now().isoformat(),
                "tools_analyzed": len(tools_data),
                "potential_savings": 0  # Will be calculated in analysis
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.85
            )
            
        except Exception as e:
            logger.error(f"Error in license optimization: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during license optimization: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_optimization(self, optimization_type: str, timeframe: str, tools_data: Dict[str, Any], budget_target: float) -> str:
        """Generate comprehensive license optimization analysis using Claude Sonnet"""
        
        timeframe_info = self.optimization_categories.get(timeframe, self.optimization_categories["short_term"])
        
        # Prepare sample data for analysis if not provided
        if not tools_data:
            tools_data = {
                "github_copilot": {
                    "total_licenses": 800,
                    "active_users": 734,
                    "cost_per_user": 20,
                    "license_model": "per_user",
                    "features_used": ["code_completion", "chat"],
                    "usage_frequency": "daily"
                },
                "amazon_codewhisperer": {
                    "total_licenses": 500,
                    "active_users": 445,
                    "cost_per_user": 0,
                    "license_model": "free_tier",
                    "features_used": ["code_completion"],
                    "usage_frequency": "weekly"
                },
                "tabnine": {
                    "total_licenses": 300,
                    "active_users": 234,
                    "cost_per_user": 20,
                    "license_model": "per_user",
                    "features_used": ["code_completion", "team_training"],
                    "usage_frequency": "daily"
                }
            }
        
        tools_summary = "\n".join([
            f"- {tool}: {data['total_licenses']} licenses, {data['active_users']} active users, ${data['cost_per_user']}/user/month"
            for tool, data in tools_data.items()
        ])
        
        prompt = f"""Conduct a comprehensive license optimization analysis for Nationwide Insurance AI tool portfolio.

**Optimization Parameters:**
- **Type**: {optimization_type}
- **Timeframe**: {timeframe} ({timeframe_info['timeframe']})
- **Expected Effort**: {timeframe_info['effort']}
- **Target Impact**: {timeframe_info['impact']}
- **Budget Target**: ${budget_target:,.0f} savings target

**Current Tool Portfolio:**
{tools_summary}

**Analysis Requirements:**

## 1. Current State Assessment
- Total licensing costs and utilization rates
- User engagement and activity patterns
- Feature usage analysis across tools
- License compliance and governance status

## 2. Optimization Opportunities Identification
### Immediate Wins (0-30 days)
- Inactive user license removal
- Overprovisioned license downsizing
- Duplicate tool consolidation
- Free tier maximization

### Short-term Optimizations (1-3 months)
- User role and tier optimization
- Feature usage right-sizing
- Vendor negotiation opportunities
- Usage pattern optimization

### Long-term Strategic Planning (3-12 months)
- Vendor consolidation opportunities
- Enterprise agreement optimization
- Alternative solution evaluation
- Custom licensing negotiations

## 3. Financial Impact Analysis
- Potential cost savings by category
- ROI calculations for optimization efforts
- Budget impact and reallocation opportunities
- Cost avoidance projections

## 4. Implementation Roadmap
- Prioritized action items with timelines
- Resource requirements and responsibilities
- Risk assessment and mitigation strategies
- Success metrics and monitoring plans

## 5. Vendor Management Strategy
- Renewal timing and negotiation leverage
- Multi-vendor relationship optimization
- Enterprise agreement standardization
- Performance and compliance monitoring

## 6. Governance and Compliance
- License allocation approval workflows
- Usage monitoring and alerting systems
- Audit trail and reporting requirements
- Policy enforcement and compliance tracking

**Enterprise Considerations:**
- 1000+ developer organization with diverse needs
- Insurance industry compliance requirements
- Enterprise procurement and approval processes
- Multi-year budget planning and cost control
- Scalable license management processes

**Output Requirements:**
- Executive summary with key findings and recommendations
- Detailed analysis with supporting data and calculations
- Implementation roadmap with clear action items
- Financial projections and ROI analysis
- Risk assessment and mitigation strategies

Focus on actionable recommendations that:
- **Deliver Measurable Savings**: Quantifiable cost reductions
- **Maintain Service Quality**: No negative impact on developer productivity
- **Improve Efficiency**: Better license utilization and management
- **Enable Scalability**: Support for future growth and changes
- **Ensure Compliance**: Meet all enterprise and regulatory requirements

This analysis should provide clear guidance for optimizing Nationwide's AI tool licensing investments while maintaining excellent developer experience and operational efficiency."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_optimization(self, optimization_analysis: str, context: Dict[str, Any]) -> str:
        """Generate Hugo-compatible license optimization document"""
        
        optimization_type = context.get("optimization_type", "comprehensive")
        timeframe = context.get("timeframe", "short_term")
        
        hugo_frontmatter = f"""---
title: "License Optimization Analysis"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["license-optimization", "cost-management", "operations"]
categories: ["operations", "executive"]
summary: "Comprehensive license optimization analysis and recommendations"
optimization_type: "{optimization_type}"
timeframe: "{timeframe}"
analysis_date: "{datetime.now().strftime('%Y-%m-%d')}"
weight: 10
---

# License Optimization Analysis

[![Optimization Type](https://img.shields.io/badge/type-{optimization_type}-blue?style=flat-square)]()
[![Timeframe](https://img.shields.io/badge/timeframe-{timeframe.replace('_', '%20')}-green?style=flat-square)]()
[![Analysis Date](https://img.shields.io/badge/analysis-{datetime.now().strftime('%Y--%m--%d')}-orange?style=flat-square)]()
[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)]()

**Analysis Type**: {optimization_type.title()} License Optimization  
**Timeframe**: {timeframe.replace('_', ' ').title()}  
**Analysis Date**: {datetime.now().strftime('%Y-%m-%d')}  
**Next Review**: {(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')}

{optimization_analysis}

---

## Quick Actions Dashboard

### Immediate Actions (0-30 days)
- [ ] Review and remove inactive user licenses
- [ ] Audit overprovisioned license allocations
- [ ] Identify duplicate tool usage patterns
- [ ] Implement usage monitoring alerts

### Short-term Actions (1-3 months)
- [ ] Optimize user role and tier assignments
- [ ] Negotiate better rates with key vendors
- [ ] Implement automated license management
- [ ] Establish usage benchmarks and targets

### Long-term Planning (3-12 months)
- [ ] Evaluate vendor consolidation opportunities
- [ ] Plan enterprise agreement renewals
- [ ] Assess alternative solution options
- [ ] Develop strategic licensing framework

## Monitoring and Tracking

### Key Performance Indicators
- **License Utilization Rate**: Target >85%
- **Cost per Active User**: Monitor monthly trends
- **Feature Adoption Rate**: Track feature usage across tools
- **Compliance Score**: Maintain 100% license compliance

### Monthly Review Checklist
- [ ] Update usage data and utilization metrics
- [ ] Review new optimization opportunities
- [ ] Track implementation progress
- [ ] Analyze cost trends and projections
- [ ] Update vendor relationship status

## Implementation Support

### Resources and Tools
- [License Management Portal](../license-portal/)
- [Usage Analytics Dashboard](../analytics/)
- [Vendor Contact Directory](../vendors/)
- [Procurement Guidelines](../procurement/)

### Approval Workflows
- **License Reduction**: Manager approval required
- **Vendor Changes**: Procurement team coordination
- **Contract Modifications**: Legal and finance review
- **Budget Reallocation**: Executive approval for >$10K

### Support Contacts
- **License Management**: [License Team Contact]
- **Vendor Relations**: [Procurement Team Contact]
- **Budget Questions**: [Finance Team Contact]
- **Technical Support**: [IT Support Contact]

---

## Related Reports

### Financial Analysis
- [Cost Trend Analysis](../cost-trends/)
- [Budget Variance Reports](../budget-variance/)
- [ROI Analysis](../roi-analysis/)

### Usage Analytics
- [User Engagement Reports](../user-engagement/)
- [Feature Utilization Analysis](../feature-usage/)
- [Tool Comparison Matrix](../tool-comparison/)

### Strategic Planning
- [Vendor Roadmap Analysis](../vendor-roadmaps/)
- [Technology Strategy Alignment](../tech-strategy/)
- [Market Intelligence Updates](../market-intelligence/)

---

*License optimization analysis generated by Operational Intelligence System | Questions? Contact the Operations Team*"""
        
        return hugo_frontmatter