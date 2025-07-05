"""
Curriculum Architect Agent - Designs comprehensive learning paths for different developer personas
"""
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class CurriculumArchitectAgent(BaseAgent):
    """Agent for designing comprehensive learning curricula for AI tools"""
    
    def __init__(self):
        super().__init__("curriculum_architect_agent")
        
        # Developer personas and their characteristics
        self.developer_personas = {
            "full_stack": {
                "title": "Full-Stack Developers",
                "description": "Frontend and backend developers working with React/Angular and Node.js/Java",
                "tech_stack": ["React", "Angular", "Node.js", "Java", "Spring", "TypeScript", "JavaScript"],
                "ai_use_cases": [
                    "Component generation",
                    "API development assistance", 
                    "Frontend debugging",
                    "Database query optimization",
                    "Code review automation"
                ],
                "learning_preferences": "Hands-on examples with immediate application",
                "time_constraints": "Limited time, prefer 15-30 minute modules"
            },
            "sre_devops": {
                "title": "SRE/DevOps Engineers", 
                "description": "Infrastructure and operations specialists managing CI/CD and deployment",
                "tech_stack": ["Kubernetes", "Helm", "Harness", "Docker", "Terraform", "AWS", "Jenkins"],
                "ai_use_cases": [
                    "Infrastructure as code generation",
                    "Monitoring script creation",
                    "Incident response automation",
                    "Log analysis and troubleshooting",
                    "Deployment pipeline optimization"
                ],
                "learning_preferences": "Problem-solving scenarios with real infrastructure challenges",
                "time_constraints": "Flexible, willing to invest time in deep learning"
            },
            "etl_data": {
                "title": "ETL/Data Engineers",
                "description": "Data pipeline specialists working with Informatica and Talend",
                "tech_stack": ["Informatica", "Talend", "SQL", "Python", "Spark", "Airflow", "Snowflake"],
                "ai_use_cases": [
                    "Data transformation logic generation",
                    "SQL query optimization",
                    "Pipeline troubleshooting",
                    "Data quality validation",
                    "Schema mapping assistance"
                ],
                "learning_preferences": "Data-driven examples with measurable outcomes",
                "time_constraints": "Moderate time availability, prefer structured learning"
            },
            "java_spring": {
                "title": "Java/Spring Developers",
                "description": "Backend Java developers using Spring ecosystem",
                "tech_stack": ["Java", "Spring Boot", "Spring Cloud", "Maven", "Gradle", "JUnit", "Microservices"],
                "ai_use_cases": [
                    "Microservice development",
                    "Test case generation",
                    "Code refactoring",
                    "Configuration management",
                    "API documentation generation"
                ],
                "learning_preferences": "Best practices and enterprise patterns",
                "time_constraints": "Structured learning with clear progression"
            },
            "k8s_helm": {
                "title": "K8s/Helm/Harness Engineers",
                "description": "Container orchestration and deployment specialists",
                "tech_stack": ["Kubernetes", "Helm", "Harness", "ArgoCD", "Istio", "Prometheus", "Grafana"],
                "ai_use_cases": [
                    "Helm chart generation",
                    "Kubernetes manifest creation",
                    "Deployment strategy optimization",
                    "Resource configuration",
                    "Troubleshooting assistance"
                ],
                "learning_preferences": "Hands-on labs with real cluster environments",
                "time_constraints": "Learning during maintenance windows and project gaps"
            }
        }
        
        # Learning path structure template
        self.learning_path_template = {
            "beginner": {
                "duration": "2-4 weeks",
                "time_commitment": "2-3 hours/week",
                "prerequisites": "Basic development experience",
                "objectives": [
                    "Understand AI tool capabilities",
                    "Complete first AI-assisted task",
                    "Integrate AI tools into daily workflow"
                ]
            },
            "intermediate": {
                "duration": "4-8 weeks", 
                "time_commitment": "3-5 hours/week",
                "prerequisites": "Comfortable with AI tool basics",
                "objectives": [
                    "Master advanced AI tool features",
                    "Optimize workflow efficiency",
                    "Contribute to team AI practices"
                ]
            },
            "advanced": {
                "duration": "8-12 weeks",
                "time_commitment": "5-8 hours/week",
                "prerequisites": "Proficient with multiple AI tools",
                "objectives": [
                    "Lead AI tool adoption initiatives",
                    "Customize and extend AI tools",
                    "Train and mentor other developers"
                ]
            }
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert curriculum architect for enterprise AI development training at Nationwide Insurance.

Your role is to design comprehensive, multi-level learning paths that include:

1. **Structured Learning Progressions**
   - Beginner → Intermediate → Advanced pathways
   - Clear prerequisites and learning objectives
   - Measurable competency milestones
   - Realistic time commitments

2. **Role-Specific Customization**
   - Tailored content for each developer persona
   - Relevant use cases and examples
   - Technology stack integration
   - Real-world scenarios

3. **Enterprise Integration**
   - Nationwide-specific workflows and standards
   - Integration with existing tools and processes
   - Compliance and security considerations
   - Team collaboration patterns

4. **Comprehensive Content Design**
   - Theoretical foundations and practical applications
   - Hands-on labs and exercises
   - Assessment and certification criteria
   - Resources and reference materials

5. **Learning Experience Optimization**
   - Multiple learning modalities (reading, watching, doing)
   - Self-paced and instructor-led options
   - Feedback loops and progress tracking
   - Community learning and peer support

Focus on creating learning experiences with:
- **Depth and Nuance**: Not superficial overviews but comprehensive understanding
- **Practical Application**: Immediately applicable skills and knowledge
- **Enterprise Context**: Relevant to insurance industry and Nationwide's environment
- **Scalable Delivery**: Can serve 1000+ developers efficiently
- **Measurable Outcomes**: Clear success criteria and competency validation

Generate curricula that transform developers from AI-curious to AI-proficient to AI-expert."""
    
    def design_learning_path(self, persona: str, skill_level: str, tool_focus: str = None) -> Dict[str, Any]:
        """Design a learning path for specific persona and skill level"""
        
        if persona not in self.developer_personas:
            raise ValueError(f"Unknown persona: {persona}")
        
        if skill_level not in self.learning_path_template:
            raise ValueError(f"Unknown skill level: {skill_level}")
        
        persona_info = self.developer_personas[persona]
        path_template = self.learning_path_template[skill_level]
        
        learning_path = {
            "persona": persona,
            "skill_level": skill_level,
            "title": f"{persona_info['title']} - {skill_level.title()} AI Development",
            "description": f"Comprehensive {skill_level} level training for {persona_info['description']}",
            "duration": path_template["duration"],
            "time_commitment": path_template["time_commitment"],
            "prerequisites": path_template["prerequisites"],
            "objectives": path_template["objectives"],
            "target_audience": persona_info["description"],
            "tech_stack_focus": persona_info["tech_stack"],
            "primary_use_cases": persona_info["ai_use_cases"],
            "learning_style": persona_info["learning_preferences"],
            "modules": [],
            "assessments": [],
            "resources": [],
            "certification": None
        }
        
        return learning_path
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process curriculum design task"""
        try:
            # Extract parameters from context
            persona = context.get("persona", "full_stack") if context else "full_stack"
            skill_level = context.get("skill_level", "beginner") if context else "beginner" 
            tool_focus = context.get("tool_focus") if context else None
            curriculum_type = context.get("curriculum_type", "comprehensive") if context else "comprehensive"
            
            # Design comprehensive curriculum
            curriculum_content = self._generate_comprehensive_curriculum(
                persona, skill_level, tool_focus, curriculum_type
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_curriculum(
                persona, skill_level, curriculum_content
            )
            
            metadata = {
                "persona": persona,
                "skill_level": skill_level,
                "tool_focus": tool_focus,
                "curriculum_type": curriculum_type,
                "creation_date": datetime.now().isoformat(),
                "estimated_duration": self.learning_path_template[skill_level]["duration"]
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.9
            )
            
        except Exception as e:
            logger.error(f"Error in curriculum design: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during curriculum design: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_curriculum(self, persona: str, skill_level: str, tool_focus: str, curriculum_type: str) -> str:
        """Generate comprehensive curriculum using Claude Sonnet"""
        
        persona_info = self.developer_personas[persona]
        path_template = self.learning_path_template[skill_level]
        
        prompt = f"""Design a comprehensive {skill_level}-level AI development curriculum for {persona_info['title']} at Nationwide Insurance.

**Target Audience**: {persona_info['description']}
**Technology Stack**: {', '.join(persona_info['tech_stack'])}
**Primary AI Use Cases**: {', '.join(persona_info['ai_use_cases'])}
**Learning Preferences**: {persona_info['learning_preferences']}
**Time Constraints**: {persona_info['time_constraints']}

**Curriculum Parameters**:
- **Duration**: {path_template['duration']}
- **Time Commitment**: {path_template['time_commitment']}
- **Prerequisites**: {path_template['prerequisites']}
- **Objectives**: {', '.join(path_template['objectives'])}
- **Tool Focus**: {tool_focus or 'Comprehensive AI development tools'}

Create a detailed curriculum that includes:

## 1. Learning Path Overview
- Clear value proposition for this persona
- Learning objectives and outcomes
- Success metrics and competency criteria
- Prerequisites and recommended preparation

## 2. Module Structure (8-12 detailed modules)
For each module provide:
- **Module Title and Duration**
- **Learning Objectives** (specific, measurable)
- **Key Concepts** (with depth and nuance)
- **Hands-on Activities** (practical, enterprise-relevant)
- **Assessment Criteria** (how success is measured)
- **Resources and References**

## 3. Practical Lab Exercises
Design 15-20 hands-on exercises that:
- Use real Nationwide technology stack
- Address actual business scenarios
- Build progressively in complexity
- Include success criteria and troubleshooting guides

## 4. Assessment and Certification
- **Progressive Assessments**: Quiz/practical after each module
- **Capstone Project**: Comprehensive real-world application
- **Competency Validation**: Practical skill demonstration
- **Certification Criteria**: Clear requirements for certification

## 5. Integration with Nationwide Environment
- **Existing Tool Integration**: How AI tools work with current stack
- **Security and Compliance**: Enterprise-specific considerations
- **Team Collaboration**: How to work with AI tools in team settings
- **Best Practices**: Nationwide-specific guidelines and standards

## 6. Ongoing Learning and Advanced Pathways
- **Next Steps**: Path to next skill level
- **Specialized Tracks**: Deep-dive areas
- **Community Learning**: Peer support and knowledge sharing
- **Staying Current**: How to keep skills updated

## 7. Support and Resources
- **Instructor Support**: When and how to get help
- **Peer Learning**: Study groups and collaboration
- **Reference Materials**: Documentation, tutorials, videos
- **Practice Environments**: Sandboxes and development environments

Focus on creating content with:
- **Enterprise Depth**: Not superficial but comprehensive understanding
- **Practical Application**: Immediately useful skills
- **Progressive Complexity**: Builds systematically from basics to advanced
- **Real-world Relevance**: Scenarios developers actually face
- **Measurable Outcomes**: Clear success criteria at each step

This curriculum should transform a developer from basic AI tool awareness to confident, productive AI-enhanced development practices."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_curriculum(self, persona: str, skill_level: str, curriculum_content: str) -> str:
        """Generate Hugo-compatible curriculum document"""
        
        persona_info = self.developer_personas[persona]
        path_template = self.learning_path_template[skill_level]
        
        hugo_frontmatter = f"""---
title: "{persona_info['title']} - {skill_level.title()} AI Development Curriculum"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["curriculum", "{persona}", "{skill_level}", "training"]
categories: ["developers", "training"]
summary: "Comprehensive {skill_level} AI development training for {persona_info['title']}"
persona: "{persona}"
skill_level: "{skill_level}"
duration: "{path_template['duration']}"
time_commitment: "{path_template['time_commitment']}"
tech_stack: {json.dumps(persona_info['tech_stack'])}
weight: {10 if skill_level == 'beginner' else 20 if skill_level == 'intermediate' else 30}
---

# {persona_info['title']} - {skill_level.title()} AI Development

[![Skill Level](https://img.shields.io/badge/skill%20level-{skill_level}-blue?style=flat-square)]()
[![Duration](https://img.shields.io/badge/duration-{path_template['duration'].replace(' ', '%20')}-green?style=flat-square)]()
[![Time Commitment](https://img.shields.io/badge/time%20commitment-{path_template['time_commitment'].replace(' ', '%20')}-orange?style=flat-square)]()

**Target Audience**: {persona_info['description']}  
**Prerequisites**: {path_template['prerequisites']}  
**Learning Style**: {persona_info['learning_preferences']}

## Technology Stack Focus
{chr(10).join([f"- {tech}" for tech in persona_info['tech_stack']])}

## Primary AI Use Cases
{chr(10).join([f"- {use_case}" for use_case in persona_info['ai_use_cases']])}

{curriculum_content}

---

## Quick Start Checklist

- [ ] Review prerequisites and prepare development environment
- [ ] Complete Module 1: Foundations
- [ ] Set up practice environment with Nationwide tools
- [ ] Join developer community and find study buddy
- [ ] Complete first hands-on lab exercise
- [ ] Schedule first assessment

## Learning Path Navigation

### Previous Level
{f"← [Beginner Level](../beginner/)" if skill_level == "intermediate" else f"← [Intermediate Level](../intermediate/)" if skill_level == "advanced" else "← This is the entry level"}

### Next Level  
{f"→ [Intermediate Level](../intermediate/)" if skill_level == "beginner" else f"→ [Advanced Level](../advanced/)" if skill_level == "intermediate" else "→ You've reached the highest level!"}

### Related Personas
- [Full-Stack Developers](../../full-stack/)
- [SRE/DevOps Engineers](../../sre/)
- [ETL/Data Engineers](../../etl/)
- [Java/Spring Developers](../../java-spring/)
- [K8s/Helm Engineers](../../k8s-helm/)

---

## Support and Resources

**Questions?** Contact the AI Training Team or post in the `#ai-training` Slack channel.

**Technical Support**: [Internal Support Portal](https://support.nationwide.com/ai-tools)

**Community**: [Developer AI Community](https://community.nationwide.com/ai-development)

---

*Curriculum designed by AI Training Content Generation Agent | Last updated: {datetime.now().strftime('%Y-%m-%d')}*"""
        
        return hugo_frontmatter