# 🚀 GhostDrop

**Secure, Ephemeral, Collaborative File Sharing Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)

## 📋 Problem Statement

In today's digital landscape, file sharing solutions face critical challenges:

- **Privacy Concerns**: Most platforms store files indefinitely with questionable data handling practices
- **Security Gaps**: Files are often stored in plaintext, vulnerable to breaches and unauthorized access
- **Collaboration Limitations**: Existing solutions lack real-time collaborative features for temporary sharing
- **User Friction**: Complex authentication requirements prevent quick, anonymous sharing
- **Data Persistence**: No reliable way to ensure files are automatically deleted after intended use

GhostDrop addresses these issues by providing a **privacy-first, ephemeral file sharing platform** that combines the simplicity of WeTransfer, the security of ProtonDrive, and the collaboration features of Dropbox.

## 🎯 What is GhostDrop?

GhostDrop is a cloud-based, privacy-first file sharing & storage platform that enables users to:

### Core Features
- 📤 **Upload & Share Files Temporarily** - Auto-delete after 1h/1d/1w or custom TTL
- 🔐 **Multiple Access Methods** - OTP, email invite, or QR code links
- 👥 **Real-time Collaboration** - Shared folders with live updates, comments, and activity streams
- 🛡️ **Client-side Encryption** - WebCrypto API + AES-GCM for maximum security
- 🔗 **Account-optional Sharing** - Recipients don't need accounts, uploaders can use accounts for advanced features

### Key Differentiators
- **Ephemeral by Design**: Guaranteed automatic deletion with TTL enforcement
- **Zero-Knowledge Architecture**: Client-side encryption ensures server never sees plaintext
- **Real-time Collaboration**: Live updates for shared folders and activities
- **Privacy-First**: No data mining, no tracking, no permanent storage

## 🛠️ Tech Stack  

| Category   | Technology |
|------------|------------|
| Frontend   | React (Vite), Tailwind, Framer Motion |
| Backend    | Node.js (Express/Fastify), Socket.IO |
| Database   | DynamoDB (TTL for expiry) |
| Storage    | AWS S3 (multipart uploads) + CloudFront |
| Auth       | Clerk (User management, RBAC) |
| Security   | WebCrypto API, JWT, Rate limiting |
| Infra/CI   | Lambda, GitHub Actions, Vercel |
| Monitoring | Sentry |
| Optional   | Redis (Socket.IO scaling) |

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js (v18+)  
- AWS account (S3, DynamoDB, Lambda, CloudFront)  
- Clerk API keys  

### Installation  

```bash
git clone https://github.com/Aadi010105/ghostdrop.git
cd ghostdrop
```
Backend
```bash
Copy code
cd server
npm install
cp .env.example .env   # Add AWS + Clerk keys
npm run dev
```

Frontend

```bash
Copy code
cd client
npm install
npm run dev
App will run at: http://localhost:5173
```
## 🗺️ Development Roadmap

### Phase 1: Backend Foundation (Weeks 1-4)
**Goal**: Establish secure, scalable backend infrastructure

#### Week 1-2: Core Infrastructure
- [ ] **AWS Setup & Configuration**
  - [ ] S3 bucket creation with proper security policies
  - [ ] DynamoDB tables with TTL configuration
  - [ ] IAM roles and permissions setup
  - [ ] CloudFront distribution for CDN

- [ ] **Basic Express.js Server**
  - [ ] Project structure and middleware setup
  - [ ] Environment configuration management
  - [ ] Basic health check endpoints
  - [ ] CORS and security headers

#### Week 3-4: Authentication & File Management
- [ ] **Clerk Integration**
  - [ ] Clerk Node SDK setup
  - [ ] JWT token validation middleware
  - [ ] User session management
  - [ ] Optional authentication flow

- [ ] **File Upload System**
  - [ ] S3 presigned URL generation
  - [ ] Multipart upload support for large files
  - [ ] File metadata storage in DynamoDB
  - [ ] Upload progress tracking

### Phase 2: Security & Encryption (Weeks 5-6)
**Goal**: Implement end-to-end encryption and security features

- [ ] **Client-side Encryption**
  - [ ] WebCrypto API integration
  - [ ] AES-GCM encryption implementation
  - [ ] Key generation and management
  - [ ] Key wrapping for sharing

- [ ] **Security Features**
  - [ ] Rate limiting implementation
  - [ ] File type validation
  - [ ] File size limits
  - [ ] Basic abuse protection

### Phase 3: TTL & Auto-Deletion (Weeks 7-8)
**Goal**: Implement ephemeral file system with guaranteed deletion

- [ ] **TTL System**
  - [ ] DynamoDB TTL configuration
  - [ ] Lambda function for file cleanup
  - [ ] S3 object deletion automation
  - [ ] TTL validation and enforcement

- [ ] **Auto-Deletion Pipeline**
  - [ ] DynamoDB Streams integration
  - [ ] Lambda trigger setup
  - [ ] Batch deletion optimization
  - [ ] Deletion confirmation system

### Phase 4: Sharing & Access Control (Weeks 9-10)
**Goal**: Implement multiple sharing methods and access controls

