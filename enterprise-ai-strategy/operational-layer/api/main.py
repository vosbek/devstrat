"""
Enterprise AI Strategy Command Center - Backend API Service
FastAPI backend for managing AI agents, workflows, and operations
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import uuid
import logging
import json
import os
from enum import Enum

# Database and auth imports
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
import jwt
import httpx

# Agent imports
import sys
sys.path.append('/mnt/c/devl/workspaces/developerplan/enterprise-ai-strategy')
from agents.base_agent import BaseAgent
from agents.market_intelligence.tool_discovery_agent import ToolDiscoveryAgent
from agents.market_intelligence.deep_evaluation_agent import DeepEvaluationAgent
from agents.market_intelligence.risk_assessment_agent import RiskAssessmentAgent
from agents.market_intelligence.competitive_intelligence_agent import CompetitiveIntelligenceAgent
from agents.training_content.curriculum_architect_agent import CurriculumArchitectAgent
from agents.training_content.technical_writer_agent import TechnicalWriterAgent
from agents.training_content.assessment_creator_agent import AssessmentCreatorAgent
from agents.training_content.resource_curator_agent import ResourceCuratorAgent
from agents.operational.license_optimizer_agent import LicenseOptimizerAgent
from agents.operational.integration_validator_agent import IntegrationValidatorAgent
from agents.operational.community_pulse_agent import CommunityPulseAgent
from agents.operational.executive_briefing_agent import ExecutiveBriefingAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/enterprise-ai-strategy.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/enterprise_ai_strategy")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# FastAPI app
app = FastAPI(
    title="Enterprise AI Strategy Command Center API",
    description="Backend API for managing AI agents, workflows, and operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class JobExecution(Base):
    __tablename__ = "job_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_type = Column(String(50), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(20), default=JobStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_by = Column(String(100), nullable=False)
    parameters = Column(Text, nullable=True)
    result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    approval_status = Column(String(20), default=ApprovalStatus.PENDING)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)

class ContentApproval(Base):
    __tablename__ = "content_approvals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), nullable=False)
    content_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default=ApprovalStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(100), nullable=False)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class AgentExecutionRequest(BaseModel):
    agent_name: str = Field(..., description="Name of the agent to execute")
    task: str = Field(..., description="Task description for the agent")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Agent parameters")
    priority: Optional[str] = Field(default="medium", description="Job priority")
    requires_approval: Optional[bool] = Field(default=True, description="Whether job requires approval")

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[str] = None
    error_message: Optional[str] = None
    approval_status: str
    approved_by: Optional[str] = None

class ApprovalRequest(BaseModel):
    action: str = Field(..., description="approve or reject")
    reason: Optional[str] = Field(default=None, description="Reason for approval/rejection")

class UserCreate(BaseModel):
    email: str
    name: str
    role: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

# Agent Registry
AGENT_REGISTRY = {
    "tool_discovery": ToolDiscoveryAgent,
    "deep_evaluation": DeepEvaluationAgent,
    "risk_assessment": RiskAssessmentAgent,
    "competitive_intelligence": CompetitiveIntelligenceAgent,
    "curriculum_architect": CurriculumArchitectAgent,
    "technical_writer": TechnicalWriterAgent,
    "assessment_creator": AssessmentCreatorAgent,
    "resource_curator": ResourceCuratorAgent,
    "license_optimizer": LicenseOptimizerAgent,
    "integration_validator": IntegrationValidatorAgent,
    "community_pulse": CommunityPulseAgent,
    "executive_briefing": ExecutiveBriefingAgent
}

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for user"""
    payload = {
        "user_id": str(user_data["id"]),
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def require_role(required_role: str):
    """Decorator to require specific role"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Background task for agent execution
async def execute_agent_task(job_id: str, agent_name: str, task: str, parameters: Dict[str, Any]):
    """Execute agent task in background"""
    db = SessionLocal()
    try:
        # Get job record
        job = db.query(JobExecution).filter(JobExecution.id == job_id).first()
        if not job:
            logger.error(f"Job {job_id} not found")
            return
        
        # Update job status
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        db.commit()
        
        # Execute agent
        agent_class = AGENT_REGISTRY.get(agent_name)
        if not agent_class:
            job.status = JobStatus.FAILED
            job.error_message = f"Agent '{agent_name}' not found"
            job.completed_at = datetime.utcnow()
            db.commit()
            return
        
        agent = agent_class()
        result = agent.process_task(task, parameters)
        
        # Update job with result
        job.status = JobStatus.COMPLETED
        job.result = json.dumps(result.dict())
        job.completed_at = datetime.utcnow()
        db.commit()
        
        # Create content approval if required
        if job.approval_status == ApprovalStatus.PENDING:
            content_approval = ContentApproval(
                job_id=job_id,
                content_type="agent_output",
                title=f"{agent_name} - {task[:50]}",
                content=result.content,
                created_by=job.created_by
            )
            db.add(content_approval)
            db.commit()
        
        logger.info(f"Job {job_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error executing job {job_id}: {str(e)}")
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Enterprise AI Strategy Command Center API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Agent Management Routes
@app.get("/agents")
async def list_agents(current_user: User = Depends(get_current_user)):
    """List all available agents"""
    agents = []
    for name, agent_class in AGENT_REGISTRY.items():
        agent = agent_class()
        agents.append({
            "name": name,
            "class": agent_class.__name__,
            "description": agent.__doc__ or f"{name} agent"
        })
    return {"agents": agents}

@app.post("/agents/{agent_name}/execute")
async def execute_agent(
    agent_name: str,
    request: AgentExecutionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute an agent with specified parameters"""
    if agent_name not in AGENT_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    
    # Create job record
    job = JobExecution(
        job_type="agent_execution",
        agent_name=agent_name,
        created_by=current_user.email,
        parameters=json.dumps(request.parameters),
        approval_status=ApprovalStatus.PENDING if request.requires_approval else ApprovalStatus.APPROVED
    )
    
    db.add(job)
    db.commit()
    
    # Start background task
    background_tasks.add_task(
        execute_agent_task,
        str(job.id),
        agent_name,
        request.task,
        request.parameters
    )
    
    return {"job_id": str(job.id), "status": "started", "message": "Agent execution started"}

@app.get("/jobs/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job execution status"""
    job = db.query(JobExecution).filter(JobExecution.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(
        job_id=str(job.id),
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        result=job.result,
        error_message=job.error_message,
        approval_status=job.approval_status,
        approved_by=job.approved_by
    )

@app.get("/jobs")
async def list_jobs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List job executions"""
    query = db.query(JobExecution)
    
    if status:
        query = query.filter(JobExecution.status == status)
    
    # Non-admin users can only see their own jobs
    if current_user.role != "admin":
        query = query.filter(JobExecution.created_by == current_user.email)
    
    jobs = query.order_by(JobExecution.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "jobs": [JobStatusResponse(
            job_id=str(job.id),
            status=job.status,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
            result=job.result,
            error_message=job.error_message,
            approval_status=job.approval_status,
            approved_by=job.approved_by
        ) for job in jobs]
    }

# Content Approval Routes
@app.get("/approvals")
async def list_pending_approvals(
    current_user: User = Depends(require_role("manager")),
    db: Session = Depends(get_db)
):
    """List pending content approvals"""
    approvals = db.query(ContentApproval).filter(
        ContentApproval.status == ApprovalStatus.PENDING
    ).order_by(ContentApproval.created_at.desc()).all()
    
    return {"approvals": [
        {
            "id": str(approval.id),
            "job_id": str(approval.job_id),
            "title": approval.title,
            "content_type": approval.content_type,
            "created_at": approval.created_at,
            "created_by": approval.created_by,
            "content": approval.content[:500] + "..." if len(approval.content) > 500 else approval.content
        }
        for approval in approvals
    ]}

@app.post("/approvals/{approval_id}/review")
async def review_approval(
    approval_id: str,
    request: ApprovalRequest,
    current_user: User = Depends(require_role("manager")),
    db: Session = Depends(get_db)
):
    """Approve or reject content"""
    approval = db.query(ContentApproval).filter(ContentApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if request.action == "approve":
        approval.status = ApprovalStatus.APPROVED
        approval.approved_by = current_user.email
        approval.approved_at = datetime.utcnow()
        
        # Update job approval status
        job = db.query(JobExecution).filter(JobExecution.id == approval.job_id).first()
        if job:
            job.approval_status = ApprovalStatus.APPROVED
            job.approved_by = current_user.email
            job.approved_at = datetime.utcnow()
        
        message = "Content approved successfully"
    elif request.action == "reject":
        approval.status = ApprovalStatus.REJECTED
        approval.approved_by = current_user.email
        approval.approved_at = datetime.utcnow()
        approval.rejection_reason = request.reason
        
        # Update job approval status
        job = db.query(JobExecution).filter(JobExecution.id == approval.job_id).first()
        if job:
            job.approval_status = ApprovalStatus.REJECTED
            job.approved_by = current_user.email
            job.approved_at = datetime.utcnow()
        
        message = "Content rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    db.commit()
    
    return {"message": message, "approval_id": str(approval.id)}

# User Management Routes
@app.post("/users")
async def create_user(
    user: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = User(
        email=user.email,
        name=user.name,
        role=user.role
    )
    
    db.add(new_user)
    db.commit()
    
    return {"message": "User created successfully", "user_id": str(new_user.id)}

@app.get("/users")
async def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """List all users"""
    users = db.query(User).all()
    
    return {"users": [UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    ) for user in users]}

# Authentication Routes
@app.post("/auth/login")
async def login(email: str, password: str, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    # Note: In production, implement proper password hashing and verification
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    token = create_jwt_token({
        "id": user.id,
        "email": user.email,
        "role": user.role
    })
    
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

# Statistics and Monitoring Routes
@app.get("/stats/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    total_jobs = db.query(JobExecution).count()
    running_jobs = db.query(JobExecution).filter(JobExecution.status == JobStatus.RUNNING).count()
    pending_approvals = db.query(ContentApproval).filter(ContentApproval.status == ApprovalStatus.PENDING).count()
    completed_jobs = db.query(JobExecution).filter(JobExecution.status == JobStatus.COMPLETED).count()
    
    return {
        "total_jobs": total_jobs,
        "running_jobs": running_jobs,
        "pending_approvals": pending_approvals,
        "completed_jobs": completed_jobs,
        "success_rate": (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)