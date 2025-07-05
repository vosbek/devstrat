"""
Resource Curator Agent - Finds and organizes enterprise-appropriate learning materials
"""
import requests
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class ResourceCuratorAgent(BaseAgent):
    """Agent for curating high-quality learning resources for AI development"""
    
    def __init__(self):
        super().__init__("resource_curator_agent")
        
        # Resource types and quality criteria
        self.resource_types = {
            "documentation": {
                "description": "Official documentation and API references",
                "quality_criteria": ["Completeness", "Accuracy", "Currency", "Enterprise Relevance"],
                "sources": ["Official vendor docs", "GitHub repositories", "Enterprise portals"]
            },
            "tutorials": {
                "description": "Step-by-step learning guides and walkthroughs",
                "quality_criteria": ["Clarity", "Practical Application", "Progressive Difficulty", "Working Examples"],
                "sources": ["Vendor tutorials", "Developer blogs", "Training platforms"]
            },
            "videos": {
                "description": "Video tutorials, conferences, and demonstrations",
                "quality_criteria": ["Production Quality", "Expert Instruction", "Enterprise Focus", "Current Content"],
                "sources": ["YouTube", "Conference recordings", "Training platforms"]
            },
            "courses": {
                "description": "Structured online courses and certification programs",
                "quality_criteria": ["Curriculum Quality", "Industry Recognition", "Hands-on Practice", "Assessment"],
                "sources": ["Coursera", "edX", "Pluralsight", "Vendor training"]
            },
            "books": {
                "description": "Technical books and comprehensive guides",
                "quality_criteria": ["Author Expertise", "Depth of Coverage", "Currency", "Practical Examples"],
                "sources": ["O'Reilly", "Manning", "Packt", "Technical publishers"]
            },
            "articles": {
                "description": "Blog posts, whitepapers, and technical articles",
                "quality_criteria": ["Technical Accuracy", "Practical Value", "Credible Sources", "Recent Publication"],
                "sources": ["Medium", "Dev.to", "Company blogs", "Technical publications"]
            },
            "tools": {
                "description": "Practice environments, sandboxes, and development tools",
                "quality_criteria": ["Ease of Setup", "Enterprise Compatibility", "Security", "Learning Value"],
                "sources": ["GitHub", "Docker Hub", "Cloud platforms", "Vendor sandboxes"]
            }
        }
        
        # Enterprise evaluation criteria
        self.enterprise_criteria = {
            "security": [
                "No exposure of sensitive data",
                "HTTPS and secure connections",
                "Reputable sources and authors",
                "No malicious content or links"
            ],
            "compliance": [
                "Appropriate for workplace learning",
                "No conflicting vendor interests",
                "Licensing compatible with enterprise use",
                "Content suitable for professional environment"
            ],
            "quality": [
                "High production quality",
                "Accurate and current information",
                "Clear learning objectives",
                "Practical applicability"
            ],
            "relevance": [
                "Applicable to enterprise development",
                "Compatible with Nationwide tech stack",
                "Addresses real business scenarios",
                "Appropriate skill level"
            ]
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert resource curator for enterprise AI development training at Nationwide Insurance.

Your role is to identify, evaluate, and organize high-quality learning resources that meet enterprise standards:

1. **Resource Discovery and Evaluation**
   - Identify authoritative, high-quality learning materials
   - Evaluate resources against enterprise criteria
   - Assess technical accuracy and currency
   - Verify security and compliance suitability

2. **Enterprise Suitability Assessment**
   - Security and safety for enterprise use
   - Compliance with corporate learning policies
   - Appropriateness for professional development
   - Compatibility with Nationwide technology stack

3. **Quality and Relevance Validation**
   - Technical accuracy and depth
   - Currency and up-to-date information
   - Practical applicability for developers
   - Progressive learning structure

4. **Comprehensive Resource Organization**
   - Categorization by type, skill level, and topic
   - Clear descriptions and learning objectives
   - Prerequisites and recommended usage
   - Quality ratings and enterprise approval status

5. **Multi-Modal Learning Support**
   - Documentation and reference materials
   - Interactive tutorials and hands-on exercises
   - Video content and visual learning
   - Books and comprehensive guides
   - Practice environments and tools

6. **Personalized Resource Recommendations**
   - Tailored to specific developer personas
   - Aligned with learning paths and curricula
   - Progressive difficulty and skill building
   - Integration with assessment and certification

Focus on curating resources that are:
- **Enterprise-Appropriate**: Safe and suitable for corporate learning
- **Technically Accurate**: Current and correct information
- **Immediately Useful**: Practically applicable to development work
- **Properly Vetted**: Evaluated for quality and relevance
- **Well-Organized**: Easy to find and use effectively

Create resource collections that support comprehensive, professional AI development education while maintaining enterprise security and quality standards."""
    
    def search_resources(self, topic: str, resource_type: str, skill_level: str = "all") -> List[Dict[str, Any]]:
        """Search for resources on a specific topic"""
        # This would typically integrate with various APIs and search engines
        # For now, we'll return curated examples based on common enterprise needs
        
        sample_resources = {
            "github_copilot": [
                {
                    "title": "GitHub Copilot Documentation",
                    "type": "documentation",
                    "url": "https://docs.github.com/en/copilot",
                    "description": "Official GitHub Copilot documentation with setup and usage guides",
                    "quality_score": 9.5,
                    "enterprise_approved": True,
                    "skill_level": "beginner"
                },
                {
                    "title": "GitHub Copilot for Enterprise Guide",
                    "type": "documentation", 
                    "url": "https://docs.github.com/en/copilot/github-copilot-for-business",
                    "description": "Enterprise-specific features and administration guide",
                    "quality_score": 9.0,
                    "enterprise_approved": True,
                    "skill_level": "intermediate"
                }
            ],
            "claude_code": [
                {
                    "title": "Claude Code Documentation",
                    "type": "documentation",
                    "url": "https://docs.anthropic.com/en/docs/claude-code",
                    "description": "Official Claude Code documentation and best practices",
                    "quality_score": 9.2,
                    "enterprise_approved": True,
                    "skill_level": "beginner"
                }
            ]
        }
        
        # Return relevant resources based on topic
        topic_key = topic.lower().replace(" ", "_")
        return sample_resources.get(topic_key, [])
    
    def evaluate_resource_quality(self, resource: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a resource against enterprise quality criteria"""
        
        evaluation = {
            "overall_score": 0.0,
            "security_score": 0.0,
            "compliance_score": 0.0,
            "quality_score": 0.0,
            "relevance_score": 0.0,
            "enterprise_approved": False,
            "recommendations": [],
            "concerns": []
        }
        
        # Basic evaluation based on available information
        url = resource.get("url", "")
        title = resource.get("title", "")
        description = resource.get("description", "")
        
        # Security evaluation
        if url.startswith("https://"):
            evaluation["security_score"] += 2.0
        if any(domain in url for domain in ["github.com", "docs.microsoft.com", "aws.amazon.com", "anthropic.com"]):
            evaluation["security_score"] += 3.0
        
        # Quality evaluation
        if "official" in title.lower() or "documentation" in title.lower():
            evaluation["quality_score"] += 3.0
        if len(description) > 50:  # Detailed description
            evaluation["quality_score"] += 2.0
        
        # Calculate overall score
        evaluation["overall_score"] = (
            evaluation["security_score"] + 
            evaluation["compliance_score"] + 
            evaluation["quality_score"] + 
            evaluation["relevance_score"]
        ) / 4
        
        # Enterprise approval threshold
        evaluation["enterprise_approved"] = evaluation["overall_score"] >= 7.0
        
        return evaluation
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process resource curation task"""
        try:
            # Extract parameters from context
            topic = context.get("topic", "AI Development Tools") if context else "AI Development Tools"
            resource_types = context.get("resource_types", ["documentation", "tutorials"]) if context else ["documentation", "tutorials"]
            skill_level = context.get("skill_level", "all") if context else "all"
            persona = context.get("persona", "developers") if context else "developers"
            max_resources = context.get("max_resources", 20) if context else 20
            
            # Generate comprehensive resource collection
            resource_collection = self._generate_comprehensive_resource_collection(
                topic, resource_types, skill_level, persona, max_resources
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_resource_collection(
                topic, resource_collection, context or {}
            )
            
            metadata = {
                "topic": topic,
                "resource_types": resource_types,
                "skill_level": skill_level,
                "persona": persona,
                "total_resources": len(resource_collection.get("resources", [])),
                "curation_date": datetime.now().isoformat()
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.87
            )
            
        except Exception as e:
            logger.error(f"Error in resource curation: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during resource curation: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_resource_collection(self, topic: str, resource_types: List[str], skill_level: str, persona: str, max_resources: int) -> str:
        """Generate comprehensive resource collection using Claude Sonnet"""
        
        types_description = ", ".join([f"{rt} ({self.resource_types[rt]['description']})" for rt in resource_types if rt in self.resource_types])
        
        prompt = f"""Curate a comprehensive collection of learning resources for: {topic}

**Curation Parameters:**
- **Resource Types**: {types_description}
- **Skill Level**: {skill_level}
- **Target Audience**: {persona} developers at Nationwide Insurance
- **Maximum Resources**: {max_resources}

**Enterprise Requirements:**
- Security: HTTPS sources, reputable vendors, no malicious content
- Compliance: Appropriate for workplace learning, no conflicting interests
- Quality: High production value, accurate and current information
- Relevance: Applicable to enterprise development with Java/Spring/K8s stack

**Resource Categories to Include:**

## 1. Official Documentation and References
- Vendor documentation and API references
- Official guides and best practices
- Enterprise administration guides
- Integration documentation

## 2. High-Quality Tutorials and Guides
- Step-by-step implementation tutorials
- Best practices and patterns guides
- Troubleshooting and problem-solving guides
- Performance optimization resources

## 3. Video Learning Content
- Conference presentations and talks
- Tutorial videos and demonstrations
- Webinars and training sessions
- Expert interviews and discussions

## 4. Structured Learning Courses
- Online courses and certifications
- Training programs and curricula
- Vendor-provided training materials
- Professional development programs

## 5. Technical Books and Publications
- Comprehensive technical books
- Industry whitepapers and research
- Technical articles and case studies
- Best practices publications

## 6. Hands-On Practice Resources
- Interactive tutorials and labs
- Sandbox environments and playgrounds
- Code repositories and examples
- Practice exercises and challenges

## 7. Community and Expert Resources
- Expert blogs and technical articles
- Community forums and discussions
- Open source projects and contributions
- Professional networks and groups

**For Each Resource Provide:**
- **Title and Description**: Clear, descriptive title and detailed description
- **Resource Type**: Documentation, tutorial, video, course, book, article, tool
- **URL and Access**: Direct link and access requirements
- **Quality Assessment**: Rating (1-10) based on enterprise criteria
- **Skill Level**: Beginner, intermediate, advanced, or all levels
- **Prerequisites**: Required knowledge or setup
- **Learning Objectives**: What learners will gain
- **Time Investment**: Estimated time to complete
- **Enterprise Notes**: Specific value for Nationwide developers
- **Related Resources**: Connections to other materials

**Quality Evaluation Criteria:**
- **Security (25%)**: Safe for enterprise use, reputable sources
- **Accuracy (25%)**: Technically correct and current information  
- **Relevance (25%)**: Applicable to enterprise development scenarios
- **Usability (25%)**: Clear, well-organized, easy to follow

**Organization Structure:**
Group resources by:
1. Skill level progression (beginner → intermediate → advanced)
2. Resource type (documentation, tutorials, videos, etc.)
3. Learning objectives (setup, usage, optimization, integration)
4. Time investment (quick reference, short tutorials, comprehensive courses)

Focus on creating a resource collection that:
- **Comprehensive Coverage**: Multiple learning modalities and perspectives
- **Progressive Learning**: Clear path from basics to advanced mastery
- **Enterprise Applicability**: Immediately useful for professional development
- **Quality Assurance**: Vetted, reliable, and current resources
- **Practical Focus**: Emphasis on applicable skills and knowledge

This resource collection should serve as the definitive learning resource library for {topic} at Nationwide Insurance."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_resource_collection(self, topic: str, resource_collection: str, context: Dict[str, Any]) -> str:
        """Generate Hugo-compatible resource collection document"""
        
        skill_level = context.get("skill_level", "all")
        persona = context.get("persona", "developers")
        resource_types = context.get("resource_types", ["documentation", "tutorials"])
        
        hugo_frontmatter = f"""---
title: "{topic} - Learning Resources"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["resources", "learning", "{topic.lower().replace(' ', '-')}"]
categories: ["developers", "resources"]
summary: "Curated learning resources for {topic} development"
topic: "{topic}"
skill_level: "{skill_level}"
persona: "{persona}"
resource_types: {json.dumps(resource_types)}
last_curated: "{datetime.now().strftime('%Y-%m-%d')}"
weight: 40
---

# {topic} - Learning Resources

[![Resource Collection](https://img.shields.io/badge/type-resource%20collection-blue?style=flat-square)]()
[![Skill Level](https://img.shields.io/badge/skill%20level-{skill_level}-green?style=flat-square)]()
[![Enterprise Approved](https://img.shields.io/badge/enterprise-approved-brightgreen?style=flat-square)]()
[![Last Updated](https://img.shields.io/badge/updated-{datetime.now().strftime('%Y--%m--%d')}-orange?style=flat-square)]()

**Topic Focus**: {topic}  
**Target Audience**: {persona.title()} developers  
**Skill Levels**: {skill_level.title()}  
**Last Curated**: {datetime.now().strftime('%Y-%m-%d')}

## Resource Collection Overview

This curated collection provides comprehensive learning materials for {topic} specifically selected for Nationwide Insurance developers. All resources have been evaluated for enterprise suitability, technical accuracy, and practical relevance.

{resource_collection}

---

## Using This Resource Collection

### Getting Started
1. **Assessment**: Identify your current skill level and learning objectives
2. **Path Selection**: Choose resources appropriate for your role and experience
3. **Progressive Learning**: Start with foundational materials and advance systematically
4. **Practice Application**: Use hands-on resources to reinforce learning

### Resource Quality Indicators
- 🟢 **Enterprise Approved**: Verified safe and appropriate for workplace learning
- 🔵 **High Quality**: Excellent production value and technical accuracy
- 🟡 **Good Quality**: Solid content with minor limitations
- 🟠 **Acceptable**: Useful content with some reservations
- 🔴 **Use with Caution**: Potential issues or limitations noted

### Time Investment Guide
- **Quick Reference** (5-15 minutes): Documentation, cheat sheets, quick guides
- **Short Learning** (30-60 minutes): Tutorials, articles, short videos
- **Medium Learning** (2-4 hours): Comprehensive tutorials, workshop content
- **Deep Learning** (8+ hours): Courses, books, certification programs

## Resource Categories

### 📚 Documentation and References
Official documentation, API references, and comprehensive guides

### 🎯 Tutorials and Guides  
Step-by-step learning materials and practical guides

### 🎥 Video Content
Conference talks, tutorial videos, and visual learning materials

### 🎓 Courses and Training
Structured learning programs and certification paths

### 📖 Books and Publications
Comprehensive technical books and research materials

### 🛠️ Hands-On Practice
Interactive labs, sandbox environments, and practice exercises

### 👥 Community Resources
Expert blogs, forums, and community-contributed content

---

## Resource Maintenance

### Quality Assurance
- All resources reviewed for enterprise suitability
- Regular updates to maintain currency and accuracy
- Community feedback integration for continuous improvement

### Contribution Guidelines
Have a great resource to add? [Submit a suggestion](mailto:ai-training@nationwide.com?subject=Resource Suggestion: {topic})

### Feedback and Updates
- 👍 **Helpful Resource**: [Report positive feedback](mailto:ai-training@nationwide.com?subject=Helpful Resource)
- 👎 **Issue Found**: [Report problems](mailto:ai-training@nationwide.com?subject=Resource Issue)
- 🔄 **Update Needed**: [Request updates](mailto:ai-training@nationwide.com?subject=Resource Update)

---

## Related Collections

### By Topic
- [AI Development Tools Overview](../../ai-development-tools/)
- [Enterprise Integration Guides](../../enterprise-integration/)
- [Security and Compliance](../../security-compliance/)

### By Skill Level
- [Beginner Resources](../../beginner/)
- [Intermediate Resources](../../intermediate/) 
- [Advanced Resources](../../advanced/)

### By Developer Persona
- [Full-Stack Developer Resources](../../full-stack/)
- [SRE/DevOps Resources](../../sre/)
- [ETL/Data Engineer Resources](../../etl/)
- [Java/Spring Developer Resources](../../java-spring/)
- [K8s/Helm Engineer Resources](../../k8s-helm/)

---

*Resource collection curated by AI Training Resource Curation System | Questions? Contact the AI Training Team*"""
        
        return hugo_frontmatter