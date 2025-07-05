"""
Base Agent class for Enterprise AI Strategy Command Center
Uses AWS Strands SDK with Bedrock Claude Sonnet
"""
import boto3
import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AgentResponse:
    """Standardized response format for all agents"""
    agent_name: str
    task: str
    content: str
    metadata: Dict[str, Any]
    timestamp: datetime
    status: str  # "success", "error", "partial"
    confidence_score: float = 0.0

class BaseAgent(ABC):
    """Base class for all AI Strategy agents using AWS Bedrock"""
    
    def __init__(self, 
                 agent_name: str,
                 model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0",
                 region: str = "us-east-1",
                 max_tokens: int = 4000,
                 temperature: float = 0.3):
        self.agent_name = agent_name
        self.model_id = model_id
        self.region = region
        self.max_tokens = max_tokens
        self.temperature = temperature
        
        # Initialize AWS Bedrock client
        self.bedrock_client = boto3.client('bedrock-runtime', region_name=region)
        
        logger.info(f"Initialized {agent_name} with model {model_id}")
    
    def _call_bedrock(self, prompt: str, system_prompt: str = "") -> str:
        """Call AWS Bedrock Claude Sonnet"""
        try:
            # Prepare the request body for Claude 3.5 Sonnet
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            if system_prompt:
                body["system"] = system_prompt
            
            # Call Bedrock
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body),
                contentType='application/json'
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except Exception as e:
            logger.error(f"Error calling Bedrock: {str(e)}")
            raise
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent"""
        pass
    
    @abstractmethod
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process a task and return standardized response"""
        pass
    
    def _create_response(self, 
                        task: str, 
                        content: str, 
                        metadata: Dict[str, Any] = None,
                        status: str = "success",
                        confidence_score: float = 0.8) -> AgentResponse:
        """Create standardized agent response"""
        return AgentResponse(
            agent_name=self.agent_name,
            task=task,
            content=content,
            metadata=metadata or {},
            timestamp=datetime.now(),
            status=status,
            confidence_score=confidence_score
        )
    
    def validate_response(self, response: AgentResponse) -> bool:
        """Validate agent response meets quality standards"""
        # Basic validation rules
        if len(response.content) < 100:
            logger.warning(f"Response too short from {self.agent_name}")
            return False
        
        if response.confidence_score < 0.5:
            logger.warning(f"Low confidence score from {self.agent_name}")
            return False
        
        return True

class EnterpriseAgentOrchestrator:
    """Orchestrator for managing multiple AI agents"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.execution_history: List[AgentResponse] = []
    
    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent with the orchestrator"""
        self.agents[agent.agent_name] = agent
        logger.info(f"Registered agent: {agent.agent_name}")
    
    def execute_agent(self, agent_name: str, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Execute a specific agent task"""
        if agent_name not in self.agents:
            raise ValueError(f"Agent {agent_name} not found")
        
        agent = self.agents[agent_name]
        logger.info(f"Executing {agent_name} for task: {task[:50]}...")
        
        try:
            response = agent.process_task(task, context)
            
            # Validate response
            if not agent.validate_response(response):
                response.status = "partial"
                logger.warning(f"Response validation failed for {agent_name}")
            
            # Store execution history
            self.execution_history.append(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error executing {agent_name}: {str(e)}")
            error_response = AgentResponse(
                agent_name=agent_name,
                task=task,
                content=f"Error: {str(e)}",
                metadata={"error": True},
                timestamp=datetime.now(),
                status="error",
                confidence_score=0.0
            )
            self.execution_history.append(error_response)
            return error_response
    
    def execute_agent_team(self, agent_names: List[str], task: str, context: Dict[str, Any] = None) -> List[AgentResponse]:
        """Execute multiple agents for a coordinated task"""
        responses = []
        
        for agent_name in agent_names:
            response = self.execute_agent(agent_name, task, context)
            responses.append(response)
            
            # Add previous responses to context for subsequent agents
            if context is None:
                context = {}
            context[f"{agent_name}_response"] = response.content
        
        return responses
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of all agent executions"""
        total_executions = len(self.execution_history)
        successful_executions = len([r for r in self.execution_history if r.status == "success"])
        
        return {
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
            "agents_used": list(set(r.agent_name for r in self.execution_history)),
            "latest_execution": self.execution_history[-1].timestamp if self.execution_history else None
        }