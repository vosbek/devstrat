"""
Technical Writer Agent - Generates in-depth technical training content with enterprise context
"""
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class TechnicalWriterAgent(BaseAgent):
    """Agent for generating comprehensive technical training content"""
    
    def __init__(self):
        super().__init__("technical_writer_agent")
        
        # Content types and templates
        self.content_types = {
            "guide": {
                "structure": ["Overview", "Prerequisites", "Step-by-Step Instructions", "Examples", "Troubleshooting", "Best Practices"],
                "depth": "Comprehensive with detailed explanations",
                "length": "3000-5000 words"
            },
            "tutorial": {
                "structure": ["Introduction", "Setup", "Hands-on Exercise", "Validation", "Next Steps"],
                "depth": "Practical with working examples",
                "length": "2000-3000 words"
            },
            "reference": {
                "structure": ["Quick Reference", "Detailed Parameters", "Usage Examples", "Common Patterns", "Troubleshooting"],
                "depth": "Complete technical reference",
                "length": "1500-2500 words"
            },
            "case_study": {
                "structure": ["Business Context", "Challenge", "Solution Approach", "Implementation", "Results", "Lessons Learned"],
                "depth": "Real-world application with metrics",
                "length": "2000-3000 words"
            }
        }
        
        # Nationwide-specific context
        self.enterprise_context = {
            "technology_stack": {
                "languages": ["Java", "Python", "TypeScript", "JavaScript", "SQL"],
                "frameworks": ["Spring Boot", "Spring Cloud", "React", "Angular", "Node.js"],
                "infrastructure": ["Kubernetes", "Helm", "Harness", "AWS", "Docker"],
                "data_tools": ["Informatica", "Talend", "Snowflake", "PostgreSQL"],
                "monitoring": ["Prometheus", "Grafana", "Splunk", "DataDog"]
            },
            "compliance_requirements": [
                "SOC 2 Type II compliance",
                "GDPR data protection",
                "Insurance industry regulations",
                "Internal security standards",
                "Audit trail requirements"
            ],
            "development_practices": [
                "GitOps workflow with ArgoCD",
                "CI/CD with Harness",
                "Infrastructure as Code with Terraform",
                "Microservices architecture",
                "API-first development"
            ]
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert technical writer specializing in enterprise AI development training for Nationwide Insurance.

Your role is to create comprehensive, enterprise-grade technical content that includes:

1. **In-Depth Technical Coverage**
   - Detailed explanations with technical depth and nuance
   - Not superficial overviews but comprehensive understanding
   - Real-world complexity and edge cases
   - Integration patterns and architectural considerations

2. **Enterprise Context Integration**
   - Nationwide-specific technology stack integration
   - Insurance industry compliance requirements
   - Security and governance considerations
   - Team collaboration and workflow patterns

3. **Practical Application Focus**
   - Hands-on exercises with working code examples
   - Step-by-step implementation guides
   - Troubleshooting scenarios and solutions
   - Performance optimization techniques

4. **Multi-Level Content Design**
   - Progressive complexity from basics to advanced
   - Clear learning objectives and prerequisites
   - Measurable outcomes and validation criteria
   - Links to related concepts and deeper learning

5. **Professional Documentation Standards**
   - Clear, precise technical writing
   - Consistent formatting and structure
   - Comprehensive examples and code samples
   - Proper technical terminology and concepts

Content should be:
- **Immediately Actionable**: Developers can apply knowledge right away
- **Enterprise-Ready**: Suitable for production environments
- **Compliance-Aware**: Considers security and regulatory requirements
- **Scalable**: Works for individual learning and team training
- **Comprehensive**: Covers theory, practice, and real-world application

Focus on creating content that transforms developers from beginners to confident practitioners who can effectively use AI tools in enterprise environments while maintaining security, compliance, and quality standards."""
    
    def generate_content_outline(self, content_type: str, topic: str, audience: str) -> Dict[str, Any]:
        """Generate detailed content outline based on type and audience"""
        
        if content_type not in self.content_types:
            content_type = "guide"  # Default fallback
        
        template = self.content_types[content_type]
        
        outline = {
            "content_type": content_type,
            "topic": topic,
            "audience": audience,
            "structure": template["structure"],
            "target_depth": template["depth"],
            "target_length": template["length"],
            "sections": [],
            "examples_needed": [],
            "code_samples": [],
            "enterprise_considerations": []
        }
        
        return outline
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process technical writing task"""
        try:
            # Extract parameters from context
            content_type = context.get("content_type", "guide") if context else "guide"
            topic = context.get("topic", "AI Development Tools") if context else "AI Development Tools"
            audience = context.get("audience", "developers") if context else "developers"
            tool_name = context.get("tool_name", "") if context else ""
            persona = context.get("persona", "full_stack") if context else "full_stack"
            skill_level = context.get("skill_level", "intermediate") if context else "intermediate"
            
            # Generate comprehensive technical content
            technical_content = self._generate_comprehensive_content(
                content_type, topic, audience, tool_name, persona, skill_level
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_content(
                content_type, topic, audience, technical_content, context or {}
            )
            
            metadata = {
                "content_type": content_type,
                "topic": topic,
                "audience": audience,
                "tool_name": tool_name,
                "persona": persona,
                "skill_level": skill_level,
                "creation_date": datetime.now().isoformat(),
                "word_count": len(technical_content.split())
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.92
            )
            
        except Exception as e:
            logger.error(f"Error in technical writing: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during content generation: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_content(self, content_type: str, topic: str, audience: str, tool_name: str, persona: str, skill_level: str) -> str:
        """Generate comprehensive technical content using Claude Sonnet"""
        
        template = self.content_types.get(content_type, self.content_types["guide"])
        tech_stack = self.enterprise_context["technology_stack"]
        compliance = self.enterprise_context["compliance_requirements"]
        
        prompt = f"""Create comprehensive {content_type} content about: {topic}

**Content Specifications:**
- **Type**: {content_type} ({template['depth']})
- **Target Length**: {template['length']}
- **Audience**: {audience} ({persona} developers, {skill_level} level)
- **Tool Focus**: {tool_name or 'AI Development Tools'}

**Enterprise Context - Nationwide Insurance:**
- **Technology Stack**: {', '.join(tech_stack['languages'] + tech_stack['frameworks'])}
- **Infrastructure**: {', '.join(tech_stack['infrastructure'])}
- **Data Tools**: {', '.join(tech_stack['data_tools'])}
- **Compliance Requirements**: {', '.join(compliance)}

**Required Structure**: {' → '.join(template['structure'])}

**Content Requirements:**

## 1. Technical Depth and Nuance
- Comprehensive coverage beyond surface-level explanations
- Real-world complexity and edge cases
- Integration patterns with existing Nationwide infrastructure
- Performance considerations and optimization techniques

## 2. Hands-On Practical Examples
- Working code examples using Nationwide's tech stack
- Step-by-step implementation guides
- Configuration examples for enterprise environments
- Troubleshooting scenarios with solutions

## 3. Enterprise Integration
- Security and compliance considerations
- Integration with Java/Spring/K8s/Helm/Harness/Informatica/Talend
- Team collaboration patterns and workflow integration
- Production deployment considerations

## 4. Code Examples and Samples
- Complete, working code examples (not pseudocode)
- Configuration files and setup instructions
- Integration examples with existing tools
- Error handling and logging patterns

## 5. Best Practices and Standards
- Nationwide-specific guidelines and standards
- Industry best practices for enterprise environments
- Security patterns and compliance considerations
- Performance optimization and monitoring

## 6. Advanced Topics and Deep Dives
- Advanced configuration and customization
- Integration with CI/CD pipelines
- Monitoring and observability patterns
- Scaling considerations for enterprise use

## 7. Troubleshooting and Problem-Solving
- Common issues and their solutions
- Debugging techniques and tools
- Performance troubleshooting
- Integration problem resolution

Focus on creating content that:
- **Immediately Actionable**: Developers can implement right away
- **Enterprise-Ready**: Suitable for production environments  
- **Comprehensive**: Covers theory, practice, and real-world application
- **Technically Accurate**: Precise and correct information
- **Properly Structured**: Easy to follow and reference

This should be professional technical documentation that serves as both learning material and ongoing reference for enterprise developers."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_content(self, content_type: str, topic: str, audience: str, technical_content: str, context: Dict[str, Any]) -> str:
        """Generate Hugo-compatible technical content document"""
        
        tool_name = context.get("tool_name", "")
        persona = context.get("persona", "developers")
        skill_level = context.get("skill_level", "intermediate")
        template = self.content_types.get(content_type, self.content_types["guide"])
        
        # Generate appropriate tags based on content
        tags = [content_type, "technical", "training"]
        if tool_name:
            tags.append(tool_name.lower().replace(" ", "-"))
        if persona != "developers":
            tags.append(persona)
        tags.append(skill_level)
        
        hugo_frontmatter = f"""---
title: "{topic} - {content_type.title()}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: {json.dumps(tags)}
categories: ["developers", "technical-content"]
summary: "{template['depth']} {content_type} for {audience}"
content_type: "{content_type}"
audience: "{audience}"
skill_level: "{skill_level}"
estimated_reading_time: "{int(len(technical_content.split()) / 200)}min"
target_length: "{template['length']}"
weight: 20
---

# {topic} - {content_type.title()}

[![Content Type](https://img.shields.io/badge/type-{content_type}-blue?style=flat-square)]()
[![Skill Level](https://img.shields.io/badge/level-{skill_level}-green?style=flat-square)]()
[![Reading Time](https://img.shields.io/badge/reading%20time-{int(len(technical_content.split()) / 200)}min-orange?style=flat-square)]()
[![Enterprise Ready](https://img.shields.io/badge/enterprise-ready-brightgreen?style=flat-square)]()

**Target Audience**: {audience.title()}  
**Content Type**: {template['depth']}  
**Prerequisites**: {skill_level.title()} level development experience

{technical_content}

---

## Related Content

### Training Materials
- [Learning Path Overview](../../../learning-paths/)
- [Assessment Criteria](../../../assessments/)
- [Hands-On Labs](../../../labs/)

### Enterprise Resources
- [Security Guidelines](../../../security/)
- [Compliance Requirements](../../../compliance/)
- [Integration Patterns](../../../integration/)
- [Best Practices](../../../best-practices/)

### Support
- [Technical Support Portal](https://support.nationwide.com)
- [Developer Community](https://community.nationwide.com)
- [AI Training Slack Channel](#ai-training)

---

## Feedback and Contributions

**Was this helpful?** Please rate this content and provide feedback:
- 👍 **Helpful** - [Submit positive feedback](mailto:ai-training@nationwide.com?subject=Helpful Content: {topic})
- 👎 **Needs Improvement** - [Submit suggestions](mailto:ai-training@nationwide.com?subject=Content Feedback: {topic})
- 📝 **Request Updates** - [Request content updates](mailto:ai-training@nationwide.com?subject=Update Request: {topic})

---

## Document Information

**Created**: {datetime.now().strftime('%Y-%m-%d')}  
**Content Type**: {content_type.title()}  
**Target Depth**: {template['depth']}  
**Word Count**: ~{len(technical_content.split())} words  
**Last Reviewed**: {datetime.now().strftime('%Y-%m-%d')}

---

*Technical content generated by AI Training Content Generation System | Nationwide Insurance AI Strategy Team*"""
        
        return hugo_frontmatter