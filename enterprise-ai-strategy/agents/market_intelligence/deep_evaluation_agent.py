"""
Deep Evaluation Agent - Generates comprehensive 10-page evaluations of AI tools
"""
import requests
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class DeepEvaluationAgent(BaseAgent):
    """Agent for generating comprehensive evaluations of AI tools"""
    
    def __init__(self):
        super().__init__("deep_evaluation_agent")
    
    def get_system_prompt(self) -> str:
        return """You are an expert enterprise AI tool evaluation specialist for Nationwide Insurance.

Your role is to generate comprehensive 10-page evaluation reports that include:

1. **Executive Summary** (1 page)
   - Tool overview and primary value proposition
   - Enterprise fit assessment
   - Recommendation (Approve/Pilot/Reject/Monitor)
   - ROI projection and key metrics

2. **Technical Analysis** (3 pages)
   - Architecture and integration capabilities
   - Compatibility with Java/Spring/K8s/Helm/Harness/Informatica/Talend
   - Performance benchmarks and scalability
   - API and extensibility analysis

3. **Security & Compliance** (2 pages)
   - Security model and data handling
   - SOC2, GDPR, HIPAA compliance status
   - Enterprise security integration (SSO, VPN, etc.)
   - Risk assessment and mitigation strategies

4. **Business Case Analysis** (2 pages)
   - Cost breakdown (licensing, implementation, training)
   - ROI calculation with 3-year projection
   - Productivity impact for 1000+ developers
   - Competitive analysis vs alternatives

5. **Implementation Plan** (1 page)
   - Pilot strategy and success metrics
   - Training requirements for different developer personas
   - Timeline and resource requirements
   - Change management considerations

6. **Appendices** (1 page)
   - Technical specifications
   - Vendor information
   - Reference implementations
   - Additional resources

Focus on enterprise readiness for insurance industry with strict compliance requirements.
Generate detailed, professional content suitable for C-suite presentation.
Include specific recommendations for Nationwide's development teams."""
    
    def gather_tool_information(self, tool_name: str, tool_url: str = None) -> Dict[str, Any]:
        """Gather comprehensive information about the tool"""
        tool_info = {
            "basic_info": {},
            "github_data": {},
            "documentation": {},
            "community": {},
            "vendor_info": {}
        }
        
        try:
            # Try to gather GitHub information if it's a GitHub project
            if "github.com" in (tool_url or ""):
                github_info = self._get_github_info(tool_url)
                tool_info["github_data"] = github_info
            
            # Search for additional information
            search_info = self._search_tool_information(tool_name)
            tool_info["search_results"] = search_info
            
        except Exception as e:
            logger.error(f"Error gathering tool information: {str(e)}")
        
        return tool_info
    
    def _get_github_info(self, github_url: str) -> Dict[str, Any]:
        """Get GitHub repository information"""
        try:
            # Extract owner and repo from URL
            parts = github_url.rstrip('/').split('/')
            owner, repo = parts[-2], parts[-1]
            
            # Get repository data
            repo_url = f"https://api.github.com/repos/{owner}/{repo}"
            response = requests.get(repo_url)
            
            if response.status_code == 200:
                repo_data = response.json()
                
                # Get additional data
                releases_url = f"https://api.github.com/repos/{owner}/{repo}/releases"
                releases_response = requests.get(releases_url)
                releases = releases_response.json() if releases_response.status_code == 200 else []
                
                contributors_url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
                contributors_response = requests.get(contributors_url)
                contributors = contributors_response.json() if contributors_response.status_code == 200 else []
                
                return {
                    "stars": repo_data.get("stargazers_count", 0),
                    "forks": repo_data.get("forks_count", 0),
                    "watchers": repo_data.get("watchers_count", 0),
                    "open_issues": repo_data.get("open_issues_count", 0),
                    "language": repo_data.get("language", ""),
                    "size": repo_data.get("size", 0),
                    "created_at": repo_data.get("created_at", ""),
                    "updated_at": repo_data.get("updated_at", ""),
                    "description": repo_data.get("description", ""),
                    "homepage": repo_data.get("homepage", ""),
                    "license": repo_data.get("license", {}).get("name", "") if repo_data.get("license") else "",
                    "topics": repo_data.get("topics", []),
                    "has_issues": repo_data.get("has_issues", False),
                    "has_wiki": repo_data.get("has_wiki", False),
                    "has_pages": repo_data.get("has_pages", False),
                    "releases_count": len(releases),
                    "latest_release": releases[0] if releases else None,
                    "contributors_count": len(contributors),
                    "top_contributors": contributors[:5] if contributors else []
                }
        except Exception as e:
            logger.error(f"Error getting GitHub info: {str(e)}")
            return {}
    
    def _search_tool_information(self, tool_name: str) -> Dict[str, Any]:
        """Search for additional tool information"""
        # This would typically use search APIs or web scraping
        # For now, return placeholder data
        return {
            "web_mentions": f"Found {tool_name} mentioned across developer forums",
            "documentation_quality": "Comprehensive documentation available",
            "community_size": "Active community with regular updates",
            "enterprise_adoption": "Used by several Fortune 500 companies"
        }
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process deep evaluation task"""
        try:
            # Extract tool information from context
            tool_name = context.get("tool_name", "") if context else ""
            tool_url = context.get("tool_url", "") if context else ""
            tool_description = context.get("tool_description", "") if context else ""
            
            if not tool_name:
                raise ValueError("Tool name is required for deep evaluation")
            
            # Gather comprehensive tool information
            tool_info = self.gather_tool_information(tool_name, tool_url)
            
            # Generate comprehensive evaluation using Claude Sonnet
            evaluation_content = self._generate_comprehensive_evaluation(
                tool_name, tool_description, tool_info
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_evaluation(
                tool_name, evaluation_content, tool_info
            )
            
            metadata = {
                "tool_name": tool_name,
                "tool_url": tool_url,
                "evaluation_date": datetime.now().isoformat(),
                "github_stars": tool_info.get("github_data", {}).get("stars", 0),
                "evaluation_type": "comprehensive"
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.9
            )
            
        except Exception as e:
            logger.error(f"Error in deep evaluation: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during evaluation: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_evaluation(self, tool_name: str, description: str, tool_info: Dict[str, Any]) -> str:
        """Generate comprehensive evaluation using Claude Sonnet"""
        
        github_data = tool_info.get("github_data", {})
        search_data = tool_info.get("search_results", {})
        
        prompt = f"""Generate a comprehensive 10-page enterprise evaluation for the AI tool: {tool_name}

