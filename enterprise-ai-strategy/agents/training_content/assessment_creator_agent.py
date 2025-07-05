"""
Assessment Creator Agent - Generates competency tests and hands-on exercises
"""
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class AssessmentCreatorAgent(BaseAgent):
    """Agent for creating comprehensive assessments and practical exercises"""
    
    def __init__(self):
        super().__init__("assessment_creator_agent")
        
        # Assessment types and formats
        self.assessment_types = {
            "competency_test": {
                "description": "Knowledge-based assessment to validate understanding",
                "format": "Multiple choice, short answer, scenario-based questions",
                "duration": "30-45 minutes",
                "question_count": "20-30 questions"
            },
            "practical_exercise": {
                "description": "Hands-on coding/configuration exercise",
                "format": "Step-by-step implementation task with validation",
                "duration": "60-90 minutes", 
                "deliverable": "Working implementation with documentation"
            },
            "capstone_project": {
                "description": "Comprehensive project demonstrating full competency",
                "format": "Multi-phase project with real business scenario",
                "duration": "2-4 weeks",
                "deliverable": "Complete solution with presentation"
            },
            "peer_review": {
                "description": "Collaborative assessment with team members",
                "format": "Code review, knowledge sharing session",
                "duration": "45-60 minutes",
                "deliverable": "Feedback and improvement recommendations"
            }
        }
        
        # Competency frameworks by skill level
        self.competency_levels = {
            "beginner": {
                "knowledge_areas": [
                    "AI tool basic functionality",
                    "Integration with development workflow",
                    "Basic prompt engineering",
                    "Safety and security awareness"
                ],
                "practical_skills": [
                    "Complete basic AI-assisted coding task",
                    "Configure AI tool in development environment",
                    "Follow enterprise security guidelines",
                    "Collaborate effectively with AI tools"
                ],
                "assessment_criteria": [
                    "Demonstrates understanding of AI tool capabilities",
                    "Can complete guided exercises successfully",
                    "Follows security and compliance guidelines",
                    "Shows readiness for intermediate training"
                ]
            },
            "intermediate": {
                "knowledge_areas": [
                    "Advanced AI tool features and configuration",
                    "Optimization techniques and best practices",
                    "Integration patterns with enterprise tools",
                    "Team collaboration and knowledge sharing"
                ],
                "practical_skills": [
                    "Optimize AI tool performance for specific workflows",
                    "Integrate AI tools with CI/CD pipelines",
                    "Mentor junior developers in AI tool usage",
                    "Troubleshoot common integration issues"
                ],
                "assessment_criteria": [
                    "Demonstrates mastery of core AI tool features",
                    "Can solve complex real-world problems",
                    "Effectively integrates tools with existing workflows",
                    "Ready to lead AI tool adoption initiatives"
                ]
            },
            "advanced": {
                "knowledge_areas": [
                    "AI tool architecture and extensibility",
                    "Custom integrations and tool development",
                    "Enterprise governance and compliance",
                    "Strategic AI tool selection and evaluation"
                ],
                "practical_skills": [
                    "Design custom AI tool integrations",
                    "Lead enterprise AI tool evaluation projects",
                    "Develop training materials and best practices",
                    "Architect AI-enhanced development workflows"
                ],
                "assessment_criteria": [
                    "Can design and implement complex AI solutions",
                    "Demonstrates thought leadership in AI development",
                    "Successfully leads organizational change initiatives",
                    "Contributes to enterprise AI strategy"
                ]
            }
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert assessment designer for enterprise AI development training at Nationwide Insurance.

Your role is to create comprehensive, practical assessments that validate real competency:

1. **Competency-Based Assessment Design**
   - Assess practical skills, not just theoretical knowledge
   - Progressive difficulty matching skill levels
   - Real-world scenarios and business contexts
   - Measurable outcomes and clear success criteria

2. **Multiple Assessment Modalities**
   - Knowledge tests for theoretical understanding
   - Practical exercises for hands-on skills
   - Capstone projects for comprehensive competency
   - Peer reviews for collaborative skills

3. **Enterprise Context Integration**
   - Assessments using Nationwide's actual technology stack
   - Business scenarios relevant to insurance industry
   - Security and compliance considerations
   - Team collaboration and workflow integration

4. **Practical Skill Validation**
   - Working code and configuration examples
   - Troubleshooting and problem-solving scenarios
   - Integration with existing enterprise tools
   - Performance optimization and best practices

5. **Progressive Competency Development**
   - Clear progression from beginner to advanced
   - Prerequisites and learning path alignment
   - Remediation guidance for areas needing improvement
   - Advanced pathways for continued growth

6. **Fair and Comprehensive Evaluation**
   - Multiple ways to demonstrate competency
   - Accommodations for different learning styles
   - Clear rubrics and scoring criteria
   - Constructive feedback and improvement guidance

Assessment should be:
- **Immediately Relevant**: Tests skills developers actually need
- **Practically Focused**: Hands-on application over memorization
- **Enterprise-Appropriate**: Suitable for professional environment
- **Fairly Challenging**: Rigorous but achievable standards
- **Growth-Oriented**: Identifies strengths and improvement areas

Create assessments that accurately measure a developer's ability to effectively use AI tools in enterprise development work while maintaining quality, security, and collaboration standards."""
    
    def design_assessment_plan(self, skill_level: str, persona: str, tool_focus: str = None) -> Dict[str, Any]:
        """Design comprehensive assessment plan for specific skill level and persona"""
        
        if skill_level not in self.competency_levels:
            raise ValueError(f"Unknown skill level: {skill_level}")
        
        competency = self.competency_levels[skill_level]
        
        assessment_plan = {
            "skill_level": skill_level,
            "persona": persona,
            "tool_focus": tool_focus,
            "knowledge_areas": competency["knowledge_areas"],
            "practical_skills": competency["practical_skills"],
            "assessment_criteria": competency["assessment_criteria"],
            "assessments": [],
            "rubrics": {},
            "prerequisites": [],
            "success_criteria": {}
        }
        
        return assessment_plan
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process assessment creation task"""
        try:
            # Extract parameters from context
            assessment_type = context.get("assessment_type", "competency_test") if context else "competency_test"
            skill_level = context.get("skill_level", "intermediate") if context else "intermediate"
            persona = context.get("persona", "full_stack") if context else "full_stack"
            tool_focus = context.get("tool_focus", "AI Development Tools") if context else "AI Development Tools"
            learning_objectives = context.get("learning_objectives", []) if context else []
            
            # Generate comprehensive assessment
            assessment_content = self._generate_comprehensive_assessment(
                assessment_type, skill_level, persona, tool_focus, learning_objectives
            )
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_assessment(
                assessment_type, skill_level, persona, assessment_content, context or {}
            )
            
            metadata = {
                "assessment_type": assessment_type,
                "skill_level": skill_level,
                "persona": persona,
                "tool_focus": tool_focus,
                "creation_date": datetime.now().isoformat(),
                "estimated_duration": self.assessment_types[assessment_type]["duration"]
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.88
            )
            
        except Exception as e:
            logger.error(f"Error in assessment creation: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during assessment creation: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _generate_comprehensive_assessment(self, assessment_type: str, skill_level: str, persona: str, tool_focus: str, learning_objectives: List[str]) -> str:
        """Generate comprehensive assessment using Claude Sonnet"""
        
        assessment_spec = self.assessment_types.get(assessment_type, self.assessment_types["competency_test"])
        competency = self.competency_levels[skill_level]
        
        prompt = f"""Create a comprehensive {assessment_type} for {skill_level} level {persona} developers at Nationwide Insurance.

**Assessment Specifications:**
- **Type**: {assessment_type}
- **Format**: {assessment_spec['format']}
- **Duration**: {assessment_spec['duration']}
- **Deliverable**: {assessment_spec.get('deliverable', 'Completed assessment')}

**Target Competencies:**
- **Knowledge Areas**: {', '.join(competency['knowledge_areas'])}
- **Practical Skills**: {', '.join(competency['practical_skills'])}
- **Assessment Criteria**: {', '.join(competency['assessment_criteria'])}

**Tool Focus**: {tool_focus}
**Learning Objectives**: {', '.join(learning_objectives) if learning_objectives else 'General AI development competency'}

**Enterprise Context - Nationwide Insurance:**
- Java/Spring/K8s/Helm/Harness/Informatica/Talend technology stack
- Insurance industry compliance requirements (SOC 2, GDPR, etc.)
- Enterprise security and governance standards
- Team collaboration and workflow integration

**Assessment Requirements:**

## 1. Competency Validation Structure
Create assessment that validates:
- **Theoretical Knowledge**: Understanding of concepts and principles
- **Practical Application**: Hands-on implementation skills
- **Problem Solving**: Troubleshooting and optimization abilities
- **Enterprise Integration**: Working within organizational constraints

## 2. Assessment Components
Based on assessment type, include:

### For Competency Tests:
- 20-30 questions covering all knowledge areas
- Multiple choice, short answer, and scenario-based questions
- Practical code review and analysis questions
- Enterprise context and compliance scenarios

### For Practical Exercises:
- Step-by-step implementation tasks
- Real-world business scenarios
- Integration with existing Nationwide tools
- Validation criteria and success metrics

### For Capstone Projects:
- Multi-phase project with realistic business context
- Requirements analysis and solution design
- Implementation with enterprise considerations
- Documentation and presentation components

## 3. Realistic Scenarios
All questions/tasks should use:
- Actual Nationwide technology stack
- Real business scenarios from insurance industry
- Enterprise security and compliance requirements
- Team collaboration patterns

## 4. Assessment Rubric
Provide detailed scoring criteria:
- **Excellent (90-100%)**: Exceeds expectations, ready for advanced work
- **Proficient (80-89%)**: Meets all requirements, competent practitioner
- **Developing (70-79%)**: Basic competency, needs some additional practice
- **Needs Improvement (<70%)**: Requires remediation before advancing

## 5. Success Criteria and Next Steps
- Clear requirements for passing the assessment
- Specific feedback for areas needing improvement
- Recommendations for continued learning
- Prerequisites for next skill level

## 6. Practical Implementation Details
- Specific setup instructions and requirements
- Code templates and starting points (if applicable)
- Validation methods and expected outcomes
- Common issues and troubleshooting guidance

Create assessment that:
- **Accurately Measures Competency**: Tests real-world skills
- **Provides Clear Feedback**: Identifies strengths and improvement areas
- **Supports Learning**: Educational experience, not just evaluation
- **Maintains Standards**: Ensures consistent quality across developers
- **Scales Effectively**: Works for individual and group assessment

This assessment should give confidence that successful candidates can effectively use AI tools in their daily enterprise development work."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_assessment(self, assessment_type: str, skill_level: str, persona: str, assessment_content: str, context: Dict[str, Any]) -> str:
        """Generate Hugo-compatible assessment document"""
        
        tool_focus = context.get("tool_focus", "AI Development Tools")
        assessment_spec = self.assessment_types.get(assessment_type, self.assessment_types["competency_test"])
        
        hugo_frontmatter = f"""---
title: "{persona.title()} {skill_level.title()} - {assessment_type.replace('_', ' ').title()}"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["assessment", "{assessment_type}", "{skill_level}", "{persona}"]
categories: ["developers", "assessment"]
summary: "{assessment_spec['description']} for {skill_level} level {persona} developers"
assessment_type: "{assessment_type}"
skill_level: "{skill_level}"
persona: "{persona}"
duration: "{assessment_spec['duration']}"
format: "{assessment_spec['format']}"
weight: 30
---

# {persona.title()} {skill_level.title()} Assessment
## {assessment_type.replace('_', ' ').title()}

[![Assessment Type](https://img.shields.io/badge/type-{assessment_type.replace('_', '%20')}-blue?style=flat-square)]()
[![Skill Level](https://img.shields.io/badge/level-{skill_level}-green?style=flat-square)]()
[![Duration](https://img.shields.io/badge/duration-{assessment_spec['duration'].replace(' ', '%20')}-orange?style=flat-square)]()
[![Format](https://img.shields.io/badge/format-{assessment_spec['format'].split(',')[0].replace(' ', '%20')}-purple?style=flat-square)]()

**Assessment Type**: {assessment_spec['description']}  
**Target Audience**: {persona.title()} developers at {skill_level} level  
**Tool Focus**: {tool_focus}  
**Estimated Duration**: {assessment_spec['duration']}

## Prerequisites

Before taking this assessment, ensure you have:
- [ ] Completed the {skill_level} level training curriculum
- [ ] Hands-on experience with relevant AI development tools
- [ ] Access to Nationwide development environment
- [ ] Understanding of enterprise security and compliance requirements

{assessment_content}

---

## Assessment Submission

### For Competency Tests
1. Complete all questions within the time limit
2. Submit through the learning management system
3. Review feedback and scoring rubric
4. Schedule remediation if needed

### For Practical Exercises
1. Complete the implementation task
2. Document your solution and approach
3. Submit code and documentation
4. Participate in peer review session

### For Capstone Projects
1. Submit project proposal and timeline
2. Complete implementation in phases
3. Document architecture and decisions
4. Present to assessment committee

## Scoring and Feedback

### Scoring Rubric
- **Excellent (90-100%)**: 🌟 Exceeds expectations, ready for advanced work
- **Proficient (80-89%)**: ✅ Meets requirements, competent practitioner  
- **Developing (70-79%)**: 📈 Basic competency, additional practice recommended
- **Needs Improvement (<70%)**: 📚 Requires remediation before advancing

### Next Steps After Assessment
- **Pass**: Advance to next skill level or specialized training
- **Partial Pass**: Complete specific remediation modules
- **Retake Required**: Additional study and practice before reattempt

## Support Resources

### During Assessment
- [Technical Support](mailto:ai-training-support@nationwide.com)
- [Assessment Guidelines](../../../guidelines/)
- [FAQ and Common Issues](../../../faq/)

### After Assessment
- [Feedback Discussion](mailto:ai-training@nationwide.com)
- [Remediation Resources](../../../remediation/)
- [Advanced Learning Paths](../../../advanced/)

## Assessment Analytics

Track your progress:
- [ ] Assessment started
- [ ] Halfway checkpoint reached
- [ ] Assessment completed
- [ ] Feedback reviewed
- [ ] Next steps planned

---

## Related Assessments

### Same Skill Level
- [Other {skill_level.title()} Assessments](../)

### Progression Path
{f"- [Beginner Assessment](../../beginner/)" if skill_level != "beginner" else ""}
{f"- [Intermediate Assessment](../../intermediate/)" if skill_level == "beginner" else f"- [Advanced Assessment](../../advanced/)" if skill_level == "intermediate" else ""}

### Other Personas
- [Full-Stack Assessments](../../../full-stack/)
- [SRE/DevOps Assessments](../../../sre/)
- [ETL/Data Assessments](../../../etl/)
- [Java/Spring Assessments](../../../java-spring/)
- [K8s/Helm Assessments](../../../k8s-helm/)

---

*Assessment designed by AI Training Assessment Generation System | Questions? Contact the AI Training Team*"""
        
        return hugo_frontmatter