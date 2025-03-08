# CampusCart Deployment

This directory contains scripts and configuration files for deploying the CampusCart application to AWS.

## Directory Structure

- `aws/`: Contains AWS-specific deployment files
  - `cloudformation-template.yaml`: CloudFormation template for AWS infrastructure
  - `deploy.sh`: Main deployment script
  - `update-task-definition.sh`: Script to update ECS task definition
  - `monitor-deployment.sh`: Script to monitor deployment progress
  - `cleanup.sh`: Script to clean up AWS resources
  - `task-definition.json`: ECS task definition template

- `DEPLOYMENT_GUIDE.md`: Comprehensive guide for deployment

## Deployment on Windows

Since the deployment scripts are bash scripts, you'll need to use one of the following methods to run them on Windows:

1. **Windows Subsystem for Linux (WSL)**:
   - Install WSL from the Microsoft Store
   - Open a WSL terminal
   - Navigate to the deployment directory
   - Make the scripts executable: `chmod +x aws/*.sh`
   - Run the deployment script: `./aws/deploy.sh [environment] [region]`

2. **Git Bash**:
   - Install Git for Windows, which includes Git Bash
   - Open Git Bash
   - Navigate to the deployment directory
   - Make the scripts executable: `chmod +x aws/*.sh`
   - Run the deployment script: `./aws/deploy.sh [environment] [region]`

3. **Docker**:
   - Use a Docker container with bash installed
   - Mount the deployment directory
   - Run the scripts inside the container

## Deployment on Linux/macOS

1. Open a terminal
2. Navigate to the deployment directory
3. Make the scripts executable: `chmod +x aws/*.sh`
4. Run the deployment script: `./aws/deploy.sh [environment] [region]`

## CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for continuous integration and deployment. See the main README.md for more information.

## Additional Resources

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [CloudFormation Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
- [Docker Documentation](https://docs.docker.com/) 