# Volunteer Registration System - Setup Guide

Complete setup instructions for the Volunteer Registration full-stack feature.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step 1: Install Dependencies](#step-1-install-dependencies)
5. [Step 2: Google Sheets Setup](#step-2-google-sheets-setup)
6. [Step 3: Gmail Configuration](#step-3-gmail-configuration)
7. [Step 4: Environment Variables](#step-4-environment-variables)
8. [Step 5: Run the Application](#step-5-run-the-application)
9. [Admin Workflow](#admin-workflow)
10. [Testing the Feature](#testing-the-feature)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a full-stack volunteer registration system with:

- **Frontend**: Responsive HTML/CSS/JavaScript form with Tailwind CSS
- **Backend**: Node.js Express server with Google Sheets integration
- **Automation**: Background process that run every 10 seconds
- **Features**:
  - Volunteer registration form
  - Data stored in Google Sheets
  - Automatic certificate generation (PDF)
  - Email delivery with certificate
  - Admin approval workflow

### Architecture Flow

```
User fills form → Submit → Backend validates → Store in Google Sheets
                                                      ↓
                        Admin reviews & marks "Approved" in Sheets
                                                      ↓
                        Backend automation (every 10s):
                        - Finds approved volunteers
                        - Generates PDF certificate
                        - Sends email with attachment
                        - Updates Sheets with Certificate ID
```

---

## Prerequisites

- **Node.js** v14+ (check: `node --version`)
- **npm** v6+ (check: `npm --version`)
- **Google Account** (for Sheets API)
- **Gmail Account** (for sending emails)
- **Git** (optional, for version control)

---

## Project Structure

```
Trikaay/
├── Frontend/
│   ├── volunteer-register.html
│   ├── volunteer-register.js
│   └── [other frontend files]
│
└── backend/
    ├── server.js                    # Main server
    ├── .env                         # Environment variables
    ├── certId.json                  # Certificate ID tracker
    ├── package.json                 # Dependencies
    ├── config/
    │   ├── googleAuth.js            # Google Auth config
    │   └── googleAuth.json          # Service account credentials (add this)
    ├── utils/
    │   ├── googleSheets.js          # Google Sheets integration
    │   ├── certificate.js           # PDF certificate generation
    │   ├── emailService.js          # Email sending
    │   └── automation.js            # Background automation
    ├── routes/
    │   ├── contact.js               # Existing routes
    │   ├── subscribe.js
    │   └── comments.js
    ├── services/
    │   └── sheets.js
    └── certificates/                # Generated PDFs (auto-created)
```

---

## Step 1: Install Dependencies

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify installation
npm list
```

### Check Installed Packages

```bash
npm list --depth=0
```

Expected packages:
- express
- cors
- dotenv
- googleapis
- pdfkit ✨ NEW
- nodemailer ✨ NEW
- nodemon (dev)

---

## Step 2: Google Sheets Setup

### 2.1 Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** → **"Spreadsheet"**
3. Name it: `Volunteer Registrations`
4. Create headers in Row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Name | Phone | Email | Position | Experience | Availability | Status | Certificate ID | Timestamp |

**Example Row 2** (manual entry to test):
- Name: John Doe
- Phone: +1-555-1234567
- Email: john@example.com
- Position: Event Coordinator
- Experience: 5 years in event management
- Availability: Full-time
- Status: Pending
- Certificate ID: (empty)
- Timestamp: [auto]

### 2.2 Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create a new project**:
   - Click on the project dropdown at top
   - Click **"New Project"**
   - Name: `Volunteer Registration`
   - Click **Create**

3. **Enable APIs**:
   - In search bar, search for **"Google Sheets API"**
   - Click it → **Enable**
   - Search for **"Google Drive API"**
   - Click it → **Enable**

4. **Create Service Account**:
   - Go to **"IAM & Admin"** → **"Service Accounts"**
   - Click **"Create Service Account"**
   - Service account name: `volunteer-registration`
   - Click **Create and Continue**
   - Click the service account you just created

5. **Create and Download JSON Key**:
   - Go to **"Keys"** tab
   - Click **"Add Key"** → **"Create new key"**
   - Select **JSON**
   - Click **Create** (file downloads automatically)
   - Save as: `backend/config/googleAuth.json`

### 2.3 Share Google Sheet with Service Account

1. Open your Google Sheet: `Volunteer Registrations`
2. Click **Share** button (top right)
3. In the JSON file, find the `"client_email"` value
4. Copy that email
5. Paste into share dialog
6. Make sure to give **"Editor"** access
7. Click **Share**

### 2.4 Get Spreadsheet ID

1. Open your Google Sheet: `Volunteer Registrations`
2. Look at URL: `https://docs.google.com/spreadsheets/d/XXXXX/edit#gid=0`
3. The `XXXXX` part is your **Spreadsheet ID**
4. Copy it for Step 4

---

## Step 3: Gmail Configuration

### 3.1 Enable 2-Factor Authentication

1. Go to [Google Account](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Scroll down to **"2-Step Verification"**
4. Click **"Get Started"**
5. Follow the steps to enable 2FA

### 3.2 Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to **"App passwords"** (only visible if 2FA is enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device)
4. Click **Generate**
5. Google will show a 16-character password
6. **Copy it** (you'll need it in Step 4)

### 3.3 Alternative: Less Secure App Access

If you don't want to use 2FA:

1. Go to [Less Secure App Access](https://myaccount.google.com/lesssecureapps)
2. Enable **"Allow less secure app access"**
3. Use your regular Gmail password in `.env`

⚠️ **Note**: Using App Passwords is more secure.

---

## Step 4: Environment Variables

### 4.1 Update .env File

Open `backend/.env` and fill in:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Sheets Integration
SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=YOUR_APP_PASSWORD_HERE

# NGO Information
NGO_NAME=Our NGO

# Automation Settings
AUTOMATION_INTERVAL=10000
```

### Example .env File

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Sheets Integration
SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p

# Email Configuration
EMAIL_USER=volunteer@ngo.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# NGO Information
NGO_NAME=Trikaay NGO

# Automation Settings
AUTOMATION_INTERVAL=10000
```

---

## Step 5: Run the Application

### 5.1 Backend Setup & Start

```bash
# From Trikaay/backend directory
cd backend

# Install dependencies (if not done)
npm install

# Start the server
npm start

# Expected output:
# 🚀 Initializing Volunteer Registration System...
# 📊 Initializing Google Sheets...
# ✓ Google authentication initialized
# 📧 Initializing Email Service...
# ✓ Email service initialized successfully
# 🤖 Starting automation process...
# ✅ Server is running on http://localhost:5000
```

### 5.2 Frontend Setup

The frontend (`volunteer-register.html`) is static and can be opened directly:

**Option 1: Simple HTTP Server**
```bash
# From Frontend directory
cd Frontend

# Using Python 3
python -m http.server 3000

# Using Node.js (if installed)
npx http-server -p 3000
```

**Option 2: Open Directly**
- Double-click `volunteer-register.html` in Explorer
- Or open in browser: `file:///path/to/volunteer-register.html`

---

## Admin Workflow

### Step 1: User Registers

1. User fills and submits the volunteer registration form
2. Data is stored in Google Sheets automatically (Row 2+)
3. Status = "Pending", Certificate ID = empty

### Step 2: Admin Reviews

1. Open Google Sheets: `Volunteer Registrations`
2. Review volunteer information
3. For approved volunteers, change **Status** column to **"Approved"**

### Step 3: Automation Runs

1. Backend automation checks every 10 seconds
2. Finds rows: Status = "Approved" + Certificate ID = empty
3. For each matching row:
   - Generates a PDF certificate
   - Assigns Certificate ID (CERT-0001, CERT-0002, etc.)
   - Sends email with certificate attached
   - Updates Sheets with Certificate ID

### Admin Verification

Check in Google Sheets:
- **Certificate ID** column will have values like: CERT-0001, CERT-0002
- Check email inbox to verify certificate was sent

---

## Testing the Feature

### Test 1: Submit Registration

1. Open `volunteer-register.html` in browser
2. Fill form with test data:
   - Name: John Doe
   - Phone: +1-555-1234567
   - Email: your_email@gmail.com
   - Position: Test Volunteer
   - Experience: Testing the system
   - Availability: Full-time
3. Click **Submit Registration**
4. Should see: **"Registration successful!"** message

### Test 2: Verify Data in Sheets

1. Open Google Sheets: `Volunteer Registrations`
2. Check Row 2 (or latest row)
3. Verify all fields are filled
4. Status should be "Pending"
5. Certificate ID should be empty
6. Timestamp should show current time

### Test 3: Manual Certificate Approval

1. In Google Sheets, find your test row
2. Click on **Status** cell (column G)
3. Change from "Pending" to **"Approved"**
4. Press Enter to save

### Test 4: Check Automation

1. Wait 10 seconds (or up to 20 seconds)
2. Check backend console for logs like:
   ```
   Processing volunteer: John Doe (your_email@gmail.com)
   Generated Certificate ID: CERT-0001
   ✓ Certificate saved: ...
   ✓ Certificate email sent to your_email@gmail.com
   ```
3. Check your email inbox for certificate
4. Refresh Google Sheets - Certificate ID should now show "CERT-0001"

---

## Troubleshooting

### Server Won't Start

**Error**: `Cannot find module 'pdfkit'`
```
Solution: Run npm install
cd backend
npm install
```

**Error**: `SPREADSHEET_ID is required in .env`
```
Solution: Add SPREADSHEET_ID to .env file
See Step 4 for instructions
```

**Error**: `Cannot find googleAuth.json`
```
Solution: 
1. Go to Google Cloud Console
2. Create service account credentials
3. Save JSON file to: backend/config/googleAuth.json
See Step 2.2 for details
```

### Email Not Sending

**Error**: `Email service initialization failed`
```
Solution:
1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. Verify 2FA is enabled on Gmail account
3. Use App Password, not regular password
4. Check email is connected to correct account
See Step 3 for details
```

**Certificates not sending but no error**:
```
Solution:
1. Check backend console for logs
2. Verify volunteer Status = "Approved" in Sheets
3. Check Certificate ID is empty in Sheets
4. Wait 10 seconds for automation to run
5. Verify EMAIL_USER & EMAIL_PASSWORD are set
```

### Google Sheets Not Updating

**Error**: `Error appending to Google Sheets`
```
Solution:
1. Verify service account email has access
2. Share Google Sheet with service account email
3. Check SPREADSHEET_ID is correct
4. Verify header row exists in Row 1
See Step 2.3 for details
```

### Frontend Form Issues

**Form not submitting**:
```
Solution:
1. Check browser console for errors (F12)
2. Verify backend is running on port 5000
3. Check CORS is enabled
4. Verify all required fields are filled
5. Check email format
```

**Button says "Submitting..." forever**:
```
Solution:
1. Check if backend server is running
2. Open browser console (F12) → Network tab
3. Look for failed requests
4. Check backend logs for errors
```

### Certificate Generation Issues

**Error**: `Certificate file not found`
```
Solution:
1. Check backend/utils/certificate.js has correct path
2. Verify backend/certificates/ directory exists
3. Check file permissions
```

**PDF looks corrupted**:
```
Solution:
1. Check pdfkit is installed: npm list pdfkit
2. Regenerate certificate by changing status again
3. Check backend logs for generation errors
```

---

## API Reference

### Endpoints

#### POST /api/register-volunteer
Submit a volunteer registration

**Request**:
```json
{
  "name": "John Doe",
  "phone": "+1-555-1234567",
  "email": "john@example.com",
  "position": "Event Coordinator",
  "experience": "5 years of experience",
  "availability": "Full-time"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Registration successful! We will review your application and contact you."
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Name must be at least 2 characters"]
}
```

#### GET /api/health
Check if server is running

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "message": "Volunteer registration system is running"
}
```

#### GET /api/registrations/count
Get total number of registrations

**Response**:
```json
{
  "success": true,
  "count": 5,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| PORT | No | Server port | 5000 |
| NODE_ENV | No | Environment | development |
| SPREADSHEET_ID | **Yes** | Google Sheet ID | 1a2b3c4d5e6f... |
| EMAIL_USER | **Yes** | Gmail address | volunteer@ngo.com |
| EMAIL_PASSWORD | **Yes** | Gmail App Password | abcd efgh ijkl mnop |
| NGO_NAME | No | Organization name | Our NGO |
| AUTOMATION_INTERVAL | No | Check interval (ms) | 10000 |

---

## File Descriptions

### Frontend Files

| File | Purpose |
|------|---------|
| `volunteer-register.html` | Main registration form with Tailwind CSS |
| `volunteer-register.js` | Form validation and API integration |

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Main Express server and API endpoints |
| `.env` | Environment variables (keep secure) |
| `certId.json` | Tracks last certificate ID |

### Backend Utils

| File | Purpose |
|------|---------|
| `utils/googleSheets.js` | Google Sheets API integration |
| `utils/certificate.js` | PDF certificate generation |
| `utils/emailService.js` | Email sending via Gmail |
| `utils/automation.js` | Background process automation |

---

## Security Considerations

1. **Keep .env secure**: Never commit to git
2. **Google Credentials**: Store `googleAuth.json` securely
3. **Email Password**: Use App Password, not your main password
4. **CORS**: Configure for your domain in production
5. **Validation**: All inputs are validated server-side
6. **Rate Limiting**: Consider adding rate limiting in production

---

## Production Checklist

- [ ] Use strong email App Password
- [ ] Enable HTTPS in production
- [ ] Set proper CORS origins
- [ ] Add rate limiting
- [ ] Use environment-specific configs
- [ ] Set up error logging
- [ ] Backup Google Sheets regularly
- [ ] Monitor automation logs
- [ ] Set up email bounce handling
- [ ] Add request logging

---

## Support & Documentation

For issues or questions:
1. Check the Troubleshooting section
2. Review API Reference
3. Check backend console logs
4. Verify all .env variables are set
5. Ensure all files are in correct directories

---

**Last Updated**: January 2024
**Version**: 1.0.0
