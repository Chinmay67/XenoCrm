# XenoCRM - Campaign Management Platform

A comprehensive CRM system for managing customer campaigns with automated message delivery and analytics.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Setup Instructions](#setup-instructions)
4. [Environment Configuration](#environment-configuration)
5. [Architecture](#architecture)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Services](#services)

## Features

- Google OAuth Authentication
- Customer Data Management
- Campaign Creation and Management
- Audience Segmentation
- Message Delivery System
- Real-time Analytics
- Batch Processing

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Authentication**: Passport.js, JWT
- **Frontend**: React (Separate Repository)

## Setup Instructions

1. **Clone the Repository**
```bash
git clone <repository-url>
cd XenoCrm/backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**
Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=your_mongodb_uri
MONGO_DB_NAME=XenoCrm
RABBITMQ_URI=your_rabbitmq_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url/auth/google/callback
FRONTEND_URL=https://your-frontend-url
NODE_ENV=development
```

4. **Start Services**
```bash
# Start main server
npm run dev

# Start ingestion services (in separate terminals)
npm run customerIngestion
npm run orderIngestion
npm run deliveryIngestion
```

## Environment Configuration

Configuration is managed through `config/index.js`:
- Database connection settings
- RabbitMQ configuration
- Google OAuth credentials
- JWT settings
- CORS configuration

## Architecture

### Core Components

1. **Authentication Service**
   - Google OAuth integration
   - JWT token management
   - Session handling

2. **Data Ingestion System**
   - Customer data processing
   - Order data processing
   - RabbitMQ queues

3. **Campaign Management**
   - Campaign creation
   - Audience segmentation
   - Message delivery

### Database Schema

1. **User Model**
```javascript
{
  googleId: String,
  name: String,
  email: String,
  createdAt: Date,
  lastLogin: Date
}
```

2. **Customer Model**
```javascript
{
  name: String,
  email: String,
  total_spend: Number,
  visits_count: Number,
  last_active_at: Date
}
```

3. **Campaign Model**
```javascript
{
  segment_id: ObjectId,
  name: String,
  message_template: String,
  status: Enum['pending', 'running', 'completed']
}
```

## API Documentation

### Authentication Routes

```javascript
GET    /auth/google              // Initiate Google OAuth
GET    /auth/google/callback     // OAuth callback
GET    /auth/me                  // Get current user
POST   /auth/logout             // Logout user
```

### Campaign Routes (Protected)

```javascript
POST   /api/campaigns/create     // Create campaign
GET    /api/campaigns/history    // Get all campaigns
GET    /api/campaigns/:id        // Get campaign by ID
PUT    /api/campaigns/:id        // Update campaign
```

### Data Ingestion Routes

```javascript
POST   /api/ingest/customers     // Ingest customer data
POST   /api/ingest/orders        // Ingest order data
```

## Services

### Message Queue Services

1. **Customer Ingestion Service**
- Processes customer data
- Prevents duplicates
- Updates metrics

2. **Order Ingestion Service**
- Processes order data
- Updates customer statistics

3. **Delivery Ingestion Service**
- Processes message delivery status
- Batch updates communication logs

## Error Handling

Standard error response format:
```javascript
{
  success: boolean,
  message: string,
  error?: string,
  data?: any
}
```

## Development Guidelines

1. **Code Structure**
- Follow MVC pattern
- Use ES6+ features
- Implement proper error handling

2. **API Response Format**
```javascript
{
  success: true,
  data: {},
  message: "Operation successful"
}
```

3. **Security Measures**
- CORS configuration
- Protected routes
- Input validation
- Rate limiting

## Testing

```bash
# Run tests
npm test

# Run specific test suite
npm test -- --grep "Campaign"
```

## Deployment

1. **Prerequisites**
- Node.js 14+
- MongoDB 4.4+
- RabbitMQ 3.8+

2. **Production Setup**
```bash
npm install --production
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE.md