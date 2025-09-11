# 🚀 GhostDrop Backend

**Secure, Ephemeral, Collaborative File Sharing Platform - Backend API**

## 📋 Quick Start

### Prerequisites
- Node.js (v18+)
- AWS Account with S3 and CloudFront setup
- Environment variables configured

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp env.template .env
   # Edit .env with your actual values
   ```

3. **Test environment configuration:**
   ```bash
   pnpm run env:test
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # API controllers
│   ├── middleware/      # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── env.template        # Environment variables template
├── setup-env.md        # Environment setup guide
├── test-env.js         # Environment validation script
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run env:test` - Validate environment configuration

## 🌐 API Endpoints

### Health & Status
- `GET /health` - Health check endpoint
- `GET /api/status` - API status and version

### File Management (Coming Soon)
- `POST /api/files/presign` - Generate S3 presigned URLs
- `POST /api/files/complete` - Complete multipart upload
- `GET /api/files/:id/download` - Download file

### Authentication (Coming Soon)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

## 🔐 Environment Variables

See `setup-env.md` for detailed environment configuration instructions.

Required variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DOMAIN`

## 🚀 Development Roadmap

This backend follows the GhostDrop development roadmap:

- **Phase 1**: Backend foundation and AWS setup ✅
- **Phase 2**: Security and encryption
- **Phase 3**: TTL and auto-deletion
- **Phase 4**: Sharing and access control
- **Phase 5**: Real-time collaboration
- **Phase 6**: Frontend integration
- **Phase 7**: Advanced features
- **Phase 8**: Testing and deployment
- **Phase 9**: Production and monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Test environment configuration
npm run env:test
```

## 📝 Logging

The server uses Winston for structured logging. Logs are written to:
- Console (development)
- Files (production)

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation (Joi)
- Environment variable validation

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Run linting before committing

## 📄 License

MIT License - see main project README for details.
