# EKS Application Setup — General Store

A full-stack web application deployed on Amazon EKS with proper Kubernetes resources, health checks, ingress access, GitOps via ArgoCD, and infrastructure provisioned through Terraform.

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │              AWS Cloud (us-east-1)           │
                        │                                              │
                        │   ┌──────────────────────────────────────┐  │
  User Browser          │   │         EKS Cluster (Auto Mode)      │  │
      │                 │   │                                       │  │
      │  HTTP           │   │  ┌─────────────────────────────────┐ │  │
      ▼                 │   │  │     Namespace: app              │ │  │
 ┌─────────┐            │   │  │                                 │ │  │
 │   NLB   │◄───────────┤   │  │  ┌────────────┐                │ │  │
 │(NGINX   │            │   │  │  │  Ingress   │                │ │  │
 │Ingress) │            │   │  │  │ (nginx)    │                │ │  │
 └────┬────┘            │   │  │  └─────┬──────┘                │ │  │
      │                 │   │  │        │                        │ │  │
      │  /              │   │  │   ┌────┴────────────────┐       │ │  │
      ├─────────────────┼───┼──┼──►│  frontend-service   │       │ │  │
      │                 │   │  │   │  (ClusterIP :80)    │       │ │  │
      │  /health        │   │  │   └────────┬────────────┘       │ │  │
      │  /api/*         │   │  │            │                    │ │  │
      ├─────────────────┼───┼──┼──►┌────────┴────────────┐       │ │  │
                        │   │  │   │  backend-service     │       │ │  │
                        │   │  │   │  (ClusterIP :8080)  │       │ │  │
                        │   │  │   └─────────────────────┘       │ │  │
                        │   │  │                                 │ │  │
                        │   │  │  ┌─────────────┐               │ │  │
                        │   │  │  │  ConfigMap  │ PORT,APP_NAME  │ │  │
                        │   │  │  │             │ APP_ENV,       │ │  │
                        │   │  │  │             │ ALLOWED_ORIGINS│ │  │
                        │   │  │  └─────────────┘               │ │  │
                        │   │  │  ┌─────────────┐               │ │  │
                        │   │  │  │   Secret    │ BACKEND_API_KEY│ │  │
                        │   │  │  └─────────────┘               │ │  │
                        │   │  └─────────────────────────────────┘ │  │
                        │   │                                       │  │
                        │   │  ┌──────────────┐  ┌──────────────┐  │  │
                        │   │  │   ArgoCD     │  │ingress-nginx │  │  │
                        │   │  │  (argocd ns) │  │  controller  │  │  │
                        │   │  └──────────────┘  └──────────────┘  │  │
                        │   └──────────────────────────────────────┘  │
                        │                                              │
                        │   ┌──────────────────────────────────────┐  │
                        │   │  VPC  (10.0.0.0/16)                  │  │
                        │   │  Public Subnets  (NLB, NAT GW)       │  │
                        │   │  Private Subnets (EKS nodes)         │  │
                        │   └──────────────────────────────────────┘  │
                        └─────────────────────────────────────────────┘

                        ┌─────────────────────────────────────────────┐
                        │  GitOps Flow                                 │
                        │                                              │
                        │  Git Push → ArgoCD detects change            │
                        │          → Syncs k8s/backend/ manifests      │
                        │          → Syncs k8s/frontend/ manifests     │
                        └─────────────────────────────────────────────┘
```

---

## Project Structure

```
EKS-Task/
├── src/
│   ├── backend/          # Express.js API (Node 18)
│   └── frontend/         # React + Vite + nginx
├── k8s/
│   ├── namespace.yaml
│   ├── backend/
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── frontend/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml
├── argocd/
│   ├── projects/
│   │   └── eks-demo-project.yaml
│   └── applications/
│       ├── backend-app.yaml
│       └── frontend-app.yaml
├── terraform/
│   ├── main.tf            # VPC + EKS
│   ├── addons.tf          # NGINX ingress + cert-manager
│   ├── argocd.tf          # ArgoCD helm install + CRD bootstrap
│   ├── variables.tf
│   ├── locals.tf
│   ├── outputs.tf
│   ├── security.tf
│   └── versions.tf
└── docker-compose.yml     # Local development
```

---

## What Gets Deployed

| Resource | Details |
|---|---|
| Namespace | `app` |
| Backend Deployment | 2 replicas, Express on port 8080 |
| Frontend Deployment | 2 replicas, nginx on port 80 |
| Backend Service | ClusterIP — not exposed directly |
| Frontend Service | ClusterIP — not exposed directly |
| Ingress | NGINX ingress class, routes `/health` + `/api/*` → backend, `/` → frontend |
| ConfigMap | `PORT`, `APP_NAME`, `APP_ENV`, `ALLOWED_ORIGINS` |
| Secret | `BACKEND_API_KEY` (see secret.yaml for MongoDB example) |
| Liveness Probe | `/health` on both pods |
| Readiness Probe | `/health` on both pods |
| Resource Limits | CPU + memory requests and limits on all containers |

---

## Setup Steps

### Prerequisites
- AWS CLI configured
- Terraform >= 1.0
- kubectl
- Docker
- eksctl (optional)

---

### 1. Build and Push Docker Images

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Backend
docker build -t backend ./src/backend
docker tag backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest

# Frontend
docker build -t frontend ./src/frontend
docker tag frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
```

---

### 2. Update Image URIs

Edit both deployment files with your ECR URIs:
- `k8s/backend/deployment.yaml`
- `k8s/frontend/deployment.yaml`

---

### 3. Provision Infrastructure with Terraform

```bash
cd terraform

# Phase 1 — VPC + EKS
terraform init
terraform apply -target=module.vpc -target=module.eks_demo --auto-approve

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name <cluster-name>

# Phase 2 — Addons (NGINX ingress, cert-manager)
terraform apply -target=module.eks_addons --auto-approve

# Phase 3 — ArgoCD + bootstrap CRDs
terraform apply --auto-approve
```

---

### 4. Update ArgoCD Application Files

Replace `YOUR_GITHUB_USERNAME` in:
- `argocd/projects/eks-demo-project.yaml`
- `argocd/applications/backend-app.yaml`
- `argocd/applications/frontend-app.yaml`

Push to Git — ArgoCD will auto-sync and apply all manifests in `k8s/`.

---

### 5. Access ArgoCD UI

```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath='{.data.password}' | base64 -d

# Port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080  (admin / <password above>)
```

---

### 6. Get the Application URL

```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## Verification Commands

```bash
# Nodes
kubectl get nodes

# Pods
kubectl get pods -n app

# Services
kubectl get svc -n app

# Ingress
kubectl get ingress -n app

# Describe a pod
kubectl describe pod <pod-name> -n app

# Health check via ingress
curl http://<NLB-hostname>/health

# API status via ingress
curl http://<NLB-hostname>/api/status
```

---

## Local Development

```bash
docker-compose up --build
# Frontend: http://localhost
# Backend:  http://localhost:8080
```

---

## Known Issues / Assumptions

- `ALLOWED_ORIGINS` in the ConfigMap has no functional effect in this setup because nginx proxies requests server-to-server (no browser Origin header). It is kept for documentation and future use.
- `BACKEND_API_KEY` is a placeholder value. Replace with a strong random secret before any real deployment.
- EKS Auto Mode is used — no manual node group management needed.
- Single NAT Gateway is used to reduce cost (`enable_single_nat_gateway = true`). Use `false` for production.
- ArgoCD is accessed via port-forward only. For production, expose it via an Ingress with TLS.

---

## What I Would Improve for Production

- Add TLS via cert-manager (Let's Encrypt) on the Ingress
- Use AWS Secrets Manager or External Secrets Operator instead of raw K8s Secrets
- Add a proper MongoDB or RDS database with credentials in Secrets
- Set up a CI/CD pipeline (GitHub Actions) to build, push images, and update image tags automatically
- Enable EKS cluster logging to CloudWatch
- Add Horizontal Pod Autoscaler (HPA) on both deployments
- Use multiple NAT Gateways across AZs for high availability
- Add network policies to restrict pod-to-pod traffic
