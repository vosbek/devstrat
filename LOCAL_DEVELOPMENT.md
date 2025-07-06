# Local Development Setup for Windows

This guide will help you set up the AI Strategy Hub for local development on your Windows machine using Podman and Kubernetes.

## Prerequisites

- **Podman Desktop for Windows** or **Podman CLI**
- **Kubernetes** (minikube, kind, or k3s)
- **Git** for version control
- **VS Code** (recommended) with Kubernetes extension
- **Node.js 18+** (for frontend development)

## Project Structure

```
developerplan/
├── index.html                    # Static frontend (works standalone)
├── developers/index.html         # Developer portal
├── leadership/index.html         # Executive dashboard  
├── strategy/index.html          # Strategy center
├── data/                        # JSON data files
├── js/                          # Frontend JavaScript
├── podman-compose.yml           # Podman development stack
├── .env.example                 # Environment template
├── k8s/dev/                     # Kubernetes manifests
└── enterprise-ai-strategy/      # Backend services
    └── operational-layer/
        ├── api/                 # FastAPI backend
        └── docker-compose.yml   # Full production stack
```

## Quick Start

### Option 1: Frontend Only (Simplest)

For basic development of the static frontend:

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd developerplan
   ```

2. **Open in browser**
   ```bash
   # Open index.html directly in your browser
   start index.html
   ```

3. **Or serve with Python**
   ```bash
   python -m http.server 8080
   # Visit http://localhost:8080
   ```

### Option 2: Full Stack with Podman

For complete backend + frontend development using Podman:

1. **Setup environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your actual values
   code .env
   ```

2. **Start development services**
   ```bash
   # Start PostgreSQL, Redis, and API with Podman
   podman-compose -f podman-compose.yml up -d
   ```

3. **Verify services**
   ```bash
   # Check all services are running
   podman-compose -f podman-compose.yml ps
   
   # View logs
   podman-compose -f podman-compose.yml logs -f api-dev
   ```

### Option 3: Kubernetes Development

For Kubernetes-based development:

1. **Build container image**
   ```bash
   # Build API image with Podman
   cd enterprise-ai-strategy/operational-layer
   podman build -f Containerfile.dev -t localhost/ai-strategy-api:dev .
   ```

2. **Deploy to Kubernetes**
   ```bash
   # Apply manifests
   kubectl apply -k k8s/dev/
   
   # Check deployment status
   kubectl get pods -n ai-strategy-dev
   ```

3. **Access applications**
   - Frontend: http://localhost:8080 (if using Python server)
   - API: http://localhost:30001 (NodePort)
   - Port forward for direct access:
     ```bash
     kubectl port-forward -n ai-strategy-dev svc/api-service 8001:8000
     ```

## Development Workflow

### Frontend Development

1. **Edit HTML/CSS/JS files** directly in the root directory
2. **Update data files** in the `data/` directory:
   - `tools.json` - Tool evaluations and metadata
   - `training.json` - Training curricula and courses
   - `metrics.json` - Analytics and KPIs

3. **Test changes** by refreshing your browser

### Backend Development

**With Podman:**
1. **Make code changes** in `enterprise-ai-strategy/operational-layer/`
2. **API auto-reloads** thanks to uvicorn --reload
3. **Database changes** require container restart:
   ```bash
   podman-compose -f podman-compose.yml restart api-dev
   ```

**With Kubernetes:**
1. **Rebuild image** after code changes:
   ```bash
   podman build -f Containerfile.dev -t localhost/ai-strategy-api:dev .
   ```
2. **Restart deployment**:
   ```bash
   kubectl rollout restart deployment/api-dev -n ai-strategy-dev
   ```

### Adding New Features

1. **Frontend features**: Edit JS files in `js/` directory
2. **Backend features**: Add to `enterprise-ai-strategy/operational-layer/api/`
3. **Data updates**: Modify JSON files in `data/`

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5433/ai_strategy_dev

# API Keys (for AI features)
ANTHROPIC_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here

# Development settings
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

### Optional AI Integration

To enable AI features in the frontend:

1. **Get API keys** from:
   - [Anthropic Console](https://console.anthropic.com/)
   - [Google AI Studio](https://aistudio.google.com/)

2. **Add to .env file**
3. **Configure in frontend** via settings (⚙️ icon)

## Database Management

### Access Database

**With Podman:**
```bash
# Connect to development database
podman exec -it ai-strategy-postgres-dev psql -U dev_user -d ai_strategy_dev
```

**With Kubernetes:**
```bash
# Connect to database pod
kubectl exec -it -n ai-strategy-dev deployment/postgres-dev -- psql -U dev_user -d ai_strategy_dev
```

### Reset Database

**With Podman:**
```bash
# Stop and remove containers with data
podman-compose -f podman-compose.yml down -v

# Restart fresh
podman-compose -f podman-compose.yml up -d
```

**With Kubernetes:**
```bash
# Delete and recreate namespace
kubectl delete namespace ai-strategy-dev
kubectl apply -k k8s/dev/
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the port
netstat -ano | findstr :5433

# Kill the process or change ports in docker-compose.dev.yml
```

### Podman/Container Issues

**With Podman:**
```bash
# Restart Podman machine (if using Podman Desktop)
podman machine restart

# Or reset containers
podman-compose -f podman-compose.yml down
podman system prune -f
podman-compose -f podman-compose.yml up -d
```

**With Kubernetes:**
```bash
# Check cluster status
kubectl cluster-info

# Check pod logs
kubectl logs -n ai-strategy-dev deployment/api-dev

# Restart problematic pods
kubectl delete pod -n ai-strategy-dev -l app=api-dev
```

### Frontend Not Loading

1. **Check file paths** are correct
2. **Verify JSON data** format in `data/` files
3. **Check browser console** for JavaScript errors
4. **Clear browser cache**

## Production Deployment

For production deployment, see:
- `enterprise-ai-strategy/ENTERPRISE_DEPLOYMENT_GUIDE.md`
- Use production Kubernetes manifests in `k8s/prod/`

## VS Code Development

### Recommended Extensions

- Kubernetes
- Podman Desktop (if using Podman Desktop)
- Python
- JavaScript (ES6) code snippets
- Live Server (for frontend)
- GitLens

### Workspace Settings

```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "docker.showStartPage": false,
    "liveServer.settings.port": 8080
}
```

## Testing

### Frontend Testing
```bash
# Serve locally and test in browser
python -m http.server 8080
```

### Backend Testing

**With Podman:**
```bash
# Run API tests
podman exec -it ai-strategy-api-dev pytest
```

**With Kubernetes:**
```bash
# Run tests in pod
kubectl exec -it -n ai-strategy-dev deployment/api-dev -- pytest
```

## Getting Help

1. **Check logs**: 
   - Podman: `podman-compose -f podman-compose.yml logs`
   - Kubernetes: `kubectl logs -n ai-strategy-dev deployment/api-dev`
2. **Review issues**: Check GitHub issues
3. **Documentation**: See README.md and enterprise guides
4. **Debug**: Use VS Code debugger with Kubernetes extension

---

**Happy coding!** 🚀 You now have a full local development environment for the AI Strategy Hub.