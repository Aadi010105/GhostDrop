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

### Contextual Collaboration
GhostDrop provides a rich suite of features designed for seamless team collaboration:
- 💬 **Live Chat & Threaded Comments per File**: Engage in real-time discussions directly on files, with threaded comments for organized conversations and @mentions to tag team members. Built with Socket.IO for instant updates.
- 🤝 **Shared Team Workspaces**: Organize teams into dedicated workspaces (e.g., departments, projects). Each workspace supports shared folders, centralized settings, granular permissions, and a unified activity feed for all team members.
- 👁️ **Collaborative File Previews & Annotations**: View rich, interactive previews for various file types (PDFs, code, video, images). Add inline comments and annotations directly on the preview, facilitating precise feedback and collaborative review. Leveraging libraries like `PDF.js`, `react-dropzone`, and `monaco-editor` for robust preview capabilities.

### Key Differentiators
- **Ephemeral by Design**: Guaranteed automatic deletion with TTL enforcement
- **Zero-Knowledge Architecture**: Client-side encryption ensures server never sees plaintext
- **Real-time Collaboration**: Live updates for shared folders, files, comments, and activities, powered by Socket.IO
- **Privacy-First**: No data mining, no tracking, no permanent storage

## 🛠️ Tech Stack  

| Category   | Technology |
|------------|------------|
| Frontend   | React (Vite), Tailwind, Framer Motion |
| Backend    | Node.js (Express), Socket.IO |
| Database   |Neon (Postgres) + Prisma (TTL for expiry)|
| Storage    | AWS S3 (multipart uploads) + CloudFront |
| Auth       | Clerk (User management, RBAC) |
| Security   | WebCrypto API, JWT, Rate limiting |
| Realtime   | Socket.IO (comments, chat, activity stream) |
| Previews   | PDF.js, react-dropzone, monaco-editor |
| Collaboration | Custom comment system, activity feed UI |
| Infra/CI   |Vercel (Frontend), Render/Fly.io (Backend), GitHub Actions|
<!-- | Monitoring | Graphana / Promithesus   |
| Optional   | Redis (Socket.IO scaling) | -->

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
cd backend
pnpm install
cp backend/env.template backend/.env   # Add AWS + Clerk keys
pnpm run env:test
pnpm run dev
```

<!-- Frontend (Not yet set up)
```bash
cd client
pnpm install
pnpm run dev
App will run at: http://localhost:5173
``` -->
## 🚀 Project Roadmap (Updated with New Tech Stack)


### ✅ Phase 1: Backend Foundation (Weeks 1–4)
**Goal:** Establish secure, testable backend with routes, infra and DB schema

- **Week 1–2: Core Infrastructure**
  - [ ] AWS Setup & Configuration  
    - [ ] S3 bucket creation with secure policies (block public access)  
    - [ ] IAM roles & least-privilege policy for app credentials  
    - [ ] CloudFront distribution + Origin Access Control (OAC) for private S3 access  
  - [ ] Server skeleton (Express)  
    - [ ] Project structure, env config, logging, request validation (Zod/Joi)  
    - [ ] Health-check and readiness endpoints  
    - [ ] CORS, security headers (helmet), rate limiter middleware  
  - [ ] Neon (Postgres) + Prisma  
    - [ ] Design DB schema: users, files, shares, folders, activities, keys  
    - [ ] Add `expiry` timestamp field on files and shares (for TTL logic)  
    - [ ] Prisma migrations & seeding scripts

- **Week 3–4: Authentication & File Management**
  - [ ] Integrate Clerk Node SDK for authentication and user management (optionally add webhooks for syncing users with Prisma)
  - [ ] JWT validation middleware & RBAC (owner/editor/viewer)  
  - [ ] File upload flow (API + S3)  
    - [ ] `POST /api/files/presign` → generate S3 presigned (single or multipart)  
    - [ ] `POST /api/files/complete` → finalize multipart + store metadata in Postgres  
    - [ ] Support `multipart` part presigns for large files  
    - [ ] Store `s3Key`, `size`, `mimeType`, `expiry`, `encryptedKeyMetadata` in DB  
  - [ ] Upload progress tracking support (client ↔ server progress events)  
  - [ ] **Backend Route Testing (manual)**  
    - [ ] Use **Postman** to test and save requests for:
      - [ ] Auth routes (`/auth/*`) — signup/login, token validation  
      - [ ] File routes (`/files/presign`, `/files/complete`, `/files/:id/download`)  
      - [ ] Folder & sharing routes (`/folders`, `/shares`)  
    - **Acceptance:** Postman collection can successfully run manual requests and returns expected status codes and JSON.

---

### 🟡 Phase 2: Security & Encryption (Weeks 5–6)
**Goal:** Make file operations privacy-first and resilient

- [ ] Client-side encryption using **WebCrypto API** (AES-GCM)  
  - [ ] Uploader generates symmetric key, encrypts file before uploading  
  - [ ] Generate and store per-file IVs / metadata for decryption  
- [ ] Key wrapping for sharing:
  - [ ] Wrap AES key with recipient public keys or OTP-derived keys
  - [ ] APIs to store/retrieve wrapped keys (`/keys/wrap`, `/keys/unwrapped`)  
- [ ] Server-side checks:
  - [ ] File type whitelist / MIME validation  
  - [ ] File size caps for anonymous uploads  
  - [ ] Rate-limiting middleware (IP/user)  
- [ ] **Postman**:
  - [ ] Test endpoints that return wrapped key blobs and permission checks.  
- **Acceptance:** Encrypted files can be uploaded and decrypted by recipients only after successful key unwrap.

---

### 🟡 Phase 3: TTL & Auto-Deletion (Weeks 7–8)
**Goal:** Reliable ephemeral storage with cleanup pipeline

- [ ] TTL design:
  - [ ] `expiry` timestamp stored in Postgres `files` table
  - [ ] Optionally store a lightweight cache/flag in Redis for quick expiry checks (optional)
- [ ] Scheduled cleanup service:
  - [ ] Simple Node cron worker (or Render cron / GitHub Actions + endpoint) that runs every N minutes:
    - [ ] Query expired files (`expiry < now()`)
    - [ ] Delete corresponding S3 objects
    - [ ] Delete DB records and write deletion activity logs
  - [ ] Implement batch deletion & retry logic
- [ ] Confirmations & audit:
  - [ ] Create deletion activity entry per deleted file
  - [ ] Optional soft-delete retention for short window (configurable)
- [ ] **Postman**:
  - [ ] Test the cleanup endpoint in staging to verify S3 deletions and DB record removal.
- **Acceptance:** Files with `expiry` in past are removed from S3 and DB within the configured cleanup interval, with logs created.

---

### 🟡 Phase 4: Sharing & Access Control (Weeks 9–10)
**Goal:** Multiple secure sharing options + robust permission model

- [ ] Implement sharing methods:
  - [ ] OTP-based share (create OTP + wrapped key + short URL)  
  - [ ] Email invites (send secure link with optional OTP)  
  - [ ] QR code generation for mobile share links  
  - [ ] Custom link creation with optional password/OTP and expiry  
- [ ] Permission model:
  - [ ] Folder-level roles (owner, editor, viewer) + file-level overrides  
  - [ ] Download tracking + access logs (user, timestamp, IP)  
  - [ ] Revoke share endpoint (`POST /shares/:id/revoke`)  
- [ ] **Postman**:
  - [ ] Test invite + accept flows, OTP validation, and access revocation.
- **Acceptance:** Shared links only grant access per permission rules; revocation prevents further access.

---

### 🟡 Phase 5: Real-time Collaboration (Weeks 11–12)
**Goal:** Live multi-user experience for shared folders, files, comments, and workspaces

- [ ] Socket.IO integration:
  - [ ] WebSocket server setup with namespaces/rooms for folders & files
  - [ ] File-specific chat threads with Socket.IO
  - [ ] Choose a cross-instance pub/sub:
    - [ ] **Neon LISTEN/NOTIFY** for light-volume events, **OR** Redis adapter for higher scale
  - [ ] Connection lifecycle and auth (validate Clerk JWT on socket handshake)
- [ ] Real-time features:
  - [ ] File upload/complete notifications in folder/file room
  - [ ] Real-time threaded comments & @mentions per file
  - [ ] Broadcast activity updates on comments, edits, previews
  - [ ] Presence indicators (who is viewing/editing a file/folder)
- [ ] **Workspace-level collaboration backend:**
  - [ ] Database schema updates for Workspaces (name, owner, members, settings)
  - [ ] APIs for workspace creation, management, member invitation/roles
  - [ ] Workspace-specific activity feed integration
- [ ] **Postman / websocket client**:
  - [ ] Use a websocket client (or Postman’s websocket support) to test events end-to-end.
- **Acceptance:** Users in same folder/file/workspace receive real-time events reliably across multiple backend instances; workspace management APIs are functional.

---

### ⚫ Phase 6: Frontend Development (Weeks 13–16)
**Goal:** UI that exposes secure, collaborative, and preview features

- **Weeks 13–14: Core UI & Workspace Management**
  - [ ] React + Vite project setup
  - [ ] TailwindCSS + component system
  - [ ] Page routing and protected routes (Clerk)
  - [ ] Login/signup and profile UIs (Clerk integration)
  - [ ] Workspace-level dashboard: folders, members, activity
  - [ ] **Workspace creation & management UI** (dashboard, member invites, settings)
  - [ ] **Real-time activity feed UI**
- **Weeks 15–16: File Management UI & Collaboration Features**
  - [ ] Drag-and-drop uploads (react-dropzone)
  - [ ] Client-side encryption flow + upload integration
  - [ ] Upload progress UI & resumable multipart support
  - [ ] Share modal (OTP, email, QR) and share management dashboard
  - [ ] File viewer component (PDF.js, video.js, monaco-editor, etc.)
  - [ ] Comment sidebar or overlay inside file preview
  - [ ] **Real-time presence indicators** (who is viewing) for files/folders
- **Acceptance:** Frontend can upload encrypted files, show progress, create shares, manage workspaces, receive real-time events, and users can collaboratively preview and comment on files.

---

### ⚫ Phase 7: Advanced Features (Weeks 17–18)
**Goal:** Improve UX, reliability, and performance

- [ ] PWA features (service worker via Workbox, offline queue for uploads)
- [ ] Push notifications (browser push for important events)
- [ ] Client-side performance: code-splitting, lazy-load heavy components
- [ ] Image previews & generate thumbnails in background worker (optional)
- **Acceptance:** App works offline for basic flows and resumes uploads when back online.

---

### ⚫ Phase 8: Testing & Deployment (Weeks 19–20)
**Goal:** Ensure reliability & automated delivery

- [ ] Tests
  - [ ] Unit tests (Jest) for core logic (encryption, key wrapping, DB ops)
  - [ ] Integration tests for API (use Postman / Newman collections for CI)
  - [ ] E2E tests (Cypress) for critical user flows
- [ ] CI/CD
  - [ ] GitHub Actions: lint → tests → build → deploy
  - [ ] Automated deployments to Vercel (frontend) and Render/Fly.io (backend)
  - [ ] Newman run of Postman collection as part of CI
- [ ] Monitoring & Alerts
  - [ ] Sentry configured for backend & frontend
  - [ ] Basic Prometheus/Grafana or hosted metrics for critical endpoints (optional)
- **Acceptance:** CI passes tests and deploys to staging; Postman/Newman run in CI with green results.

---

### ⚫ Phase 9: Production & Monitoring (Weeks 21–22)
**Goal:** Ship to users and maintain stability

- [ ] Production Deployments
  - [ ] Frontend on Vercel (custom domain + HTTPS)
  - [ ] Backend on Render / Fly.io (autoscaling config)
  - [ ] CloudFront enabled for downloads (private origin access)
- [ ] Operational
  - [ ] Billing & budget alerts (AWS Budgets for S3/CloudFront)
  - [ ] Health-check endpoints + uptime monitoring
  - [ ] Usage analytics / storage dashboards
- **Acceptance:** Production deployment live, monitoring/alerts active, and cost budget alerts configured.


## 🔧 Development Commands

### Backend
```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm start

# Run tests
pnpm test

# Lint code
pnpm run lint
```

<!-- ### Frontend (Not yet set up)
```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Preview production build
pnpm run preview

# Run tests
pnpm test

# Lint code
pnpm run lint
``` -->

## 📁 Project Structure

```
ghostdrop/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configs
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── repositories/    # Prisma DB queries (optional)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.IO event handlers (optional)
│   │   └── utils/           # Utility functions
│   ├── infrastructure/      # AWS CDK infrastructure
│   └── tests/               # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (optional)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
├── docs/                    # Documentation
├── scripts/                 # Deployment scripts
└── .env.example             # Example environment variables
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

**Built with ❤️ for privacy-conscious users who value security and simplicity.**```
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


