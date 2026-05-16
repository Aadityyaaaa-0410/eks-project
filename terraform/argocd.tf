# =============================================================================
# ARGOCD INSTALLATION AND APPLICATION BOOTSTRAP
# =============================================================================

# Wait for cluster and addons to stabilize before installing ArgoCD
resource "time_sleep" "wait_for_cluster" {
  create_duration = "30s"
  depends_on = [
    module.eks_demo,
    module.eks_addons
  ]
}

# =============================================================================
# INSTALL ARGOCD VIA HELM
# =============================================================================

resource "helm_release" "argocd" {
  name             = "argocd"
  namespace        = var.argocd_namespace
  create_namespace = true

  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_chart_version

  values = [
    yamlencode({
      server = {
        service = {
          type = "ClusterIP"
        }
        ingress = {
          enabled = false
        }
        # Insecure mode — access via port-forward, no TLS needed locally
        extraArgs = ["--insecure"]
      }

      controller = {
        resources = {
          requests = { cpu = "100m", memory = "128Mi" }
          limits   = { cpu = "500m", memory = "512Mi" }
        }
      }

      repoServer = {
        resources = {
          requests = { cpu = "50m", memory = "64Mi" }
          limits   = { cpu = "200m", memory = "256Mi" }
        }
      }

      redis = {
        resources = {
          requests = { cpu = "50m", memory = "64Mi" }
          limits   = { cpu = "200m", memory = "128Mi" }
        }
      }
    })
  ]

  depends_on = [time_sleep.wait_for_cluster]
}

# =============================================================================
# APPLY ARGOCD PROJECT AND APPLICATION CRDs FROM argocd/ FOLDER
# =============================================================================

resource "kubectl_manifest" "argocd_projects" {
  for_each   = fileset("${path.module}/../argocd/projects", "*.yaml")
  yaml_body  = file("${path.module}/../argocd/projects/${each.value}")
  depends_on = [helm_release.argocd]
}

resource "kubectl_manifest" "argocd_apps" {
  for_each   = fileset("${path.module}/../argocd/applications", "*.yaml")
  yaml_body  = file("${path.module}/../argocd/applications/${each.value}")
  depends_on = [kubectl_manifest.argocd_projects]
}
