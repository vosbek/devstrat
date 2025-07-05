"""
AWS Configuration for Enterprise AI Strategy Command Center
"""
import os
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum

class BedrockModels(Enum):
    """Available AWS Bedrock models"""
    CLAUDE_3_5_SONNET = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0"
    CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0"

@dataclass
class AWSConfig:
    """AWS Configuration settings"""
    region: str = "us-east-1"
    profile: str = "default"
    bedrock_model: str = BedrockModels.CLAUDE_3_5_SONNET.value
    max_tokens: int = 4000
    temperature: float = 0.3

@dataclass
class AgentConfig:
    """Configuration for AI agents"""
    market_intelligence_agents: List[str]
    training_content_agents: List[str] 
    operational_agents: List[str]
    max_concurrent_agents: int = 3
    timeout_seconds: int = 300

# Default configurations
DEFAULT_AWS_CONFIG = AWSConfig()

DEFAULT_AGENT_CONFIG = AgentConfig(
    market_intelligence_agents=[
        "tool_discovery_agent",
        "deep_evaluation_agent", 
        "risk_assessment_agent",
        "competitive_intelligence_agent"
    ],
    training_content_agents=[
        "curriculum_architect_agent",
        "technical_writer_agent",
        "assessment_creator_agent", 
        "resource_curator_agent"
    ],
    operational_agents=[
        "license_optimizer_agent",
        "integration_validator_agent",
        "community_pulse_agent",
        "executive_briefing_agent"
    ]
)

# Environment variables mapping
def get_aws_config() -> AWSConfig:
    """Get AWS configuration from environment variables"""
    return AWSConfig(
        region=os.getenv("AWS_REGION", DEFAULT_AWS_CONFIG.region),
        profile=os.getenv("AWS_PROFILE", DEFAULT_AWS_CONFIG.profile),
        bedrock_model=os.getenv("BEDROCK_MODEL", DEFAULT_AWS_CONFIG.bedrock_model),
        max_tokens=int(os.getenv("MAX_TOKENS", DEFAULT_AWS_CONFIG.max_tokens)),
        temperature=float(os.getenv("TEMPERATURE", DEFAULT_AWS_CONFIG.temperature))
    )