# =============================================================================
# SECURITY GROUPS AND RULES
# =============================================================================

resource "aws_security_group_rule" "internet_to_lb_http" {
  description       = "Allow HTTP traffic from internet to LoadBalancer"
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.eks_demo.cluster_security_group_id
}

resource "aws_security_group_rule" "internet_to_lb_https" {
  description       = "Allow HTTPS traffic from internet to LoadBalancer"
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.eks_demo.cluster_security_group_id
}

resource "aws_security_group_rule" "health_checks_to_lb" {
  description       = "Allow AWS health checks to NGINX ingress controller"
  type              = "ingress"
  from_port         = 10254
  to_port           = 10254
  protocol          = "tcp"
  cidr_blocks       = [module.vpc.vpc_cidr_block]
  security_group_id = module.eks_demo.cluster_security_group_id
}