Tool Description: {description}

GitHub Data:
- Stars: {github_data.get('stars', 'N/A')}
- Language: {github_data.get('language', 'N/A')}
- Last Updated: {github_data.get('updated_at', 'N/A')}
- License: {github_data.get('license', 'N/A')}
- Issues: {github_data.get('open_issues', 'N/A')}

Additional Context:
- Documentation: {search_data.get('documentation_quality', 'Unknown')}
- Community: {search_data.get('community_size', 'Unknown')}
- Enterprise Use: {search_data.get('enterprise_adoption', 'Unknown')}

Generate a detailed evaluation following the 6-section structure:
1. Executive Summary with clear recommendation
2. Technical Analysis with integration assessment
3. Security & Compliance review
4. Business Case with ROI calculations
5. Implementation Plan with pilot strategy
6. Appendices with specifications

Focus on enterprise readiness for Nationwide Insurance with 1000+ developers.
Include specific assessments for different developer personas:
- Full-stack developers
- SRE/DevOps engineers
- ETL/Data engineers
- Java/Spring developers
- K8s/Helm/Harness engineers

Provide actionable recommendations and realistic timelines."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_evaluation(self, tool_name: str, evaluation_content: str, tool_info: Dict[str, Any]) -> str:
        """Generate Hugo-compatible evaluation document"""
        
        github_data = tool_info.get("github_data", {})
        
        hugo_frontmatter = f"""---
title: "Enterprise Evaluation: {tool_name}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["evaluation", "enterprise", "ai-tools"]
categories: ["tools", "executive"]
summary: "Comprehensive enterprise evaluation of {tool_name} for Nationwide Insurance"
tool_name: "{tool_name}"
evaluation_type: "comprehensive"
github_stars: {github_data.get('stars', 0)}
license: "{github_data.get('license', 'Unknown')}"
language: "{github_data.get('language', 'Unknown')}"
---

# Enterprise Evaluation: {tool_name}

**Evaluation Date:** {datetime.now().strftime('%Y-%m-%d')}  
**Evaluator:** AI Strategy Command Center  
**Tool Version:** Latest ({github_data.get('updated_at', 'Unknown')})

[![GitHub Stars](https://img.shields.io/github/stars/{tool_name.replace(' ', '')}?style=flat-square)](https://github.com/{tool_name.replace(' ', '')})
[![License](https://img.shields.io/badge/license-{github_data.get('license', 'Unknown').replace(' ', '%20')}-blue?style=flat-square)]()
[![Language](https://img.shields.io/badge/language-{github_data.get('language', 'Unknown')}-green?style=flat-square)]()

{evaluation_content}

---

## Evaluation Metadata

- **GitHub Stars:** {github_data.get('stars', 'N/A')}
- **Primary Language:** {github_data.get('language', 'N/A')}
- **License:** {github_data.get('license', 'N/A')}
- **Last Updated:** {github_data.get('updated_at', 'N/A')}
- **Open Issues:** {github_data.get('open_issues', 'N/A')}
- **Contributors:** {github_data.get('contributors_count', 'N/A')}

## Next Steps

1. **If Approved:** Proceed with pilot implementation
2. **If Pilot Recommended:** Set up 30-day pilot with 10-20 developers
3. **If Rejected:** Document decision rationale and review timeline
4. **If Monitor:** Add to quarterly review cycle

---

*This evaluation was generated by the Enterprise AI Strategy Command Center. For questions or additional analysis, contact the AI Strategy team.*"""
        
        return hugo_frontmatter