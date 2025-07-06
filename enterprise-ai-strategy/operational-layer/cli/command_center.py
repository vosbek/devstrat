#!/usr/bin/env python3
"""
Enterprise AI Strategy Command Center CLI
Command-line interface for managing agents and workflows
"""

import click
import requests
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt, Confirm
from rich.text import Text
import time

# Initialize Rich console
console = Console()

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_TOKEN = os.getenv("API_TOKEN", "")

class CommandCenterAPI:
    """API client for Command Center operations"""
    
    def __init__(self, base_url: str, token: str = ""):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        } if token else {"Content-Type": "application/json"}
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make API request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=self.headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=self.headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            console.print(f"[red]API Error: {str(e)}[/red]")
            if hasattr(e, 'response') and e.response:
                console.print(f"[red]Response: {e.response.text}[/red]")
            sys.exit(1)
    
    def get_agents(self) -> List[Dict]:
        """Get list of available agents"""
        return self._make_request("GET", "/agents")["agents"]
    
    def execute_agent(self, agent_name: str, task: str, parameters: Dict = None) -> Dict:
        """Execute an agent"""
        data = {
            "agent_name": agent_name,
            "task": task,
            "parameters": parameters or {},
            "requires_approval": True
        }
        return self._make_request("POST", f"/agents/{agent_name}/execute", data)
    
    def get_job_status(self, job_id: str) -> Dict:
        """Get job execution status"""
        return self._make_request("GET", f"/jobs/{job_id}")
    
    def list_jobs(self, status: str = None, limit: int = 20) -> List[Dict]:
        """List job executions"""
        params = f"?limit={limit}"
        if status:
            params += f"&status={status}"
        return self._make_request("GET", f"/jobs{params}")["jobs"]
    
    def list_approvals(self) -> List[Dict]:
        """List pending approvals"""
        return self._make_request("GET", "/approvals")["approvals"]
    
    def review_approval(self, approval_id: str, action: str, reason: str = "") -> Dict:
        """Review content approval"""
        data = {"action": action, "reason": reason}
        return self._make_request("POST", f"/approvals/{approval_id}/review", data)
    
    def get_dashboard_stats(self) -> Dict:
        """Get dashboard statistics"""
        return self._make_request("GET", "/stats/dashboard")

# Initialize API client
api = CommandCenterAPI(API_BASE_URL, API_TOKEN)

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """Enterprise AI Strategy Command Center CLI
    
    Manage AI agents, workflows, and operations from the command line.
    """
    pass

@cli.command()
def status():
    """Show system status and dashboard overview"""
    console.print(Panel.fit("🚀 Enterprise AI Strategy Command Center", 
                           title="System Status", 
                           border_style="blue"))
    
    try:
        stats = api.get_dashboard_stats()
        
        table = Table(title="System Overview")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="magenta")
        
        table.add_row("Total Jobs", str(stats.get("total_jobs", 0)))
        table.add_row("Running Jobs", str(stats.get("running_jobs", 0)))
        table.add_row("Pending Approvals", str(stats.get("pending_approvals", 0)))
        table.add_row("Completed Jobs", str(stats.get("completed_jobs", 0)))
        table.add_row("Success Rate", f"{stats.get('success_rate', 0):.1f}%")
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[red]Error getting system status: {str(e)}[/red]")

