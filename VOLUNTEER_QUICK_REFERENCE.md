# Quick Reference Guide

Fast reference for running and managing the volunteer registration system.

## ⚡ Quick Commands

### Start Backend
```bash
cd backend
npm start
```

Output should show:
```
✓ Google authentication initialized
✓ Email service initialized successfully
✅ Server is running on http://localhost:5000
🤖 Starting automation process...
```

### Start Frontend
```bash
# Option 1: Direct open
File → Open File → volunteer-register.html

# Option 2: Local server
cd Frontend
python -m http.server 3000
# Visit http://localhost:3000/volunteer-register.html
```

### Check Server Health
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

## 🔧 Configuration Files

### .env File Location
```
backend/.env
```

### Must Have in .env
```env
SPREADSHEET_ID=<Your Google Sheet ID>
EMAIL_USER=<Your Gmail>
EMAIL_PASSWORD=<Your App Password>
```

### Optional in .env
```env
PORT=5000
NGO_NAME=Your NGO Name
NODE_ENV=development
```

## 📊 Google Sheets Layout

Row 1 (Headers):
```
Name | Phone | Email | Position | Experience | Availability | Status | Certificate ID | Timestamp
```

Row 2+ (Data):
- Auto-filled on registration
- Status defaults to "Pending"
- Certificate ID filled by automation

## 🎯 Admin Tasks

### Review Registrations
1. Open Google Sheets: `Volunteer Registrations`
2. View all registrations in rows

### Approve Volunteer
1. Open Google Sheet row
2. Click **Status** column (column G)
3. Type: `Approved`
4. Press Enter

### Check Certificate Status
1. Look at **Certificate ID** column (column H)
2. If empty → Not yet processed
3. If shows CERT-XXXX → Certificate sent

## 🔄 Automation Process

Runs automatically every 10 seconds.

**Process**:
1. Checks all rows in Google Sheets
2. Finds Status = "Approved" + Certificate ID = empty
3. Generates PDF certificate
4. Sends email with certificate
5. Updates Certificate ID in Sheet

**Monitoring**:
Check backend console for logs like:
```
🔄 Running automation process...
📝 Processing volunteer: John Doe
Generated Certificate ID: CERT-0001
✓ Certificate email sent to john@example.com
```

## 📁 File Locations

| What | Location |
|------|----------|
| Frontend form | `Frontend/volunteer-register.html` |
| Frontend JS | `Frontend/volunteer-register.js` |
| Backend server | `backend/server.js` |
| Google credentials | `backend/config/googleAuth.json` |
| Certificate tracker | `backend/certId.json` |
| Generated PDFs | `backend/certificates/` |
| Environment config | `backend/.env` |

## 📱 Test Form Submission

1. Open `volunteer-register.html`
2. Fill all required fields:
   - Name: Test User
   - Phone: +1-555-1234567
   - Email: your_email@gmail.com
   - Position: Tester
   - Availability: Full-time
3. Click **Submit Registration**
4. Should see: "Registration successful!"

## 📊 Verify in Google Sheets

After submitting:
1. Open Google Sheets
2. Look for new row with your data
3. Status should be "Pending"
4. Certificate ID should be empty

## ✉️ Send Test Certificate

1. In Google Sheets, find your test row
2. Click **Status** column
3. Type: `Approved`
4. Press Enter
5. Wait 10 seconds
6. Check your email for certificate

## 🐛 Troubleshooting Quick Fixes

### Backend won't start
```bash
npm install
npm start
```

### Form won't submit
- Check backend is running on port 5000
- Check browser console (F12) for errors
- Verify all fields are filled

### Email not arriving
```
1. Check EMAIL_USER in .env
2. Check EMAIL_PASSWORD (use App Password)
3. Check Status = "Approved" in Sheets
4. Wait 10-20 seconds for automation
5. Check spam/promotions folder
```

### Data not saving to Sheets
```
1. Verify SPREADSHEET_ID in .env
2. Share Google Sheet with service account email
3. Check backend console for errors
4. Verify header row exists
```

## 📈 Monitor System

### Check Total Registrations
```bash
curl http://localhost:5000/api/registrations/count
```

### View Backend Logs
Look at terminal running backend server:
```
✓ Volunteer registered: John Doe
Processing volunteer: John Doe
✓ Certificate email sent
```

### Check Certificate Tracking
```bash
cat backend/certId.json
# Shows: {"lastId": 5}  (means 5 certificates generated)
```

## 🔐 Security Notes

- Never push `.env` to git
- Keep `googleAuth.json` secure
- Use App Password for Gmail
- All input is validated server-side

## 📞 API Quick Reference

### Register Volunteer
**POST** `/api/register-volunteer`
```json
{
  "name": "John Doe",
  "phone": "+1-555-1234567",
  "email": "john@example.com",
  "position": "Coordinator",
  "experience": "5 years",
  "availability": "Full-time"
}
```

### Check Health
**GET** `/api/health`

### Get Count
**GET** `/api/registrations/count`

## 🎓 Certificate Details

Format:
- ID: CERT-0001, CERT-0002, etc. (auto-incremented)
- Stored in: `backend/certId.json`
- PDF saved to: `backend/certificates/`
- Sent via email attachment

## 📋 Google Sheet Column Reference

| # | Column | Type | Who Sets | Notes |
|---|--------|------|----------|-------|
| A | Name | Text | User | Required |
| B | Phone | Text | User | Required, 10+ digits |
| C | Email | Email | User | Required, valid email |
| D | Position | Text | User | Required |
| E | Experience | Text | User | Optional |
| F | Availability | Dropdown | User | Full-time/Part-time/Weekend |
| G | Status | Text | Admin | Pending/Approved |
| H | Certificate ID | Text | System | Auto-filled: CERT-XXXX |
| I | Timestamp | DateTime | System | Auto-filled |

## 🚀 Production Checklist

- [ ] Test end-to-end registration
- [ ] Test certificate generation
- [ ] Test email delivery
- [ ] Verify Google Sheets structure
- [ ] Check .env variables
- [ ] Review backend logs
- [ ] Test error handling
- [ ] Verify CORS settings
- [ ] Backup Google Sheets
- [ ] Monitor automation logs

---

**Keep this guide handy for quick reference!**
