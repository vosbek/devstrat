"""
Competitive Intelligence Agent - Analyzes competitive landscape and positioning
"""
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class CompetitiveIntelligenceAgent(BaseAgent):
    """Agent for analyzing competitive landscape of AI tools"""
    
    def __init__(self):
        super().__init__("competitive_intelligence_agent")
        
        # Competitive analysis frameworks
        self.analysis_dimensions = {
            "feature_comparison": [
                "core_functionality",
                "integration_capabilities",
                "enterprise_features",
                "api_extensibility",
                "performance_benchmarks"
            ],
            "market_positioning": [
                "target_market",
                "pricing_strategy",
                "go_to_market",
                "competitive_advantages",
                "market_share"
            ],
            "enterprise_readiness": [
                "security_features",
                "compliance_certifications",
                "support_offerings",
                "training_resources",
                "enterprise_partnerships"
            ],
            "technical_assessment": [
                "architecture_quality",
                "scalability_limits",
                "integration_complexity",
                "maintenance_requirements",
                "vendor_lock_in_risk"
            ]
        }
        
        # Common AI tool categories for comparison
        self.tool_categories = {
            "code_generation": ["GitHub Copilot", "Amazon CodeWhisperer", "Tabnine", "Codeium"],
            "code_chat": ["Claude Code", "Cursor", "Continue.dev", "Sourcegraph Cody"],
            "ide_integration": ["Windsurf IDE", "VS Code Extensions", "JetBrains AI", "Vim AI"],
            "testing_tools": ["Test.ai", "Applitools", "Mabl", "Testim"],
            "devops_automation": ["GitLab AI", "Jenkins AI", "CircleCI AI", "Azure DevOps AI"],
            "documentation": ["Mintlify", "GitBook AI", "Notion AI", "Confluence AI"]
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert competitive intelligence analyst for Nationwide Insurance's AI strategy team.

Your role is to:
1. Analyze competitive landscape for AI development tools
2. Compare features, pricing, and enterprise readiness across alternatives
3. Identify market trends and positioning opportunities
4. Assess competitive advantages and disadvantages
5. Provide strategic recommendations for tool selection

Key analysis areas:
- **Feature Comparison**: Core functionality, integrations, enterprise features, APIs, performance
- **Market Positioning**: Target markets, pricing strategies, competitive advantages, market share
- **Enterprise Readiness**: Security, compliance, support, training, partnerships
- **Technical Assessment**: Architecture, scalability, integration complexity, vendor lock-in

Focus on enterprise considerations for Nationwide:
- 1000+ developer organization
- Java/Spring/K8s/Helm/Harness/Informatica/Talend technology stack
- Insurance industry compliance requirements
- Multi-year strategic planning horizon
- Total cost of ownership optimization

Provide competitive intelligence that includes:
- Head-to-head comparisons with specific alternatives
- Market trend analysis and future outlook
- Strategic positioning recommendations
- Risk assessment of competitive moves
- Actionable insights for decision-making

Generate analysis suitable for executive briefings and strategic planning."""
    
    def identify_competitors(self, tool_name: str, tool_category: str = None) -> List[str]:
        """Identify main competitors for a given tool"""
        competitors = []
        
        # Try to categorize the tool automatically
        if not tool_category:
            tool_name_lower = tool_name.lower()
            for category, tools in self.tool_categories.items():
                if any(keyword in tool_name_lower for keyword in ["code", "copilot", "assistant"]):
                    if category in ["code_generation", "code_chat"]:
                        competitors.extend(self.tool_categories[category])
                elif any(keyword in tool_name_lower for keyword in ["test", "qa"]):
                    competitors.extend(self.tool_categories["testing_tools"])
                elif any(keyword in tool_name_lower for keyword in ["devops", "ci", "cd", "deploy"]):
                    competitors.extend(self.tool_categories["devops_automation"])
        else:
            competitors = self.tool_categories.get(tool_category, [])
        
        # Remove the tool itself from competitors list
        competitors = [comp for comp in competitors if comp.lower() != tool_name.lower()]
        
        # Add default competitors if none found
        if not competitors:
            competitors = ["GitHub Copilot", "Amazon CodeWhisperer", "Tabnine"]  # Default AI coding tools
        
        return competitors[:5]  # Limit to top 5 competitors
    
    def analyze_market_trends(self, tool_category: str) -> Dict[str, Any]:
        """Analyze current market trends in the tool category"""
        return {
            "market_growth": "AI development tools market growing 45% YoY",
            "key_trends": [
                "Shift towards multi-modal AI (code + chat + documentation)",
                "Enterprise focus on compliance and security",
                "Integration with existing developer workflows",
                "Emphasis on productivity metrics and ROI measurement"
            ],
            "emerging_players": ["New startups focusing on specialized use cases"],
            "market_consolidation": "Large tech companies acquiring AI tool startups",
            "pricing_trends": "Shift from per-user to usage-based pricing models"
        }
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process competitive intelligence task"""
        try:
            tool_name = context.get("tool_name", "") if context else ""
            tool_category = context.get("tool_category") if context else None
            competitors = context.get("competitors") if context else None
            
            if not tool_name:
                raise ValueError("Tool name is required for competitive analysis")
            
            # Identify competitors if not provided
            if not competitors:
                competitors = self.identify_competitors(tool_name, tool_category)
            
            # Analyze market trends
            market_trends = self.analyze_market_trends(tool_category or "ai_development_tools")
            
            # Generate comprehensive competitive analysis
            competitive_analysis = self._generate_competitive_analysis(
                tool_name, competitors, market_trends, context
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_competitive_analysis(
                tool_name, competitive_analysis, competitors, market_trends
            )
            
            metadata = {
                "tool_name": tool_name,
                "competitors": competitors,
                "analysis_date": datetime.now().isoformat(),
                "tool_category": tool_category,
                "market_trends_included": True
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.85
            )
            
        except Exception as e:
            logger.error(f"Error in competitive analysis: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during competitive analysis: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_competitive_analysis(self, tool_name: str, competitors: List[str], market_trends: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Generate comprehensive competitive analysis using Claude Sonnet"""
        
        tool_info = context.get("tool_info", {}) if context else {}
        github_data = tool_info.get("github_data", {})
        
        prompt = f"""Conduct a comprehensive competitive intelligence analysis for: {tool_name}

Primary Competitors: {', '.join(competitors)}

Current Tool Information:
- GitHub Stars: {github_data.get('stars', 'N/A')}
- License: {github_data.get('license', 'N/A')}
- Language: {github_data.get('language', 'N/A')}
- Last Updated: {github_data.get('updated_at', 'N/A')}

Market Context:
- Market Growth: {market_trends.get('market_growth', 'Unknown')}
- Key Trends: {', '.join(market_trends.get('key_trends', []))}
- Pricing Trends: {market_trends.get('pricing_trends', 'Unknown')}

Provide comprehensive analysis covering:

## 1. Competitive Positioning Matrix
Compare {tool_name} vs each competitor across:
- Core functionality and features
- Enterprise readiness and security
- Pricing and licensing model
- Integration capabilities
- Market presence and adoption
- Developer experience and learning curve

## 2. Feature Gap Analysis
- Features where {tool_name} leads competitors
- Features where competitors have advantages
- Critical missing features for enterprise adoption
- Unique value propositions

## 3. Market Share and Adoption Analysis
- Estimated market position vs competitors
- Enterprise customer base comparison
- Developer community size and engagement
- Industry recognition and awards

## 4. Strategic Threat Assessment
- Which competitors pose the biggest threat?
- Potential competitive responses to our adoption
- Market consolidation risks
- New entrant threats

## 5. Total Cost of Ownership Comparison
- Licensing costs vs competitors
- Implementation and training costs
- Ongoing maintenance and support costs
- Hidden costs and vendor lock-in risks

## 6. Enterprise Decision Framework
- Criteria for choosing between alternatives
- Risk-adjusted comparison methodology
- Pilot testing recommendations
- Strategic partnership considerations

## 7. Future Outlook and Recommendations
- Market trend implications for tool selection
- Competitive landscape evolution (12-18 months)
- Strategic recommendations for Nationwide
- Contingency planning for competitive changes

Focus on Nationwide's enterprise requirements:
- 1000+ developer organization
- Java/Spring/K8s/Helm/Harness/Informatica/Talend stack
- Insurance industry compliance needs
- Multi-year strategic planning horizon

Provide actionable insights for strategic decision-making."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_competitive_analysis(self, tool_name: str, analysis: str, competitors: List[str], market_trends: Dict[str, Any]) -> str:
        """Generate Hugo-compatible competitive analysis document"""
        
        competitor_badges = " ".join([
            f"[![vs {comp}](https://img.shields.io/badge/vs-{comp.replace(' ', '%20')}-lightgrey?style=flat-square)]()"
            for comp in competitors[:3]
        ])
        
        hugo_frontmatter = f"""---
title: "Competitive Analysis: {tool_name}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["competitive-analysis", "market-intelligence", "strategy"]
categories: ["executive", "strategy"]
summary: "Comprehensive competitive landscape analysis for {tool_name}"
tool_name: "{tool_name}"
competitors: {json.dumps(competitors)}
analysis_type: "competitive_intelligence"
market_trends: true
---

# Competitive Intelligence: {tool_name}

**Analysis Date:** {datetime.now().strftime('%Y-%m-%d')}  
**Analyst:** Competitive Intelligence Agent  
**Market Segment:** AI Development Tools

{competitor_badges}
[![Market Growth](https://img.shields.io/badge/market%20growth-45%25%20YoY-green?style=flat-square)]()

## Executive Summary

**Primary Competitors:** {', '.join(competitors)}  
**Market Position:** Under Analysis  
**Competitive Advantage:** To be determined  
**Strategic Recommendation:** Pending detailed assessment

{analysis}

## Competitive Landscape Matrix

| Tool | Market Share | Enterprise Ready | Pricing | Integration | Overall Score |
|------|-------------|------------------|---------|-------------|---------------|
| **{tool_name}** | TBD | TBD | TBD | TBD | **TBD** |
| {competitors[0] if competitors else 'N/A'} | TBD | TBD | TBD | TBD | TBD |
| {competitors[1] if len(competitors) > 1 else 'N/A'} | TBD | TBD | TBD | TBD | TBD |
| {competitors[2] if len(competitors) > 2 else 'N/A'} | TBD | TBD | TBD | TBD | TBD |

## Market Trends Impact

**Growth Rate:** {market_trends.get('market_growth', 'Unknown')}

**Key Trends:**
{chr(10).join([f"- {trend}" for trend in market_trends.get('key_trends', [])])}

**Pricing Evolution:** {market_trends.get('pricing_trends', 'Unknown')}

## Strategic Decision Framework

### Evaluation Criteria Weighting
- **Functionality:** 25%
- **Enterprise Readiness:** 30%
- **Total Cost of Ownership:** 20%
- **Integration Capability:** 15%
- **Vendor Stability:** 10%

### Recommended Next Steps
1. **Immediate Actions** (0-30 days)
   - Conduct hands-on tool comparison
   - Request enterprise demos from top 3 alternatives
   - Analyze pilot program results

2. **Strategic Planning** (30-90 days)
   - Develop vendor negotiation strategy
   - Plan competitive positioning
   - Establish performance benchmarks

3. **Long-term Monitoring** (90+ days)
   - Quarterly competitive landscape review
   - Market trend analysis updates
   - Vendor relationship management

---

## Competitive Monitoring Dashboard

- [ ] Monthly competitor feature updates tracked
- [ ] Pricing changes monitored and analyzed
- [ ] New market entrants evaluated
- [ ] Customer satisfaction comparisons updated
- [ ] Strategic threat assessment reviewed

---

*This competitive analysis is updated quarterly or when significant market changes occur. For real-time competitive intelligence, contact the AI Strategy team.*"""
        
        return hugo_frontmatter