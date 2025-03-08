# CampusCart Deployment Guide

This guide provides detailed instructions for deploying the CampusCart application to AWS using the provided deployment scripts and CloudFormation templates.

## Prerequisites

Before you begin, ensure you have the following:

1. **AWS Account**: You need an AWS account with appropriate permissions to create and manage resources.
2. **AWS CLI**: Install and configure the AWS CLI on your local machine.
3. **Docker**: Install Docker to build and push container images.
4. **Node.js**: Install Node.js (v16 or higher) for building the frontend application.
5. **Git**: Install Git for version control.

## Setting Up AWS Credentials

1. Create an IAM user with programmatic access and the following permissions:
   - AmazonS3FullAccess
   - AmazonECR-FullAccess
   - AmazonECS-FullAccess
   - AmazonRDSFullAccess
   - AmazonElastiCacheFullAccess
   - AmazonAPIGatewayAdministrator
   - CloudFrontFullAccess
   - AWSCloudFormationFullAccess

2. Configure AWS CLI with your credentials:
   ```bash
   aws configure
   ```

3. Enter your AWS Access Key ID, Secret Access Key, default region (e.g., us-east-1), and output format (json).

## Deployment Options

### Option 1: Manual Deployment

1. Navigate to the deployment directory:
   ```bash
   cd deployment/aws
   ```

2. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh [environment] [region]
   ```
   
   Where:
   - `environment` is one of: dev, staging, prod (default: dev)
   - `region` is the AWS region (default: us-east-1)

   Example:
   ```bash
   ./deploy.sh prod us-west-2
   ```

4. The script will:
   - Create or update the CloudFormation stack
   - Build and push Docker images to ECR
   - Deploy the frontend to S3
   - Set up CloudFront distribution
   - Configure API Gateway

5. After deployment, the script will output the URLs for the frontend and API.

### Option 2: CI/CD with GitHub Actions

1. Fork or clone the CampusCart repository.

2. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key
   - `SLACK_WEBHOOK_URL` (optional): For deployment notifications

3. Push changes to the main branch or create a pull request to trigger the CI/CD pipeline.

4. Alternatively, manually trigger the workflow from the GitHub Actions tab and select the environment to deploy to.

## Deployment Architecture

The deployment creates the following AWS resources:

1. **Frontend**:
   - S3 bucket for static assets
   - CloudFront distribution for content delivery

2. **Backend**:
   - ECS cluster for container orchestration
   - ECR repository for Docker images
   - API Gateway for API management

3. **Databases**:
   - RDS PostgreSQL instance for transactional data
   - ElastiCache Redis cluster for caching

4. **Security**:
   - Security groups for controlling access
   - IAM roles and policies for service permissions

## Post-Deployment Configuration

After deployment, you may need to:

1. **Set up DNS**: Configure your domain to point to the CloudFront distribution.

2. **SSL Certificate**: Set up an SSL certificate for your domain using AWS Certificate Manager.

3. **Database Migration**: Run database migrations to set up the schema.
   ```bash
   # Connect to the backend container
   aws ecs execute-command --cluster [cluster-name] --task [task-id] --container [container-name] --command "/bin/sh" --interactive
   
   # Run migrations
   npm run migrate
   ```

4. **Create Admin User**: Create an initial admin user for the application.
   ```bash
   # Inside the container
   npm run create-admin
   ```

## Monitoring and Logging

1. **CloudWatch**: Access CloudWatch to view logs and metrics for your services.

2. **X-Ray**: Enable X-Ray for distributed tracing (optional).

3. **Alerts**: Set up CloudWatch alarms for important metrics like CPU usage, memory usage, and error rates.

## Troubleshooting

1. **CloudFormation Stack Issues**:
   - Check the CloudFormation console for stack events and error messages.
   - Verify that your IAM user has the necessary permissions.

2. **Docker Build Failures**:
   - Ensure Docker is running on your machine.
   - Check that your Dockerfiles are correctly configured.

3. **Deployment Script Errors**:
   - Verify that you have the latest version of the AWS CLI.
   - Check that your AWS credentials are correctly configured.

4. **Application Errors**:
   - Check CloudWatch logs for application errors.
   - Verify that environment variables are correctly set.

## Scaling the Application

To scale the application:

1. **Horizontal Scaling**:
   - Increase the number of tasks in the ECS service.
   - Configure auto-scaling based on CPU or memory usage.

2. **Vertical Scaling**:
   - Increase the CPU and memory allocation for ECS tasks.
   - Upgrade the RDS instance class for better database performance.

3. **Read Replicas**:
   - Add RDS read replicas for read-heavy workloads.
   - Configure the application to use read replicas for queries.

## Backup and Disaster Recovery

1. **Database Backups**:
   - Enable automated backups for RDS.
   - Consider setting up cross-region replication for disaster recovery.

2. **S3 Versioning**:
   - Enable versioning on S3 buckets to protect against accidental deletions.

3. **Multi-Region Deployment**:
   - For high availability, consider deploying to multiple AWS regions.
   - Use Route 53 for DNS failover between regions.

## Security Best Practices

1. **Regular Updates**:
   - Keep Docker images and dependencies up to date.
   - Apply security patches promptly.

2. **Least Privilege**:
   - Review and refine IAM policies to follow the principle of least privilege.

3. **Network Security**:
   - Use security groups to restrict access to services.
   - Consider implementing a VPC for additional network isolation.

4. **Secrets Management**:
   - Use AWS Secrets Manager for storing sensitive information.
   - Avoid hardcoding credentials in your application code.

## Cost Optimization

1. **Resource Sizing**:
   - Right-size your resources based on actual usage patterns.
   - Consider using Spot Instances for non-critical workloads.

2. **Reserved Instances**:
   - Purchase Reserved Instances for predictable workloads to save costs.

3. **Cleanup**:
   - Regularly clean up unused resources like old ECR images and S3 objects.
   - Set up lifecycle policies for automatic cleanup.

## Support and Feedback

If you encounter any issues or have suggestions for improving the deployment process, please:

1. Open an issue on the GitHub repository.
2. Contact the development team at support@campuscart.com.

We're continuously working to improve the deployment process and appreciate your feedback! 