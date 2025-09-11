# 🔧 Environment Setup Guide for GhostDrop

## 📋 **Step 1: Create Your .env File**

1. **Copy the template:**
   ```bash
   cp env.template .env
   ```

2. **Edit the .env file** with your actual values:

## 🔑 **Step 2: Fill in Your AWS Credentials**

Replace these values with your actual AWS setup:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIA... # From IAM user creation
AWS_SECRET_ACCESS_KEY=... # From IAM user creation
AWS_REGION=us-east-1
AWS_S3_BUCKET=ghostdrop-files-your-unique-suffix
AWS_CLOUDFRONT_DOMAIN=https://d1234567890.cloudfront.net
```

## 🗄️ **Step 3: Database Configuration (Phase 1)**

When you set up Neon Postgres:

```bash
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/ghostdrop?sslmode=require
```

## 🔐 **Step 4: Authentication (Phase 1)**

When you set up Clerk:

```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 🛡️ **Step 5: Security Keys**

Generate secure random strings for:

```bash
JWT_SECRET=your-32-character-random-string
ENCRYPTION_KEY=your-32-character-random-string
```

**Generate random strings:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

## ⚙️ **Step 6: Customize Settings**

Adjust these based on your needs:

```bash
# File upload limits
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=image/*,application/pdf,text/*,application/zip

# TTL settings (in seconds)
DEFAULT_TTL=3600    # 1 hour
MAX_TTL=604800      # 1 week

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests per window
```

## 🚨 **Security Checklist**

- [ ] `.env` file is in `.gitignore`
- [ ] Never commit `.env` to version control
- [ ] Use different values for development/staging/production
- [ ] Rotate keys regularly
- [ ] Use least-privilege IAM policies

## 🧪 **Step 7: Test Your Configuration**

Create a simple test script to verify your environment:

```javascript
// test-env.js
require('dotenv').config();

console.log('🔍 Environment Check:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Check if required vars are set
const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
} else {
    console.log('✅ All required environment variables are set!');
}
```

Run the test:
```bash
node test-env.js
```

## 📝 **Notes**

- Keep your `.env` file secure and never share it
- Use different environment files for different stages (`.env.development`, `.env.production`)
- Consider using AWS Secrets Manager for production deployments
- The template includes all variables you'll need throughout the project phases
