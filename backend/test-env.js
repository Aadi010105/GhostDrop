#!/usr/bin/env node

/**
 * GhostDrop AWS Environment Configuration Test
 * Run this script with:
 *   node test.env.js
 */

require('dotenv').config();

console.log('🔍 GhostDrop AWS Environment Check');
console.log('================================\n');

// Color codes
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function logStatus(key, value, required = false) {
    const isSet = value && !value.includes('your_') && value !== 'Not set';
    const status = isSet ? '✅' : (required ? '❌' : '⚠️');
    const color = isSet ? colors.green : (required ? colors.red : colors.yellow);
    const req = required ? ' (REQUIRED)' : ' (optional)';

    console.log(`${color}${status}${colors.reset} ${key}${req}: ${value || 'Not set'}`);
}

// ====================
// AWS Configuration
// ====================
console.log(`${colors.blue}🌐 AWS Configuration${colors.reset}`);
logStatus('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID, true);
logStatus('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY, true);
logStatus('AWS_REGION', process.env.AWS_REGION || 'ap-south-1', true);
logStatus('AWS_S3_BUCKET', process.env.AWS_S3_BUCKET, true);
logStatus('AWS_CLOUDFRONT_DOMAIN', process.env.AWS_CLOUDFRONT_DOMAIN, true);

if (process.env.AWS_CLOUDFRONT_DOMAIN && !process.env.AWS_CLOUDFRONT_DOMAIN.includes('cloudfront.net')) {
    console.log(`${colors.yellow}⚠️ Warning: AWS_CLOUDFRONT_DOMAIN does not look like a CloudFront domain${colors.reset}`);
}
console.log('');

// ====================
// Summary
// ====================
console.log('================================');
const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'AWS_CLOUDFRONT_DOMAIN'
];

const missing = requiredVars.filter(key => {
    const value = process.env[key];
    return !value || value.includes('your_');
});

if (missing.length === 0) {
    console.log(`${colors.green}🎉 All required AWS environment variables are properly configured!${colors.reset}`);
    console.log(`${colors.yellow}💡 Next step: Try uploading a test file to your S3 bucket and fetch it via CloudFront.${colors.reset}`);
} else {
    console.log(`${colors.red}❌ Missing or incomplete required variables:${colors.reset}`);
    missing.forEach(key => console.log(`${colors.red}   - ${key}${colors.reset}`));
    console.log(`\n${colors.yellow}📖 Please check your backend/.env and fill in missing values.${colors.reset}`);
}

console.log('\n🔧 To generate secure random keys (for JWT, ENCRYPTION, etc. later), run:');
console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
