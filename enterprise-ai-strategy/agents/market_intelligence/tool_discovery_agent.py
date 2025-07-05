"""
Tool Discovery Agent - Scans the AI tool landscape for new developments
"""
import requests
import feedparser
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from datetime import datetime, timedelta
import logging

from ..base_agent import BaseAgent, AgentResponse

logger = logging.getLogger(__name__)

class ToolDiscoveryAgent(BaseAgent):
    """Agent for discovering new AI tools across multiple sources"""
    
    def __init__(self):
        super().__init__("tool_discovery_agent")
        
        # Data sources for tool discovery
        self.sources = {
            "github_trending": "https://api.github.com/search/repositories",
            "product_hunt": "https://www.producthunt.com/categories/developer-tools",
            "hacker_news": "https://hn.algolia.com/api/v1/search",
            "aws_announcements": "https://aws.amazon.com/about-aws/whats-new/recent/rss/",
            "anthropic_blog": "https://www.anthropic.com/news",
            "openai_blog": "https://openai.com/blog"
        }
    
    def get_system_prompt(self) -> str:
        return """You are an expert AI tool discovery agent for Nationwide Insurance's enterprise AI strategy team. 

Your role is to:
1. Analyze discovered AI tools for enterprise relevance
2. Categorize tools by development use case (coding, testing, deployment, monitoring)
3. Assess enterprise readiness (security, compliance, scalability)
4. Prioritize tools by potential impact for 1000+ developers
5. Flag tools that integrate with Java/Spring/K8s/Helm/Harness/Informatica/Talend stack

Focus on tools that would be valuable for:
- Full-stack developers (React/Angular + AI)
- SRE/DevOps engineers (Infrastructure + AI automation)  
- ETL/Data engineers (AI for data processing)
- Java/Spring developers (AI-assisted backend development)
- K8s/Helm/Harness engineers (AI for deployment automation)

Output should be structured markdown suitable for Hugo static site generation.
Include confidence scores and enterprise readiness assessments."""
    
    def discover_github_tools(self, days_back: int = 7) -> List[Dict[str, Any]]:
        """Discover trending AI tools on GitHub"""
        try:
            # Search for AI-related repositories
            search_queries = [
                "ai developer tools",
                "llm development",
                "code generation",
                "ai testing",
                "ai devops",
                "ai deployment"
            ]
            
            tools = []
            for query in search_queries:
                since_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
                
                params = {
                    "q": f"{query} created:>{since_date}",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 10
                }
                
                response = requests.get(self.sources["github_trending"], params=params)
                if response.status_code == 200:
                    data = response.json()
                    for repo in data.get("items", []):
                        tools.append({
                            "name": repo["name"],
                            "description": repo["description"],
                            "url": repo["html_url"],
                            "stars": repo["stargazers_count"],
                            "language": repo["language"],
                            "created_at": repo["created_at"],
                            "source": "github",
                            "query": query
                        })
            
            return tools
            
        except Exception as e:
            logger.error(f"Error discovering GitHub tools: {str(e)}")
            return []
    
    def discover_hacker_news_tools(self, days_back: int = 7) -> List[Dict[str, Any]]:
        """Discover AI tools mentioned on Hacker News"""
        try:
            # Search for AI tool discussions
            search_queries = [
                "ai tools developers",
                "llm coding assistant", 
                "ai devops",
                "developer ai",
                "code generation tools"
            ]
            
            tools = []
            since_timestamp = int((datetime.now() - timedelta(days=days_back)).timestamp())
            
            for query in search_queries:
                params = {
                    "query": query,
                    "tags": "story",
                    "numericFilters": f"created_at_i>{since_timestamp}",
                    "hitsPerPage": 20
                }
                
                response = requests.get(self.sources["hacker_news"], params=params)
                if response.status_code == 200:
                    data = response.json()
                    for hit in data.get("hits", []):
                        tools.append({
                            "name": hit["title"],
                            "description": hit.get("title", ""),
                            "url": hit.get("url", ""),
                            "points": hit.get("points", 0),
                            "comments": hit.get("num_comments", 0),
                            "created_at": hit.get("created_at", ""),
                            "source": "hacker_news",
                            "query": query
                        })
            
            return tools
            
        except Exception as e:
            logger.error(f"Error discovering Hacker News tools: {str(e)}")
            return []
    
    def discover_aws_announcements(self) -> List[Dict[str, Any]]:
        """Discover new AWS AI/ML announcements"""
        try:
            tools = []
            feed = feedparser.parse(self.sources["aws_announcements"])
            
            for entry in feed.entries[:20]:  # Last 20 announcements
                # Filter for AI/ML related announcements
                title_lower = entry.title.lower()
                if any(keyword in title_lower for keyword in ["ai", "ml", "bedrock", "sagemaker", "rekognition", "comprehend", "lex", "code"]):
                    tools.append({
                        "name": entry.title,
                        "description": entry.summary,
                        "url": entry.link,
                        "published": entry.published,
                        "source": "aws_announcements"
                    })
            
            return tools
            
        except Exception as e:
            logger.error(f"Error discovering AWS announcements: {str(e)}")
            return []
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> AgentResponse:
        """Process tool discovery task"""
        try:
            # Parse task parameters
            days_back = context.get("days_back", 7) if context else 7
            sources = context.get("sources", ["github", "hacker_news", "aws"]) if context else ["github", "hacker_news", "aws"]
            
            all_tools = []
            
            # Discover from selected sources
            if "github" in sources:
                github_tools = self.discover_github_tools(days_back)
                all_tools.extend(github_tools)
            
            if "hacker_news" in sources:
                hn_tools = self.discover_hacker_news_tools(days_back)
                all_tools.extend(hn_tools)
            
            if "aws" in sources:
                aws_tools = self.discover_aws_announcements()
                all_tools.extend(aws_tools)
            
            # Use Claude Sonnet to analyze and categorize tools
            tools_summary = self._analyze_discovered_tools(all_tools)
            
            # Generate Hugo-compatible markdown
            hugo_content = self._generate_hugo_content(tools_summary, all_tools)
            
            metadata = {
                "total_tools_found": len(all_tools),
                "sources_used": sources,
                "discovery_date": datetime.now().isoformat(),
                "days_back": days_back
            }
            
            return self._create_response(
                task=task,
                content=hugo_content,
                metadata=metadata,
                confidence_score=0.9
            )
            
        except Exception as e:
            logger.error(f"Error in tool discovery: {str(e)}")
            return self._create_response(
                task=task,
                content=f"Error during tool discovery: {str(e)}",
                status="error",
                confidence_score=0.0
            )
    
    def _analyze_discovered_tools(self, tools: List[Dict[str, Any]]) -> str:
        """Use Claude Sonnet to analyze discovered tools"""
        if not tools:
            return "No tools discovered in this timeframe."
        
        tools_text = "\n".join([
            f"- {tool.get('name', 'Unknown')}: {tool.get('description', '')} (Source: {tool.get('source', '')}, Stars: {tool.get('stars', 'N/A')})"
            for tool in tools[:50]  # Limit to avoid token limits
        ])
        
        prompt = f"""Analyze these recently discovered AI tools for enterprise relevance at Nationwide Insurance:

{tools_text}

Provide analysis including:
1. Top 10 most enterprise-relevant tools with brief descriptions
2. Category breakdown (coding assistants, testing tools, devops automation, etc.)
3. Integration potential with Java/Spring/K8s/Helm/Harness/Informatica/Talend
4. Security and compliance considerations
5. Recommended evaluation priority (High/Medium/Low)

Format as structured markdown suitable for Hugo static site generation."""
        
        return self._call_bedrock(prompt, self.get_system_prompt())
    
    def _generate_hugo_content(self, analysis: str, raw_tools: List[Dict[str, Any]]) -> str:
        """Generate Hugo-compatible markdown content"""
        
        hugo_frontmatter = f"""---
title: "AI Tool Discovery Report"
date: {datetime.now().strftime('%Y-%m-%d')}
draft: false
tags: ["tool-discovery", "market-intelligence"]
categories: ["executive", "tools"]
summary: "Latest AI tools discovered across GitHub, Hacker News, and AWS announcements"
---

# AI Tool Discovery Report

**Discovery Date:** {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}  
**Tools Analyzed:** {len(raw_tools)}  
**Sources:** GitHub Trending, Hacker News, AWS Announcements

## Executive Summary

{analysis}

## Raw Tool Data

| Tool | Source | Stars/Points | Language | Description |
|------|--------|--------------|----------|-------------|
"""
        
        # Add raw tool data table
        for tool in raw_tools[:30]:  # Limit to top 30
            name = tool.get('name', 'Unknown')
            source = tool.get('source', '')
            stars = tool.get('stars', tool.get('points', 'N/A'))
            language = tool.get('language', 'N/A')
            description = tool.get('description', '')[:100] + "..." if len(tool.get('description', '')) > 100 else tool.get('description', '')
            
            hugo_frontmatter += f"| {name} | {source} | {stars} | {language} | {description} |\n"
        
        return hugo_frontmatter