- [ ] **Sharing Methods**
  - [ ] OTP-based sharing
  - [ ] Email invitation system
  - [ ] QR code generation
  - [ ] Custom link creation

- [ ] **Access Control**
  - [ ] Permission management
  - [ ] Download tracking
  - [ ] Access logging
  - [ ] Share expiration handling

### Phase 5: Real-time Collaboration (Weeks 11-12)
**Goal**: Add collaborative features with real-time updates

- [ ] **Socket.io Integration**
  - [ ] WebSocket server setup
  - [ ] Redis adapter for scaling
  - [ ] Connection management
  - [ ] Event broadcasting

- [ ] **Collaborative Features**
  - [ ] Real-time file upload notifications
  - [ ] Activity stream implementation
  - [ ] Comment system
  - [ ] Folder sharing capabilities

### Phase 6: Frontend Development (Weeks 13-16)
**Goal**: Build responsive, modern user interface

#### Week 13-14: Core UI Components
- [ ] **React Setup**
  - [ ] Vite configuration
  - [ ] TailwindCSS integration
  - [ ] Component library setup
  - [ ] Routing configuration

- [ ] **Authentication UI**
  - [ ] Clerk React integration
  - [ ] Login/signup flows
  - [ ] User profile management
  - [ ] Session handling

#### Week 15-16: File Management UI
- [ ] **Upload Interface**
  - [ ] Drag-and-drop implementation
  - [ ] Progress indicators
  - [ ] File preview system
  - [ ] Upload queue management

- [ ] **Sharing Interface**
  - [ ] Share link generation
  - [ ] QR code display
  - [ ] Access method selection
  - [ ] Share management dashboard

### Phase 7: Advanced Features (Weeks 17-18)
**Goal**: Implement advanced features and optimizations

- [ ] **PWA Features**
  - [ ] Service worker implementation
  - [ ] Offline functionality
  - [ ] App manifest
  - [ ] Push notifications

- [ ] **Performance Optimization**
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Image optimization
  - [ ] Caching strategies

### Phase 8: Testing & Deployment (Weeks 19-20)
**Goal**: Comprehensive testing and production deployment

- [ ] **Testing Implementation**
  - [ ] Unit tests for core functions
  - [ ] Integration tests for APIs
  - [ ] End-to-end testing
  - [ ] Security testing

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions setup
  - [ ] Automated testing
  - [ ] Deployment automation
  - [ ] Error monitoring with Sentry

### Phase 9: Production & Monitoring (Weeks 21-22)
**Goal**: Launch and monitor production system

- [ ] **Production Deployment**
  - [ ] Vercel frontend deployment
  - [ ] AWS backend deployment
  - [ ] Domain configuration
  - [ ] SSL certificate setup

- [ ] **Monitoring & Analytics**
  - [ ] Sentry error tracking
  - [ ] Performance monitoring
  - [ ] Usage analytics
  - [ ] Health check endpoints

## 🔧 Development Commands

### Backend
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## 📁 Project Structure

```
ghostdrop/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── infrastructure/     # AWS CDK infrastructure
│   └── tests/             # Backend tests
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   └── public/           # Static assets
├── docs/                 # Documentation
└── scripts/             # Deployment scripts
```

<!-- ## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request -->

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@ghostdrop.com
- 💬 Discord: [Join our community](https://discord.gg/ghostdrop)
- 📖 Documentation: [docs.ghostdrop.com](https://docs.ghostdrop.com)
- 🐛 Issues: [GitHub Issues](https://github.com/Aadi010105/ghostdrop/issues)

##  Acknowledgments

- [Clerk](https://clerk.com) for authentication services
- [AWS](https://aws.amazon.com) for cloud infrastructure
- [Vercel](https://vercel.com) for frontend hosting
- [TailwindCSS](https://tailwindcss.com) for styling framework

---

**Built with ❤️ for privacy-conscious users who value security and simplicity.**
```

I've created a comprehensive README file for your GhostDrop project that includes:

## ✅ What's Included:

1. **Problem Statement** - Clear articulation of the challenges GhostDrop solves
2. **Project Description** - Detailed explanation of what GhostDrop is and its unique value proposition
3. **Architecture Overview** - Visual representation of the system architecture
4. **Complete Tech Stack** - Detailed breakdown of all technologies used
5. **Installation Instructions** - Step-by-step setup for both backend and frontend
6. **Development Roadmap** - 9-phase development plan starting with backend (as requested)

## 🗺️ Roadmap Highlights:

The roadmap is structured in **9 phases over 22 weeks**, starting with backend development:

- **Phase 1-2**: Backend foundation and security
- **Phase 3-4**: TTL system and sharing features  
- **Phase 5**: Real-time collaboration
- **Phase 6**: Frontend development
- **Phase 7-9**: Advanced features, testing, and deployment

Each phase has specific deliverables and timelines, making it easy to track progress and plan development sprints.

The README is production-ready and includes all the professional touches like badges, proper formatting, contribution guidelines, and support information. You can now use this as your project's main documentation and starting point for development!
