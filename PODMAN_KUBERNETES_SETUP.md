# Podman & Kubernetes Setup Guide

Quick reference for Podman and Kubernetes local development commands.

## Podman Commands

### Container Management
```bash
# Build development image
podman build -f Containerfile.dev -t localhost/ai-strategy-api:dev .

# Start services with compose
podman-compose -f podman-compose.yml up -d

# View running containers
podman-compose -f podman-compose.yml ps

# View logs
podman-compose -f podman-compose.yml logs -f api-dev

# Stop services
podman-compose -f podman-compose.yml down

# Remove volumes (reset data)
podman-compose -f podman-compose.yml down -v

# Execute commands in container
podman exec -it ai-strategy-api-dev bash
```

### Image Management
```bash
# List images
podman images

# Remove unused images
podman image prune

# Tag image for registry
podman tag localhost/ai-strategy-api:dev registry.example.com/ai-strategy-api:dev
```

## Kubernetes Commands

### Deployment
```bash
# Apply all manifests with kustomize
kubectl apply -k k8s/dev/

# Apply individual files
kubectl apply -f k8s/dev/namespace.yaml
kubectl apply -f k8s/dev/postgres.yaml
kubectl apply -f k8s/dev/redis.yaml
kubectl apply -f k8s/dev/api.yaml

# Delete deployment
kubectl delete -k k8s/dev/
```

### Monitoring
```bash
# Check all resources in namespace
kubectl get all -n ai-strategy-dev

# Watch pod status
kubectl get pods -n ai-strategy-dev -w

# Describe pod for troubleshooting
kubectl describe pod -n ai-strategy-dev -l app=api-dev

# View logs
kubectl logs -n ai-strategy-dev deployment/api-dev -f

# Get events
kubectl get events -n ai-strategy-dev --sort-by=.metadata.creationTimestamp
```

### Access & Port Forwarding
```bash
# Port forward to API service
kubectl port-forward -n ai-strategy-dev svc/api-service 8001:8000

# Port forward to database
kubectl port-forward -n ai-strategy-dev svc/postgres-service 5433:5432

# Execute commands in pod
kubectl exec -it -n ai-strategy-dev deployment/api-dev -- bash
kubectl exec -it -n ai-strategy-dev deployment/postgres-dev -- psql -U dev_user -d ai_strategy_dev
```

### Scaling & Updates
```bash
# Scale deployment
kubectl scale deployment api-dev --replicas=2 -n ai-strategy-dev

# Rolling restart
kubectl rollout restart deployment/api-dev -n ai-strategy-dev

# Check rollout status
kubectl rollout status deployment/api-dev -n ai-strategy-dev

# Rollback deployment
kubectl rollout undo deployment/api-dev -n ai-strategy-dev
```

## Development Workflow

### 1. Initial Setup
```bash
# Start local Kubernetes cluster (choose one)
minikube start
# OR
kind create cluster
# OR  
k3d cluster create dev-cluster

# Verify cluster
kubectl cluster-info
```

### 2. Build and Deploy
```bash
# Build image
cd enterprise-ai-strategy/operational-layer
podman build -f Containerfile.dev -t localhost/ai-strategy-api:dev .

# Load image into cluster (if using kind)
kind load docker-image localhost/ai-strategy-api:dev

# Deploy to cluster
kubectl apply -k k8s/dev/

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/api-dev -n ai-strategy-dev
```

### 3. Development Loop
```bash
# Make code changes...

# Rebuild image
podman build -f Containerfile.dev -t localhost/ai-strategy-api:dev .

# Load into cluster (if needed)
kind load docker-image localhost/ai-strategy-api:dev

# Restart deployment
kubectl rollout restart deployment/api-dev -n ai-strategy-dev

# Check status
kubectl get pods -n ai-strategy-dev
```

### 4. Testing Access
```bash
# Port forward API
kubectl port-forward -n ai-strategy-dev svc/api-service 8001:8000 &

# Test API
curl http://localhost:8001/health

# Access frontend
python -m http.server 8080
# Visit http://localhost:8080
```

## Troubleshooting

### Common Issues

**Image Pull Errors:**
```bash
# Check if image exists locally
podman images | grep ai-strategy-api

# Load image into cluster
kind load docker-image localhost/ai-strategy-api:dev
```

**Pod Not Starting:**
```bash
# Check pod events
kubectl describe pod -n ai-strategy-dev -l app=api-dev

# Check logs
kubectl logs -n ai-strategy-dev deployment/api-dev

# Check resources
kubectl top pods -n ai-strategy-dev
```

**Service Not Accessible:**
```bash
# Check service endpoints
kubectl get endpoints -n ai-strategy-dev

# Test service from within cluster
kubectl run test-pod --image=curlimages/curl -it --rm -- sh
# Then: curl http://api-service.ai-strategy-dev.svc.cluster.local:8000/health
```

**Database Connection Issues:**
```bash
# Check if postgres pod is ready
kubectl get pods -n ai-strategy-dev -l app=postgres-dev

# Test database connection
kubectl exec -it -n ai-strategy-dev deployment/postgres-dev -- pg_isready -U dev_user

# Check config
kubectl get configmap api-config -n ai-strategy-dev -o yaml
```

### Clean Reset
```bash
# Complete cleanup
kubectl delete namespace ai-strategy-dev
podman system prune -f

# Fresh start
kubectl apply -k k8s/dev/
```

## Production Considerations

When moving to production:

1. **Use proper image registry** instead of localhost/
2. **Set resource limits** in deployments
3. **Configure persistent storage** with proper StorageClass
4. **Set up ingress** instead of NodePort services
5. **Add monitoring** and alerting
6. **Configure secrets management**
7. **Set up backup** strategies

See enterprise deployment guides for production configurations.