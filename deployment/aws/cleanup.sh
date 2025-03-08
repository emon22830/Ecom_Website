#!/bin/bash

# Exit on error
set -e

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="campuscart-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_color() {
  echo -e "${2}${1}${NC}"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  print_color "AWS CLI is not installed. Please install it first." "$RED"
  exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
  print_color "AWS credentials are not configured. Please run 'aws configure' first." "$RED"
  exit 1
fi

# Confirm cleanup
read -p "Are you sure you want to delete all resources for environment ${ENVIRONMENT} in region ${REGION}? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_color "Cleanup aborted." "$YELLOW"
  exit 0
fi

print_color "Starting cleanup for environment: ${ENVIRONMENT} in region: ${REGION}" "$GREEN"

# Get S3 bucket name for frontend
S3_FRONTEND_BUCKET=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text --region "${REGION}" 2>/dev/null || echo "")

# Get ECR repository URI
ECR_REPOSITORY_URI=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" --output text --region "${REGION}" 2>/dev/null || echo "")
ECR_REPOSITORY_NAME=$(echo "${ECR_REPOSITORY_URI}" | cut -d'/' -f2 2>/dev/null || echo "")

# Get CloudFront distribution ID
CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region "${REGION}" 2>/dev/null || echo "")

# Clean up S3 bucket
if [[ -n "${S3_FRONTEND_BUCKET}" ]]; then
  print_color "Emptying S3 bucket: ${S3_FRONTEND_BUCKET}..." "$YELLOW"
  aws s3 rm "s3://${S3_FRONTEND_BUCKET}" --recursive --region "${REGION}" || true
fi

# Clean up CloudFront distribution
if [[ -n "${CLOUDFRONT_DIST_ID}" ]]; then
  print_color "Checking CloudFront distribution: ${CLOUDFRONT_DIST_ID}..." "$YELLOW"
  
  # Get the current configuration
  ETAG=$(aws cloudfront get-distribution-config --id "${CLOUDFRONT_DIST_ID}" --query "ETag" --output text --region "${REGION}" 2>/dev/null || echo "")
  
  if [[ -n "${ETAG}" ]]; then
    print_color "Disabling CloudFront distribution: ${CLOUDFRONT_DIST_ID}..." "$YELLOW"
    
    # Get the current config and disable the distribution
    aws cloudfront get-distribution-config --id "${CLOUDFRONT_DIST_ID}" --region "${REGION}" > /tmp/cf-config.json
    
    # Extract the distribution config and modify it
    jq '.DistributionConfig.Enabled = false' /tmp/cf-config.json > /tmp/cf-config-disabled.json
    
    # Update the distribution to disable it
    aws cloudfront update-distribution --id "${CLOUDFRONT_DIST_ID}" --if-match "${ETAG}" --distribution-config "$(jq '.DistributionConfig' /tmp/cf-config-disabled.json)" --region "${REGION}" || true
    
    print_color "CloudFront distribution disabled. It will be deleted when the CloudFormation stack is deleted." "$GREEN"
  fi
fi

# Clean up ECS services and tasks
print_color "Cleaning up ECS resources..." "$YELLOW"

# Check if the ECS service exists
if aws ecs describe-services --cluster "${STACK_NAME}-cluster" --services "${STACK_NAME}-service" --region "${REGION}" --query "services[?status=='ACTIVE']" --output text &> /dev/null; then
  print_color "Updating ECS service to 0 desired count..." "$YELLOW"
  aws ecs update-service --cluster "${STACK_NAME}-cluster" --service "${STACK_NAME}-service" --desired-count 0 --region "${REGION}" || true
  
  print_color "Waiting for tasks to stop..." "$YELLOW"
  sleep 30
  
  print_color "Deleting ECS service..." "$YELLOW"
  aws ecs delete-service --cluster "${STACK_NAME}-cluster" --service "${STACK_NAME}-service" --force --region "${REGION}" || true
fi

# Delete CloudFormation stack
print_color "Deleting CloudFormation stack: ${STACK_NAME}..." "$YELLOW"
aws cloudformation delete-stack --stack-name "${STACK_NAME}" --region "${REGION}"

print_color "Waiting for CloudFormation stack deletion to complete..." "$YELLOW"
aws cloudformation wait stack-delete-complete --stack-name "${STACK_NAME}" --region "${REGION}" || true

# Clean up ECR repository
if [[ -n "${ECR_REPOSITORY_NAME}" ]]; then
  print_color "Deleting ECR repository: ${ECR_REPOSITORY_NAME}..." "$YELLOW"
  aws ecr delete-repository --repository-name "${ECR_REPOSITORY_NAME}" --force --region "${REGION}" || true
fi

# Clean up deployment S3 bucket
S3_DEPLOYMENT_BUCKET="campuscart-deployment-${ENVIRONMENT}"
if aws s3 ls "s3://${S3_DEPLOYMENT_BUCKET}" &> /dev/null; then
  print_color "Emptying deployment S3 bucket: ${S3_DEPLOYMENT_BUCKET}..." "$YELLOW"
  aws s3 rm "s3://${S3_DEPLOYMENT_BUCKET}" --recursive --region "${REGION}" || true
  
  print_color "Deleting deployment S3 bucket: ${S3_DEPLOYMENT_BUCKET}..." "$YELLOW"
  aws s3 rb "s3://${S3_DEPLOYMENT_BUCKET}" --force --region "${REGION}" || true
fi

# Clean up CloudWatch logs
print_color "Deleting CloudWatch log groups..." "$YELLOW"
aws logs describe-log-groups --log-group-name-prefix "/ecs/campuscart-backend-${ENVIRONMENT}" --query "logGroups[*].logGroupName" --output text --region "${REGION}" | tr '\t' '\n' | while read -r LOG_GROUP; do
  print_color "Deleting log group: ${LOG_GROUP}..." "$YELLOW"
  aws logs delete-log-group --log-group-name "${LOG_GROUP}" --region "${REGION}" || true
done

# Clean up SSM parameters
print_color "Deleting SSM parameters..." "$YELLOW"
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/db/username" --region "${REGION}" || true
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/db/password" --region "${REGION}" || true
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/stripe/secret_key" --region "${REGION}" || true
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/jwt/secret" --region "${REGION}" || true
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/mongodb/username" --region "${REGION}" || true
aws ssm delete-parameter --name "/campuscart/${ENVIRONMENT}/mongodb/password" --region "${REGION}" || true

print_color "Cleanup completed successfully!" "$GREEN"
print_color "All resources for environment ${ENVIRONMENT} in region ${REGION} have been deleted or scheduled for deletion." "$GREEN" 