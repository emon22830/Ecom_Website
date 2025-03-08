#!/bin/bash

# Exit on error
set -e

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="campuscart-${ENVIRONMENT}"
TEMPLATE_FILE="cloudformation-template.yaml"
S3_BUCKET="campuscart-deployment-${ENVIRONMENT}"
S3_PREFIX="cloudformation"

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

print_color "Starting deployment for environment: ${ENVIRONMENT} in region: ${REGION}" "$GREEN"

# Create SSM parameters for database credentials and other secrets
print_color "Creating SSM parameters for secrets..." "$YELLOW"

# Generate random passwords
DB_PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9')
DB_USERNAME="campuscart_admin"
STRIPE_SECRET_KEY="sk_test_example" # Replace with your actual Stripe test key in production
JWT_SECRET=$(openssl rand -base64 32)
MONGODB_USERNAME="mongodb_user"
MONGODB_PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9')

# Create or update SSM parameters
aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/db/username" \
  --value "${DB_USERNAME}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/db/password" \
  --value "${DB_PASSWORD}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/stripe/secret_key" \
  --value "${STRIPE_SECRET_KEY}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/jwt/secret" \
  --value "${JWT_SECRET}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/mongodb/username" \
  --value "${MONGODB_USERNAME}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

aws ssm put-parameter \
  --name "/campuscart/${ENVIRONMENT}/mongodb/password" \
  --value "${MONGODB_PASSWORD}" \
  --type "SecureString" \
  --overwrite \
  --region "${REGION}"

# Create S3 bucket for CloudFormation templates if it doesn't exist
if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
  print_color "Creating S3 bucket for CloudFormation templates: ${S3_BUCKET}" "$YELLOW"
  aws s3 mb "s3://${S3_BUCKET}" --region "${REGION}"
fi

# Upload CloudFormation template to S3
print_color "Uploading CloudFormation template to S3" "$YELLOW"
aws s3 cp "${TEMPLATE_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/${TEMPLATE_FILE}" --region "${REGION}"

# Create or update CloudFormation stack
if aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" &> /dev/null; then
  print_color "Updating existing CloudFormation stack: ${STACK_NAME}" "$YELLOW"
  aws cloudformation update-stack \
    --stack-name "${STACK_NAME}" \
    --template-url "https://${S3_BUCKET}.s3.amazonaws.com/${S3_PREFIX}/${TEMPLATE_FILE}" \
    --parameters ParameterKey=Environment,ParameterValue="${ENVIRONMENT}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${REGION}" || echo "No updates to be performed."
else
  print_color "Creating new CloudFormation stack: ${STACK_NAME}" "$YELLOW"
  aws cloudformation create-stack \
    --stack-name "${STACK_NAME}" \
    --template-url "https://${S3_BUCKET}.s3.amazonaws.com/${S3_PREFIX}/${TEMPLATE_FILE}" \
    --parameters ParameterKey=Environment,ParameterValue="${ENVIRONMENT}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${REGION}"
fi

# Wait for stack creation/update to complete
print_color "Waiting for stack ${STACK_NAME} to complete..." "$YELLOW"
aws cloudformation wait stack-create-complete --stack-name "${STACK_NAME}" --region "${REGION}" || \
aws cloudformation wait stack-update-complete --stack-name "${STACK_NAME}" --region "${REGION}"

# Get stack outputs
print_color "Stack deployment completed. Outputs:" "$GREEN"
aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs" --output table --region "${REGION}"

# Create CloudWatch log group if it doesn't exist
print_color "Creating CloudWatch log group..." "$YELLOW"
aws logs create-log-group --log-group-name "/ecs/campuscart-backend-${ENVIRONMENT}" --region "${REGION}" || true

# Build and push Docker images
print_color "Building and pushing Docker images" "$YELLOW"

# Get ECR repository URI
ECR_REPO_URI=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" --output text --region "${REGION}")

# Login to ECR
print_color "Logging in to ECR" "$YELLOW"
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ECR_REPO_URI%/*}"

# Build and push backend Docker image
print_color "Building and pushing backend Docker image" "$YELLOW"
cd ../../backend
docker build -t "${ECR_REPO_URI}:latest" .
docker push "${ECR_REPO_URI}:latest"
cd ../deployment/aws

# Update the ECS task definition and service
print_color "Updating ECS task definition and service..." "$YELLOW"
chmod +x update-task-definition.sh
./update-task-definition.sh "${ENVIRONMENT}" "${REGION}"

# Get S3 bucket name for frontend
S3_FRONTEND_BUCKET=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text --region "${REGION}")

# Build and deploy frontend
print_color "Building and deploying frontend" "$YELLOW"
cd ../../frontend
npm install
npm run build

# Check if the build output directory is 'out' or '.next'
if [ -d "out" ]; then
  print_color "Detected 'out' directory, deploying static export..." "$YELLOW"
  aws s3 sync out "s3://${S3_FRONTEND_BUCKET}" --delete --region "${REGION}"
elif [ -d ".next" ]; then
  print_color "Detected '.next' directory, deploying Next.js build..." "$YELLOW"
  # For Next.js static assets
  aws s3 sync .next/static "s3://${S3_FRONTEND_BUCKET}/_next/static" --delete --region "${REGION}"
  # For public files
  aws s3 sync public "s3://${S3_FRONTEND_BUCKET}" --delete --region "${REGION}"
  # Create a simple index.html that redirects to the Next.js app
  echo '<html><head><meta http-equiv="refresh" content="0;URL=\'https://${FRONTEND_URL}\'"></head></html>' > index.html
  aws s3 cp index.html "s3://${S3_FRONTEND_BUCKET}/index.html" --region "${REGION}"
  rm index.html
else
  print_color "No build output directory found. Please check your Next.js configuration." "$RED"
  exit 1
fi

# Get CloudFront distribution ID
CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region "${REGION}")

# Invalidate CloudFront cache
print_color "Invalidating CloudFront cache" "$YELLOW"
aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DIST_ID}" --paths "/*" --region "${REGION}"

print_color "Deployment completed successfully!" "$GREEN"
print_color "Frontend URL: https://$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text --region "${REGION}")" "$GREEN"
print_color "API URL: $(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text --region "${REGION}")" "$GREEN" 