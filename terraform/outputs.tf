# =============================================================================
# OUTPUT VALUES
# =============================================================================

output "cluster_name" {
  description = "EKS cluster name (with random suffix)"
  value       = module.eks_demo.cluster_name
}

output "cluster_endpoint" {
  description = "EKS control plane endpoint"
  value       = module.eks_demo.cluster_endpoint
}

output "cluster_version" {
  description = "Kubernetes version"
  value       = module.eks_demo.cluster_version
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "configure_kubectl" {
  description = "Run this command to configure kubectl after apply"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks_demo.cluster_name}"
}

output "argocd_get_password" {
  description = "Command to retrieve the ArgoCD admin password"
  value       = "kubectl -n ${var.argocd_namespace} get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
  sensitive   = true
}

output "argocd_port_forward" {
  description = "Command to access ArgoCD UI locally"
  value       = "kubectl port-forward svc/argocd-server -n ${var.argocd_namespace} 8080:443"
}

output "get_ingress_hostname" {
  description = "Command to get the NLB hostname after ingress is created"
  value       = "kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
}

output "useful_commands" {
  description = "Handy kubectl commands"
  value = {
    get_nodes        = "kubectl get nodes"
    get_pods         = "kubectl get pods -n app"
    get_services     = "kubectl get svc -n app"
    get_ingress      = "kubectl get ingress -n app"
    argocd_apps      = "kubectl get applications -n ${var.argocd_namespace}"
  }
}
