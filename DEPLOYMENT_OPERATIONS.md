# Deployment & Operations Guide

Complete guide for deploying and managing the volunteer registration system in production.

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All dependencies installed: `npm install`
- [ ] `.env` file configured with all required values
- [ ] `backend/config/googleAuth.json` exists
- [ ] Google Sheet created and shared with service account
- [ ] Gmail 2FA enabled and App Password generated
- [ ] Local testing completed (see Testing section below)
- [ ] NODE_ENV set to 'production' (if applicable)

### Configuration Verification

```bash
# Check node version (requires v14+)
node --version  # Should be 14.0.0 or higher

# Check npm version (requires v6+)
npm --version   # Should be 6.0.0 or higher

# Verify required packages installed
npm list pdfkit nodemailer googleapis

# Check .env file
cat backend/.env  # Verify all values are set
```

### Environment Variables Checklist

```env
✅ PORT=5000 (or your desired port)
✅ NODE_ENV=production (or development)
✅ SPREADSHEET_ID=<actual-sheet-id>
✅ EMAIL_USER=<actual-gmail>
✅ EMAIL_PASSWORD=<actual-app-password>
✅ NGO_NAME=<your-organization-name>
✅ AUTOMATION_INTERVAL=10000 (10 seconds)
```

### Google Sheets Verification

1. **Headers in Row 1**:
   ```
   Name | Phone | Email | Position | Experience | Availability | Status | Certificate ID | Timestamp
   ```

2. **Permissions Check**:
   - [ ] Service account email has Editor access
   - [ ] Spreadsheet is accessible from backend
   - [ ] No permission errors in logs

### Google Credentials Verification

```bash
# Check file exists and is valid JSON
file backend/config/googleAuth.json
json-lint backend/config/googleAuth.json  # If json-lint available

# Verify it contains required fields
grep "client_email\|private_key" backend/config/googleAuth.json
```

### Email Service Verification

```bash
# Test SMTP connection (optional)
# Try sending a test email manually

# Check credentials format
# App Password should be: XXXX XXXX XXXX XXXX (16 chars with spaces)
```

---

## 🖥️ Production Deployment Options

### Option 1: Deploy to Heroku

#### Prerequisites
- Heroku account (free tier works)
- Heroku CLI installed

#### Steps

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-volunteer-app

# Set environment variables
heroku config:set SPREADSHEET_ID="your-id"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your-app-password"
heroku config:set NGO_NAME="Your NGO"

# Add Google credentials
# Option A: Use config var
heroku config:set GOOGLE_CREDENTIALS="$(cat backend/config/googleAuth.json)"

# Option B: Store JSON as file
# Create Procfile in backend/
cat > Procfile << EOF
web: node server.js
EOF

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### Procfile for Heroku
```
web: node backend/server.js
```

### Option 2: Deploy to AWS Lambda

#### Requirements
- AWS account
- AWS CLI configured
- Serverless Framework (optional but recommended)

```bash
# Install Serverless
npm install -g serverless

# Create serverless project
serverless create --template aws-nodejs

# Deploy
serverless deploy
```

### Option 3: Deploy to DigitalOcean

#### Requirements
- DigitalOcean account
- Droplet (Ubuntu 20.04)
- SSH access

#### Setup Steps

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Clone/upload your code
cd /opt
git clone your-repo.git volunteer-system
cd volunteer-system/backend

# Install dependencies
npm install

# Set environment variables
nano .env  # Edit with your values

# Start with PM2
pm2 start server.js --name "volunteer-api"

# Set to start on reboot
pm2 startup
pm2 save

# Set up reverse proxy (Nginx)
apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/default
```

#### Nginx Configuration
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Build and Run
```bash
# Build image
docker build -t volunteer-registration .

# Run container
docker run -d \
  -p 5000:5000 \
  -e SPREADSHEET_ID="your-id" \
  -e EMAIL_USER="your-email" \
  -e EMAIL_PASSWORD="your-password" \
  -e NGO_NAME="Your NGO" \
  -v $(pwd)/backend/config/googleAuth.json:/app/config/googleAuth.json \
  --name volunteer-api \
  volunteer-registration
```

---

## 🔒 Security Hardening

### 1. HTTPS/SSL Setup

```bash
# Using Let's Encrypt with Certbot (Nginx)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### 2. Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Sanitization

Install express-validator:
```bash
npm install express-validator
```

### 4. Security Headers

Install helmet:
```bash
npm install helmet
```

Add to server.js:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 5. CORS Configuration

Update for production:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: 'https://yourdomain.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 📊 Monitoring & Logging

### Setup Logging

Install winston:
```bash
npm install winston
```