@cli.command()
def agents():
    """List all available agents"""
    console.print(Panel.fit("🤖 Available AI Agents", border_style="green"))
    
    try:
        agents_list = api.get_agents()
        
        table = Table(title="AI Agents Registry")
        table.add_column("Agent Name", style="cyan", no_wrap=True)
        table.add_column("Class", style="magenta")
        table.add_column("Description", style="green")
        
        for agent in agents_list:
            table.add_row(
                agent["name"],
                agent["class"],
                agent.get("description", "No description available")
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[red]Error listing agents: {str(e)}[/red]")

@cli.command()
@click.argument("agent_name")
@click.argument("task")
@click.option("--params", "-p", help="JSON string of parameters")
@click.option("--wait", "-w", is_flag=True, help="Wait for job completion")
@click.option("--no-approval", is_flag=True, help="Skip approval requirement")
def execute(agent_name: str, task: str, params: str = None, wait: bool = False, no_approval: bool = False):
    """Execute an agent with specified task
    
    AGENT_NAME: Name of the agent to execute
    TASK: Task description for the agent
    """
    console.print(f"🚀 Executing agent: [cyan]{agent_name}[/cyan]")
    console.print(f"📝 Task: [green]{task}[/green]")
    
    # Parse parameters
    parameters = {}
    if params:
        try:
            parameters = json.loads(params)
        except json.JSONDecodeError:
            console.print("[red]Error: Invalid JSON in parameters[/red]")
            sys.exit(1)
    
    try:
        # Execute agent
        result = api.execute_agent(agent_name, task, parameters)
        job_id = result["job_id"]
        
        console.print(f"✅ Job started with ID: [yellow]{job_id}[/yellow]")
        
        if wait:
            # Wait for job completion
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                task_progress = progress.add_task("Waiting for job completion...", total=None)
                
                while True:
                    job_status = api.get_job_status(job_id)
                    status = job_status["status"]
                    
                    if status in ["completed", "failed", "cancelled"]:
                        break
                    
                    time.sleep(5)
                
                progress.update(task_progress, description="Job completed!")
            
            # Show final status
            job_status = api.get_job_status(job_id)
            if job_status["status"] == "completed":
                console.print("✅ [green]Job completed successfully![/green]")
                if job_status.get("result"):
                    console.print(Panel(job_status["result"], title="Result", border_style="green"))
            else:
                console.print(f"❌ [red]Job failed with status: {job_status['status']}[/red]")
                if job_status.get("error_message"):
                    console.print(f"[red]Error: {job_status['error_message']}[/red]")
        
    except Exception as e:
        console.print(f"[red]Error executing agent: {str(e)}[/red]")

@cli.command()
@click.option("--status", "-s", help="Filter by job status")
@click.option("--limit", "-l", default=20, help="Number of jobs to show")
def jobs(status: str = None, limit: int = 20):
    """List job executions"""
    console.print(Panel.fit("📋 Job Executions", border_style="blue"))
    
    try:
        jobs_list = api.list_jobs(status, limit)
        
        table = Table(title="Recent Jobs")
        table.add_column("Job ID", style="yellow", no_wrap=True)
        table.add_column("Status", style="cyan")
        table.add_column("Agent", style="magenta")
        table.add_column("Created", style="green")
        table.add_column("Approval", style="orange")
        
        for job in jobs_list:
            # Truncate job ID for display
            job_id_short = job["job_id"][:8] + "..."
            
            # Format creation time
            created_at = datetime.fromisoformat(job["created_at"].replace("Z", "+00:00"))
            created_str = created_at.strftime("%Y-%m-%d %H:%M")
            
            table.add_row(
                job_id_short,
                job["status"],
                job.get("agent_name", "N/A"),
                created_str,
                job.get("approval_status", "N/A")
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[red]Error listing jobs: {str(e)}[/red]")

@cli.command()
@click.argument("job_id")
def job_status(job_id: str):
    """Get detailed job status
    
    JOB_ID: ID of the job to check
    """
    console.print(f"🔍 Job Status: [yellow]{job_id}[/yellow]")
    
    try:
        job = api.get_job_status(job_id)
        
        # Create status table
        table = Table(title="Job Details")
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="magenta")
        
        table.add_row("Job ID", job["job_id"])
        table.add_row("Status", job["status"])
        table.add_row("Created", job["created_at"])
        table.add_row("Started", job.get("started_at") or "Not started")
        table.add_row("Completed", job.get("completed_at") or "Not completed")
        table.add_row("Approval Status", job.get("approval_status", "N/A"))
        table.add_row("Approved By", job.get("approved_by") or "Not approved")
        
        console.print(table)
        
        # Show result or error
        if job.get("result"):
            console.print(Panel(job["result"], title="Result", border_style="green"))
        elif job.get("error_message"):
            console.print(Panel(job["error_message"], title="Error", border_style="red"))
        
    except Exception as e:
        console.print(f"[red]Error getting job status: {str(e)}[/red]")

@cli.command()
def approvals():
    """List pending content approvals"""
    console.print(Panel.fit("📋 Pending Approvals", border_style="orange"))
    
    try:
        approvals_list = api.list_approvals()
        
        if not approvals_list:
            console.print("[green]No pending approvals[/green]")
            return
        
        table = Table(title="Pending Content Approvals")
        table.add_column("ID", style="yellow", no_wrap=True)
        table.add_column("Title", style="cyan")
        table.add_column("Type", style="magenta")
        table.add_column("Created", style="green")
        table.add_column("Creator", style="blue")
        
        for approval in approvals_list:
            # Truncate approval ID for display
            approval_id_short = approval["id"][:8] + "..."
            
            # Format creation time
            created_at = datetime.fromisoformat(approval["created_at"].replace("Z", "+00:00"))
            created_str = created_at.strftime("%Y-%m-%d %H:%M")
            
            table.add_row(
                approval_id_short,
                approval["title"],
                approval["content_type"],
                created_str,
                approval["created_by"]
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[red]Error listing approvals: {str(e)}[/red]")

@cli.command()
@click.argument("approval_id")
@click.option("--action", "-a", type=click.Choice(["approve", "reject"]), required=True)
@click.option("--reason", "-r", help="Reason for approval/rejection")
def review(approval_id: str, action: str, reason: str = ""):
    """Review content approval
    
    APPROVAL_ID: ID of the approval to review
    """
    console.print(f"📝 Reviewing approval: [yellow]{approval_id}[/yellow]")
    console.print(f"🎯 Action: [cyan]{action}[/cyan]")
    
    # Confirm action
    if not Confirm.ask(f"Are you sure you want to {action} this content?"):
        console.print("❌ Operation cancelled")
        return
    
    try:
        result = api.review_approval(approval_id, action, reason)
        
        if action == "approve":
            console.print("✅ [green]Content approved successfully![/green]")
        else:
            console.print("❌ [red]Content rejected[/red]")
            
        console.print(f"Message: {result.get('message', 'No message')}")
        
    except Exception as e:
        console.print(f"[red]Error reviewing approval: {str(e)}[/red]")

@cli.group()
def interactive():
    """Interactive mode for common operations"""
    pass

@interactive.command()
def execute_agent():
    """Interactive agent execution"""
    console.print(Panel.fit("🤖 Interactive Agent Execution", border_style="green"))
    
    try:
        # Get available agents
        agents_list = api.get_agents()
        
        # Show agents and get selection
        console.print("\n[cyan]Available Agents:[/cyan]")
        for i, agent in enumerate(agents_list, 1):
            console.print(f"{i}. {agent['name']} - {agent.get('description', 'No description')}")
        
        while True:
            try:
                choice = int(Prompt.ask("Select agent (number)"))
                if 1 <= choice <= len(agents_list):
                    selected_agent = agents_list[choice - 1]
                    break
                else:
                    console.print("[red]Invalid selection[/red]")
            except ValueError:
                console.print("[red]Please enter a number[/red]")
        
        # Get task description
        task = Prompt.ask("Enter task description")
        
        # Get parameters (optional)
        params_input = Prompt.ask("Enter parameters (JSON format, optional)", default="")
        parameters = {}
        if params_input:
            try:
                parameters = json.loads(params_input)
            except json.JSONDecodeError:
                console.print("[yellow]Invalid JSON, using empty parameters[/yellow]")
        
        # Execute agent
        result = api.execute_agent(selected_agent["name"], task, parameters)
        console.print(f"✅ Job started with ID: [yellow]{result['job_id']}[/yellow]")
        
        # Ask if user wants to wait
        if Confirm.ask("Wait for job completion?"):
            # Wait for completion (similar to wait logic above)
            console.print("⏱️ Waiting for job completion...")
            # Implementation would be similar to the execute command
        
    except Exception as e:
        console.print(f"[red]Error in interactive execution: {str(e)}[/red]")

@interactive.command()
def review_approvals():
    """Interactive approval review"""
    console.print(Panel.fit("📋 Interactive Approval Review", border_style="orange"))
    
    try:
        approvals_list = api.list_approvals()
        
        if not approvals_list:
            console.print("[green]No pending approvals[/green]")
            return
        
        for approval in approvals_list:
            console.print(f"\n[cyan]Approval ID:[/cyan] {approval['id']}")
            console.print(f"[cyan]Title:[/cyan] {approval['title']}")
            console.print(f"[cyan]Type:[/cyan] {approval['content_type']}")
            console.print(f"[cyan]Created by:[/cyan] {approval['created_by']}")
            console.print(f"[cyan]Content preview:[/cyan]\n{approval['content'][:200]}...")
            
            action = Prompt.ask("Action", choices=["approve", "reject", "skip", "quit"])
            
            if action == "quit":
                break
            elif action == "skip":
                continue
            else:
                reason = ""
                if action == "reject":
                    reason = Prompt.ask("Reason for rejection", default="")
                
                result = api.review_approval(approval["id"], action, reason)
                console.print(f"✅ [green]{result.get('message', 'Action completed')}[/green]")
        
    except Exception as e:
        console.print(f"[red]Error in interactive review: {str(e)}[/red]")

@cli.command()
def setup():
    """Initial setup and configuration"""
    console.print(Panel.fit("⚙️ Command Center Setup", border_style="blue"))
    
    console.print("This will help you configure the Command Center CLI")
    
    # Get API configuration
    api_url = Prompt.ask("API Base URL", default="http://localhost:8000")
    api_token = Prompt.ask("API Token (optional)", default="")
    
    # Save configuration
    config_dir = os.path.expanduser("~/.enterprise-ai-strategy")
    os.makedirs(config_dir, exist_ok=True)
    
    config_file = os.path.join(config_dir, "config.json")
    config = {
        "api_base_url": api_url,
        "api_token": api_token
    }
    
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)
    
    console.print(f"✅ Configuration saved to {config_file}")
    console.print("You can also set environment variables:")
    console.print("- API_BASE_URL")
    console.print("- API_TOKEN")

if __name__ == "__main__":
    cli()