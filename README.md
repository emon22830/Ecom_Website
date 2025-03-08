# CampusCart - Institution-Based Marketplace

CampusCart is a full-stack web application that enables students from a single institution to buy and sell products within their community. Only verified sellers can list products after going through a strict verification process.

## 📌 Features

### 1️⃣ User Authentication & Profile
- JWT-based authentication (Login, Register, Logout) with OAuth2 & Google SSO
- Role-Based Access Control (RBAC) – Buyers, Verified Sellers, Admins
- Profile Section – View personal details, order history, and seller verification option
- Light & Dark Mode Support with smooth UI transitions

### 2️⃣ CampusCart Section (Institution-Specific Marketplace)
- Only verified students can access the marketplace
- Products are exclusive to a single institution (No global marketplace yet)
- Users can browse available products, search & filter by category

### 3️⃣ Product Management (For Verified Sellers Only)
- Sellers can add, edit, delete products
- Product details include title, images, price, category, customization options
- Admin approval required before a product becomes visible

### 4️⃣ Seller Verification Process
- Students must apply to become a verified seller
- Required documents: Student ID, Selfie with ID, Optional Guardian Letter (for minors)
- Admin manually reviews and approves/rejects applications

### 5️⃣ Cart & Checkout
- Users can add/remove items from the cart
- Checkout process with order summary, payment options
- Stripe, PayPal, Google Pay, Apple Pay, and Crypto Payments (USDT, Bitcoin, Ethereum)
- AI-powered fraud detection for payment security

### 6️⃣ Order Management
- Track order status (Pending, Shipped, Delivered)
- Sellers can update order status
- Buyers receive notifications for order updates

### 7️⃣ Messaging System
- Buyers and sellers can communicate via a messaging system
- Sellers receive inquiries from potential buyers

### 8️⃣ Admin Panel
- Admin approves/rejects seller applications
- Admin manages product approvals
- Admin can view all users, orders, and transactions

### 9️⃣ Push Notifications (Real-Time Alerts)
- New Order Alerts for Sellers
- Order Status Updates for Buyers
- New Message Alerts for Buyer-Seller Communication
- Admin Notifications for Seller Approval/Rejection

### 🔟 AI-Based Product Recommendations
- Personalized recommendations using AI (Collaborative Filtering Algorithm)
- "Trending Now" section based on most viewed & purchased products
- "Recently Viewed" section for easy product access
- AI-Powered Smart Search with auto-suggestions

## 📌 Tech Stack

### Frontend
- React.js (Next.js)
- Tailwind CSS
- Redux Toolkit
- TypeScript

### Backend
- Node.js
- Express.js
- GraphQL
- MongoDB Atlas (Sharded Cluster)
- PostgreSQL (for transactions)
- Redis (for caching)

### Authentication
- JWT
- OAuth2
- Firebase Auth

### Real-Time Features
- Socket.io
- Kafka
- WebRTC (for messaging)

### Payments
- Stripe
- PayPal
- Google Pay
- Apple Pay
- Crypto (USDT, Bitcoin)

### Push Notifications
- AWS SNS
- Firebase Cloud Messaging (FCM)

### AI Recommendation System
- TensorFlow.js
- Collaborative Filtering Algorithm

### Testing
- Jest
- Supertest for API Automation

### CI/CD Pipeline
- GitHub Actions
- AWS CodePipeline

## 📌 AWS Integration & Deployment

- Frontend Hosting: AWS Amplify + CloudFront CDN
- Backend Hosting: AWS EKS (Kubernetes) + AWS API Gateway
- Load Balancer: AWS ALB (Application Load Balancer)
- Database Management: MongoDB Atlas + RDS PostgreSQL
- Caching: AWS ElastiCache (Redis)
- File Storage & CDN: AWS S3 + CloudFront
- Monitoring & Security: AWS CloudWatch + AWS Shield
- CI/CD Automation: AWS CodePipeline

## 📌 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis
- AWS Account (for deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/campuscart.git
cd campuscart
```

2. Install dependencies for backend
```bash
cd backend
npm install
```

3. Install dependencies for frontend
```bash
cd ../frontend
npm install
```

4. Set up environment variables
   - Copy `.env.example` to `.env` in the backend directory
   - Copy `.env.local.example` to `.env.local` in the frontend directory
   - Fill in the required environment variables

5. Run the development server
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## 📌 Project Structure

```
campuscart/
├── backend/                # Node.js backend
│   ├── config/             # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   └── redis.js        # Redis configuration
│   ├── controllers/        # Route controllers
│   │   ├── authController.js # Authentication controller
│   │   └── ...
│   ├── middleware/         # Custom middleware
│   │   ├── authMiddleware.js # Authentication middleware
│   │   └── ...
│   ├── models/             # Mongoose models
│   │   ├── userModel.js    # User model
│   │   ├── productModel.js # Product model
│   │   └── ...
│   ├── routes/             # API routes
│   │   ├── authRoutes.js   # Authentication routes
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── socketService.js # Socket.io service
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── logger.js       # Winston logger
│   │   └── ...
│   └── server.js           # Entry point
├── frontend/               # React.js frontend
│   ├── app/                # Next.js app directory
│   │   ├── auth/           # Authentication pages
│   │   ├── marketplace/    # Marketplace pages
│   │   └── ...
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Redux store
│   │   ├── api/            # RTK Query API
│   │   └── slices/         # Redux slices
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
└── README.md               # Project documentation
```

## 📌 API Documentation

The API documentation is available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs) when running the backend server.

## 📌 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📌 Deployment

### AWS Deployment

The CampusCart application is designed to be deployed on AWS using CloudFormation for infrastructure as code. The deployment process is automated using scripts in the `deployment/aws` directory.

#### Prerequisites for Deployment

1. **AWS Account**: You need an AWS account with appropriate permissions.
2. **AWS CLI**: Install and configure the AWS CLI on your local machine.
3. **Docker**: Install Docker to build and push container images.
4. **Node.js**: Install Node.js (v16 or higher) for building the frontend application.

#### Deployment Steps

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Navigate to the deployment directory:
   ```bash
   cd deployment/aws
   ```

3. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

4. Run the deployment script:
   ```bash
   ./deploy.sh [environment] [region]
   ```
   
   Where:
   - `environment` is one of: dev, staging, prod (default: dev)
   - `region` is the AWS region (default: us-east-1)

5. Monitor the deployment:
   ```bash
   ./monitor-deployment.sh [environment] [region]
   ```

6. After deployment, the script will output the URLs for the frontend and API.

#### CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for continuous integration and deployment:

1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key
   - `SLACK_WEBHOOK_URL` (optional): For deployment notifications

2. Push changes to the main branch or create a pull request to trigger the CI/CD pipeline.

3. Alternatively, manually trigger the workflow from the GitHub Actions tab and select the environment to deploy to.

#### Cleaning Up Resources

To clean up all AWS resources when they are no longer needed:

```bash
cd deployment/aws
chmod +x cleanup.sh
./cleanup.sh [environment] [region]
```

For more detailed information about the deployment process, please refer to the [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md).

## 📌 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📌 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📌 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [AWS](https://aws.amazon.com/) 