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

print_color "Updating task definition for environment: ${ENVIRONMENT} in region: ${REGION}" "$GREEN"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# Get stack outputs
print_color "Getting stack outputs..." "$YELLOW"
ECR_REPOSITORY_URI=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" --output text --region "${REGION}")
RDS_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='RDSEndpoint'].OutputValue" --output text --region "${REGION}")
REDIS_HOST=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ElastiCacheEndpoint'].OutputValue" --output text --region "${REGION}")
API_URL=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text --region "${REGION}")
FRONTEND_URL="https://$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text --region "${REGION}")"
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text --region "${REGION}")
SUBNET1=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet1'].OutputValue" --output text --region "${REGION}")
SUBNET2=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet2'].OutputValue" --output text --region "${REGION}")
SECURITY_GROUP=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ECSSecurityGroupId'].OutputValue" --output text --region "${REGION}")
TASK_EXECUTION_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ECSTaskExecutionRoleArn'].OutputValue" --output text --region "${REGION}")

# Generate a random JWT secret if not already set
JWT_SECRET=$(openssl rand -base64 32)

# Set MongoDB URI - using a placeholder, you'll need to replace with actual MongoDB connection string
MONGODB_URI="mongodb+srv://\${DB_USERNAME}:\${DB_PASSWORD}@cluster0.mongodb.net/campuscart-${ENVIRONMENT}?retryWrites=true&w=majority"

# Create a temporary task definition file
TEMP_TASK_DEF=$(mktemp)

# Replace placeholders in the task definition template
print_color "Updating task definition template..." "$YELLOW"
cat task-definition.json | \
  sed "s|\${AWS_ACCOUNT_ID}|${AWS_ACCOUNT_ID}|g" | \
  sed "s|\${ECR_REPOSITORY_URI}|${ECR_REPOSITORY_URI}|g" | \
  sed "s|\${ENVIRONMENT}|${ENVIRONMENT}|g" | \
  sed "s|\${MONGODB_URI}|${MONGODB_URI}|g" | \
  sed "s|\${REDIS_HOST}|${REDIS_HOST}|g" | \
  sed "s|\${JWT_SECRET}|${JWT_SECRET}|g" | \
  sed "s|\${AWS_REGION}|${REGION}|g" | \
  sed "s|\${S3_BUCKET}|${S3_BUCKET}|g" | \
  sed "s|\${API_URL}|${API_URL}|g" | \
  sed "s|\${FRONTEND_URL}|${FRONTEND_URL}|g" | \
  sed "s|\${TASK_EXECUTION_ROLE_ARN}|${TASK_EXECUTION_ROLE_ARN}|g" > "${TEMP_TASK_DEF}"

# Register the new task definition
print_color "Registering new task definition..." "$YELLOW"
TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
  --cli-input-json "file://${TEMP_TASK_DEF}" \
  --region "${REGION}" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)

# Clean up temporary file
rm "${TEMP_TASK_DEF}"

print_color "Task definition registered successfully: ${TASK_DEFINITION_ARN}" "$GREEN"

# Check if the ECS service exists
if aws ecs describe-services --cluster "${STACK_NAME}-cluster" --services "${STACK_NAME}-service" --region "${REGION}" --query "services[?status=='ACTIVE']" --output text &> /dev/null; then
  # Update the existing service
  print_color "Updating existing ECS service..." "$YELLOW"
  aws ecs update-service \
    --cluster "${STACK_NAME}-cluster" \
    --service "${STACK_NAME}-service" \
    --task-definition "${TASK_DEFINITION_ARN}" \
    --region "${REGION}"
else
  # Create a new service
  print_color "Creating new ECS service..." "$YELLOW"
  aws ecs create-service \
    --cluster "${STACK_NAME}-cluster" \
    --service-name "${STACK_NAME}-service" \
    --task-definition "${TASK_DEFINITION_ARN}" \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNET1},${SUBNET2}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=ENABLED}" \
    --region "${REGION}"
fi

print_color "ECS service updated successfully!" "$GREEN" 