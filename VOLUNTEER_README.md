# Volunteer Registration System

A complete full-stack feature for NGO website volunteer registration with automated certificate generation and email delivery.

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm

### Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Set up Google Sheets (see VOLUNTEER_SETUP.md Step 2)
# 3. Set up Gmail (see VOLUNTEER_SETUP.md Step 3)
# 4. Create .env file (see VOLUNTEER_SETUP.md Step 4)

# 5. Start backend server
npm start
```

### Open Frontend

Option 1: Open the HTML directly
```
File: Frontend/volunteer-register.html
```

Option 2: Run local server
```bash
cd Frontend
python -m http.server 3000
# Visit: http://localhost:3000/volunteer-register.html
```

## ✨ Features

✅ **Responsive Registration Form**
- HTML5 form with Tailwind CSS styling
- Client-side validation (name, email, phone, position, availability)
- Real-time error messages

✅ **Backend Processing**
- Express.js server
- Server-side data validation
- Google Sheets integration
- Confirmation email on registration

✅ **Automated Certificate System**
- Background process runs every 10 seconds
- Finds approved volunteers in Google Sheets
- Auto-generates PDF certificates with:
  - NGO name
  - Volunteer name
  - Unique Certificate ID (CERT-0001, CERT-0002, etc.)
  - Date and signature line
- Sends certificate via email attachment
- Updates Google Sheets with Certificate ID

## 📊 Data Flow

```
User Form Submission
        ↓
Backend Validation
        ↓
Google Sheets Storage (Status: Pending)
        ↓
Admin Reviews & Approves (Changes Status: Approved)
        ↓
Automation Process (Every 10s)
        ↓
Generates Certificate PDF
        ↓
Sends Email with Certificate
        ↓
Updates Google Sheets (Certificate ID: CERT-0001)
```

## 🗂️ Project Structure

```
Frontend/
├── volunteer-register.html      # Registration form
└── volunteer-register.js        # Form handling & validation

backend/
├── server.js                    # Express server & API endpoints
├── .env                         # Environment config
├── certId.json                  # Certificate ID tracker
├── config/
│   └── googleAuth.json          # Google service account credentials
├── utils/
│   ├── googleSheets.js          # Sheets API wrapper
│   ├── certificate.js           # PDF generation
│   ├── emailService.js          # Email sending
│   └── automation.js            # Background automation
└── certificates/                # Generated PDFs (auto-created)
```

## 📝 API Endpoints

### POST /api/register-volunteer
Submit volunteer registration

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

**Response**:
```json
{
  "success": true,
  "message": "Registration successful! We will review your application and contact you."
}
```

### GET /api/health
Check server status

### GET /api/registrations/count
Get total registrations count

## 🔧 Configuration

### Environment Variables (.env)

```env
# Required
SPREADSHEET_ID=your_spreadsheet_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Optional
PORT=5000
NGO_NAME=Our NGO
NODE_ENV=development
```

### Google Sheets Setup Required

1. Create Google Sheet with headers:
   - Name, Phone, Email, Position, Experience, Availability, Status, Certificate ID, Timestamp

2. Set up service account credentials and save to: `backend/config/googleAuth.json`

3. Share Google Sheet with service account email

4. Add Spreadsheet ID to .env

### Gmail Setup Required

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password (not regular password)
3. Add to .env as EMAIL_PASSWORD

## 🎯 Admin Workflow

1. **Volunteers Submit Forms** → Data stored in Google Sheets
2. **Admin Reviews** → Opens Google Sheets
3. **Admin Approves** → Changes Status column to "Approved"
4. **Automation Runs** → Every 10 seconds checks for approved volunteers
5. **Certificates Generated** → PDF created and emailed
6. **Status Updated** → Certificate ID added to Google Sheet

## 📋 Google Sheets Columns

| Column | Purpose | Auto-filled? |
|--------|---------|------|
| Name | Volunteer name | ❌ User |
| Phone | Contact phone | ❌ User |
| Email | Contact email | ❌ User |
| Position | Volunteering role | ❌ User |
| Experience | Background info | ❌ User |
| Availability | Full-time/Part-time/Weekend | ❌ User |
| Status | Pending/Approved/Rejected | ✅ System (Pending) |
| Certificate ID | CERT-XXXX format | ✅ Automation |
| Timestamp | Submission time | ✅ System |

## 🔐 Security

- ✅ Server-side validation of all inputs
- ✅ Environment variables for sensitive data
- ✅ Google service account authentication
- ✅ Gmail App Password (not main password)
- ✅ Unique certificate IDs prevent duplicates

## 🔄 Automation Process

Runs every 10 seconds and:

1. **Reads** all rows from Google Sheets
2. **Finds** rows where Status = "Approved" AND Certificate ID = empty
3. **Generates** PDF certificate for each matching volunteer
4. **Sends** email with certificate attachment
5. **Updates** Google Sheets with Certificate ID
6. **Logs** all actions for monitoring

## 📧 Email Content

When a certificate is approved:

**To**: volunteer@email.com
**Subject**: Volunteer Certificate
**Body**: Congratulatory message with context
**Attachment**: PDF certificate (CERT-0001.pdf)

## ⚙️ Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **googleapis**: Google Sheets & Drive API
- **pdfkit**: PDF generation
- **nodemailer**: Email sending

## 📖 Detailed Setup

See **VOLUNTEER_SETUP.md** for:
- Step-by-step Google Sheets configuration
- Gmail 2FA and App Password setup
- Service account creation
- Troubleshooting guide
- Production checklist

## 🧪 Testing

1. **Submit Form**: Fill and submit volunteer form
2. **Check Sheets**: Verify data appears in Google Sheets
3. **Approve**: Change Status to "Approved"
4. **Wait**: 10 seconds for automation
5. **Check Email**: Verify certificate received
6. **Verify Sheets**: Check Certificate ID updated

## 🐛 Common Issues

**Server won't start**
```
npm install  # Reinstall dependencies
```

**Email not sending**
```
- Verify 2FA is enabled
- Check App Password in .env
- Confirm EMAIL_USER & EMAIL_PASSWORD set
```

**Data not in Sheets**
```
- Verify SPREADSHEET_ID is correct
- Check service account has access
- Verify header row exists in Row 1
```

## 📞 Support

All detailed instructions, troubleshooting, and API reference available in **VOLUNTEER_SETUP.md**

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready ✅
