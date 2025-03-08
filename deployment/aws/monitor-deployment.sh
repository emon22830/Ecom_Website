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

print_color "Monitoring deployment for environment: ${ENVIRONMENT} in region: ${REGION}" "$GREEN"

# Function to monitor CloudFormation stack
monitor_cloudformation() {
  print_color "Monitoring CloudFormation stack: ${STACK_NAME}..." "$YELLOW"
  
  while true; do
    STATUS=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].StackStatus" --output text --region "${REGION}")
    
    if [[ "${STATUS}" == *"COMPLETE"* ]]; then
      if [[ "${STATUS}" == *"ROLLBACK"* || "${STATUS}" == *"FAILED"* ]]; then
        print_color "Stack deployment failed with status: ${STATUS}" "$RED"
        print_color "Checking stack events for errors..." "$YELLOW"
        aws cloudformation describe-stack-events --stack-name "${STACK_NAME}" --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].{Resource:LogicalResourceId, Reason:ResourceStatusReason}" --output table --region "${REGION}"
        return 1
      else
        print_color "Stack deployment completed successfully with status: ${STATUS}" "$GREEN"
        return 0
      fi
    elif [[ "${STATUS}" == *"IN_PROGRESS"* ]]; then
      print_color "Stack deployment in progress with status: ${STATUS}" "$BLUE"
      sleep 30
    else
      print_color "Stack deployment in unknown state: ${STATUS}" "$RED"
      return 1
    fi
  done
}

# Function to monitor ECS service
monitor_ecs_service() {
  print_color "Monitoring ECS service: ${STACK_NAME}-service..." "$YELLOW"
  
  while true; do
    # Check if the service exists
    if ! aws ecs describe-services --cluster "${STACK_NAME}-cluster" --services "${STACK_NAME}-service" --region "${REGION}" --query "services[?status=='ACTIVE']" --output text &> /dev/null; then
      print_color "ECS service not found or not active yet. Waiting..." "$BLUE"
      sleep 30
      continue
    fi
    
    # Get deployment status
    DEPLOYMENTS=$(aws ecs describe-services --cluster "${STACK_NAME}-cluster" --services "${STACK_NAME}-service" --region "${REGION}" --query "services[0].deployments" --output json)
    PRIMARY_DEPLOYMENT=$(echo "${DEPLOYMENTS}" | jq '.[] | select(.status == "PRIMARY")')
    
    DESIRED_COUNT=$(echo "${PRIMARY_DEPLOYMENT}" | jq -r '.desiredCount')
    RUNNING_COUNT=$(echo "${PRIMARY_DEPLOYMENT}" | jq -r '.runningCount')
    PENDING_COUNT=$(echo "${PRIMARY_DEPLOYMENT}" | jq -r '.pendingCount')
    FAILED_TASKS=$(echo "${PRIMARY_DEPLOYMENT}" | jq -r '.failedTasks')
    
    print_color "Deployment status: Desired=${DESIRED_COUNT}, Running=${RUNNING_COUNT}, Pending=${PENDING_COUNT}, Failed=${FAILED_TASKS}" "$BLUE"
    
    if [[ "${RUNNING_COUNT}" -eq "${DESIRED_COUNT}" && "${PENDING_COUNT}" -eq 0 ]]; then
      print_color "ECS service deployment completed successfully!" "$GREEN"
      return 0
    elif [[ "${FAILED_TASKS}" -gt 0 ]]; then
      print_color "ECS service deployment has failed tasks. Check the ECS console for more details." "$RED"
      return 1
    else
      print_color "ECS service deployment in progress..." "$BLUE"
      sleep 30
    fi
  done
}

# Function to check CloudFront distribution
check_cloudfront() {
  print_color "Checking CloudFront distribution..." "$YELLOW"
  
  CLOUDFRONT_ID=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region "${REGION}")
  CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text --region "${REGION}")
  
  if [[ -z "${CLOUDFRONT_ID}" || -z "${CLOUDFRONT_DOMAIN}" ]]; then
    print_color "CloudFront distribution not found in stack outputs." "$RED"
    return 1
  fi
  
  STATUS=$(aws cloudfront get-distribution --id "${CLOUDFRONT_ID}" --query "Distribution.Status" --output text)
  
  if [[ "${STATUS}" == "Deployed" ]]; then
    print_color "CloudFront distribution is deployed and available at: https://${CLOUDFRONT_DOMAIN}" "$GREEN"
    return 0
  else
    print_color "CloudFront distribution is still deploying with status: ${STATUS}" "$BLUE"
    return 1
  fi
}

# Function to check API Gateway
check_api_gateway() {
  print_color "Checking API Gateway..." "$YELLOW"
  
  API_URL=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text --region "${REGION}")
  
  if [[ -z "${API_URL}" ]]; then
    print_color "API Gateway URL not found in stack outputs." "$RED"
    return 1
  fi
  
  print_color "API Gateway URL: ${API_URL}" "$GREEN"
  
  # Try to access the health endpoint
  print_color "Attempting to access API health endpoint..." "$BLUE"
  if curl -s "${API_URL}/health" | grep -q "status"; then
    print_color "API Gateway is responding correctly!" "$GREEN"
    return 0
  else
    print_color "API Gateway is not responding correctly. Check the API Gateway console for more details." "$RED"
    return 1
  fi
}

# Main monitoring flow
print_color "Starting deployment monitoring..." "$GREEN"

# Monitor CloudFormation stack
monitor_cloudformation

# Monitor ECS service
monitor_ecs_service

# Check CloudFront distribution
check_cloudfront

# Check API Gateway
check_api_gateway

print_color "Deployment monitoring completed!" "$GREEN"
print_color "Frontend URL: https://$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text --region "${REGION}")" "$GREEN"
print_color "API URL: $(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text --region "${REGION}")" "$GREEN" 