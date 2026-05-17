# EKS Application Setup — General Store

A full-stack application deployed on Amazon Web Services using:

* Amazon EKS (Auto Mode)
* Terraform
* ArgoCD (GitOps)
* GitHub Actions CI/CD
* Amazon ECR
* NGINX Ingress Controller

---

# Architecture Overview

* Frontend: React + Vite + NGINX
* Backend: Express.js API
* Kubernetes: Amazon EKS
* Ingress: ingress-nginx + AWS NLB
* GitOps: ArgoCD
* IaC: Terraform
* Registry: Amazon ECR

---

# Project Structure

```bash
EKS-Task/
├── src/
│   ├── backend/
│   └── frontend/
├── k8s/
│   ├── namespace.yaml
│   ├── backend/
│   └── frontend/
├── argocd/
│   ├── projects/
│   └── applications/
├── terraform/
└── .github/workflows/
```

---

# Prerequisites

Install and configure:

* AWS CLI
* kubectl
* Terraform >= 1.0
* Docker
* Helm

Configure AWS credentials:

```bash
aws configure
```

---

# Step 1 — Build and Push Docker Images to ECR

## Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

---

## Backend Image

```bash
docker build -t backend ./src/backend

docker tag backend:latest \
<account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest

docker push \
<account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest
```

---

## Frontend Image

```bash
docker build -t frontend ./src/frontend

docker tag frontend:latest \
<account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest

docker push \
<account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
```

---

# Step 2 — Update Image URIs

Update image paths inside:

```bash
k8s/backend/deployment.yaml
k8s/frontend/deployment.yaml
```

Replace with your ECR image URIs.

---

# Step 3 — Provision Infrastructure with Terraform

Navigate to terraform directory:

```bash
cd terraform
```

---

## Initialize Terraform

```bash
terraform init
```

---

## Create VPC + EKS Cluster

```bash
terraform apply \
-target=module.vpc \
-target=module.eks_demo \
--auto-approve
```


# Step 4 — Install ArgoCD + Bootstrap Applications + Add-ons

```bash
terraform apply --auto-approve
```

This installs:

* ArgoCD
* AppProject CRDs
* Application CRDs
* And other Add-ons 

---


# Step 5 — Configure kubectl

```bash
aws eks update-kubeconfig \
--region us-east-1 \
--name <cluster-name>
```

Verify cluster:

```bash
kubectl get nodes
```

---


# Step 6 — Update ArgoCD Repository References

Update GitHub username/repository references inside:

```bash
argocd/projects/
argocd/applications/
```

Push changes to GitHub.

ArgoCD will automatically sync manifests from:

```bash
k8s/
```

---

# Step 8 — Access ArgoCD UI

## Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
-o jsonpath='{.data.password}' | base64 -d
```

---

## Port Forward ArgoCD

```bash
kubectl port-forward svc/argocd-server \
-n argocd 8080:443
```

Username:

```bash
admin
```

Password:

```bash
<output-from-previous-command>
```

---

# Step 9 — Get Application URL

```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller \
-o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Open:

```bash
http://<NLB-hostname>
```

---

# Verification Commands

## Nodes

```bash
kubectl get nodes
```

---

## Pods

```bash
kubectl get pods -n app
```

---

## Services

```bash
kubectl get svc -n app
```

---

## Ingress

```bash
kubectl get ingress -n app
```

---

## Describe Pod

```bash
kubectl describe pod <pod-name> -n app
```

---

## Health Check

```bash
curl http://<NLB-hostname>/health
```

---

## API Status

```bash
curl http://<NLB-hostname>/api/status
```

---

# GitOps Flow

```text
Git Push
   ↓
GitHub Actions
   ↓
Build Docker Image
   ↓
Push to ECR
   ↓
Update Kubernetes Manifests
   ↓
ArgoCD Detects Change
   ↓
Auto Sync to EKS
```

---

# Features Implemented

* Amazon EKS Auto Mode
* Terraform Infrastructure Provisioning
* ArgoCD GitOps
* GitHub Actions CI/CD
* Amazon ECR Integration
* NGINX Ingress Controller
* ConfigMap & Secrets
* Liveness & Readiness Probes
* Resource Requests & Limits
* Path-based Routing
* Private EKS Nodes

---

# Production Improvements

* TLS with cert-manager + Let's Encrypt
* External Secrets Operator / AWS Secrets Manager
* Horizontal Pod Autoscaler (HPA)
* Monitoring with Prometheus + Grafana
* Multi-AZ NAT Gateway
* RDS / MongoDB Integration
* WAF + CloudFront
* Network Policies
