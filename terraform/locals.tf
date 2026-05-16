# =============================================================================
# LOCAL VALUES AND DATA SOURCES
# =============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random suffix to avoid resource name conflicts on re-deploys
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

locals {
  cluster_name = "${var.cluster_name}-${random_string.suffix.result}"

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = [for k, v in local.azs : cidrsubnet(var.vpc_cidr, 8, k + 10)]
  public_subnets  = [for k, v in local.azs : cidrsubnet(var.vpc_cidr, 8, k)]

  common_tags = {
    Environment = var.environment
    Project     = "eks-demo"
    ManagedBy   = "terraform"
    Owner       = data.aws_caller_identity.current.user_id
  }

  # Required subnet tags for AWS Load Balancer Controller / NGINX
  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = "1"
  }
}