Example logger:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log registrations
logger.info(`Volunteer registered: ${data.name}`);
```

### Monitor System Health

```bash
# Check CPU and memory
top

# Check disc space
df -h

# Check running processes
ps aux | grep node

# View application logs
pm2 logs
```

### Set Up Alerts

Use services like:
- Sentry (error tracking)
- LogRocket (session logging)
- New Relic (performance)
- Datadog (monitoring)

---

## 🔄 Backup & Recovery

### Google Sheets Backup

```bash
# Manual download
# 1. Open Google Sheets
# 2. File → Download → CSV

# Automated backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y-%m-%d)
# Use Google Sheets API to export
# curl -H "Authorization: Bearer $TOKEN" \
#   https://www.googleapis.com/drive/v3/files/FILE_ID/export \
#   -o volunteer_registrations_$DATE.csv
EOF

# Add to crontab (runs daily)
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Certificate Backups

```bash
# Backup certificates directory
tar -czf certificates_backup_$(date +%Y%m%d).tar.gz backend/certificates/

# Backup .env (encrypted)
gpg -c backend/.env
```

### Database Snapshots

```bash
# For DigitalOcean
doctl compute droplet-action snapshot DROPLET_ID

# Backup Google Sheets
gcloud sheets export SPREADSHEET_ID
```

---

## 📈 Performance Optimization

### 1. Database Query Optimization

```javascript
// Cache sheet data
let cachedRows = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1 minute

async function getAllRowsCached(spreadsheetId) {
  const now = Date.now();
  if (cachedRows && (now - cacheTime) < CACHE_DURATION) {
    return cachedRows;
  }
  
  cachedRows = await googleSheets.getAllRows(spreadsheetId);
  cacheTime = now;
  return cachedRows;
}
```

### 2. Connection Pooling

```javascript
// Reuse transporter connection
// Already done in emailService.js (creates once)
```

### 3. Async Processing

```javascript
// Don't wait for non-critical operations
emailService.sendRegistrationConfirmation(email, name).catch(err => {
  console.warn('Confirmation email failed (non-critical):', err);
});
```

### 4. CDN for Frontend

```html
<!-- Use CDN for Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

---

## 🚨 Troubleshooting Production Issues

### Server Won't Start

```bash
# Check port is available
lsof -i :5000

# Check for syntax errors
node -c server.js

# Run with verbose logging
NODE_DEBUG=* npm start
```

### Automation Not Running

```bash
# Check if process is running
ps aux | grep node

# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs volunteer-api
```

### Email Not Sending

```bash
# Test Gmail credentials
telnet smtp.gmail.com 587

# Check email service logs
grep "email" /path/to/logs

# Verify App Password format
echo $EMAIL_PASSWORD  # Should have spaces
```

### Google Sheets Connection Failed

```bash
# Check authentication
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  https://www.googleapis.com/sheets/v4/spreadsheets/$SPREADSHEET_ID

# Verify credentials file
cat backend/config/googleAuth.json
```

---

## 📋 Post-Deployment Tests

### Test 1: Server Health
```bash
curl http://localhost:5000/api/health
```

### Test 2: Registration Submission
```bash
curl -X POST http://localhost:5000/api/register-volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+1-555-1234567",
    "email": "test@example.com",
    "position": "Tester",
    "experience": "Testing",
    "availability": "Full-time"
  }'
```

### Test 3: Check Count
```bash
curl http://localhost:5000/api/registrations/count
```

### Test 4: Full Workflow
1. Submit registration
2. Verify in Google Sheets
3. Approve in Sheets
4. Wait 10 seconds
5. Check email
6. Verify certificate in Sheets

---

## 📝 Maintenance Tasks

### Weekly
- [ ] Check server logs for errors
- [ ] Verify automation is running
- [ ] Check email delivery status
- [ ] Review new registrations

### Monthly
- [ ] Backup Google Sheets
- [ ] Update dependencies: `npm audit`
- [ ] Check server performance
- [ ] Review error logs

### Quarterly
- [ ] Update Node.js version
- [ ] Security audits
- [ ] Performance optimization
- [ ] Capacity planning

---

## 🔗 Useful Commands

```bash
# Install specific version
npm install express@4.18.2

# Update all packages
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check Node version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support Resources

- **Node.js Docs**: https://nodejs.org/en/docs/
- **Express Docs**: https://expressjs.com/
- **Google Sheets API**: https://developers.google.com/sheets/api
- **Nodemailer**: https://nodemailer.com/
- **pdfkit**: http://pdfkit.org/

---

**Version**: 1.0.0  
**Last Updated**: January 2024
