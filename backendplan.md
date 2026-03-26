# Google Sheets Backend Integration — Project Plan

## Overview

Connect the frontend's **Get in Touch** form and **Subscribe** button to a Node.js/Express backend that writes data into two separate tabs of a single Google Sheet.

> **Note for implementation:** Before writing any backend code, go through the frontend source and identify the exact field names, form IDs, and how the buttons currently submit data (e.g. `fetch`, `axios`, native form submit, etc.). The backend routes and validation must match whatever the frontend is sending.

---

## Folder Structure

```
backend/
├── .env                    # Credentials — never commit this
├── .env.example            # Safe template to commit
├── .gitignore
├── package.json
├── server.js               # Express entry point
├── routes/
│   ├── contact.js          # POST /api/contact
│   └── subscribe.js        # POST /api/subscribe
├── services/
│   └── sheets.js           # Google Sheets API wrapper
└── config/
    └── googleAuth.js       # Auth client setup
```

---

## Environment Files

### Step 1 — Create `.env`
Create this file manually in the root of the `backend/` folder. **Never commit this file.**

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here

PORT=5000
```

### Step 2 — Create `.env.example`
Create this file as a safe, committed template so anyone cloning the repo knows what variables are needed.

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=

PORT=5000
```

### Step 3 — Add `.env` to `.gitignore`
Make sure `.gitignore` contains at minimum:

```
node_modules/
.env
```

---

## Google Sheet Setup

1. Create a new Google Sheet
2. Rename **Sheet1** → `Contacts`
3. Add a second sheet tab, rename it → `Subscribers`
4. Add headers manually in Row 1:

**Contacts tab:**
| Name | Phone | Email | Subject | Submitted At |

**Subscribers tab:**
| Email | Subscribed At |

---

## Google Cloud Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts** → Create a service account
5. After creation, go to **Keys → Add Key → JSON** — download the file
6. From the downloaded JSON file, copy:
   - `client_email` → paste as `GOOGLE_SERVICE_ACCOUNT_EMAIL` in your `.env`
   - `private_key` → paste as `GOOGLE_PRIVATE_KEY` in your `.env`
7. Open your Google Sheet → **Share** → paste the service account email → give **Editor** access
8. Copy the Sheet ID from the URL: `spreadsheets/d/YOUR_SHEET_ID_HERE/edit` → paste as `GOOGLE_SHEET_ID` in your `.env`

---

## Dependencies

```bash
npm init -y
npm install express cors dotenv googleapis
npm install --save-dev nodemon
```

Add to `package.json` scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## Implementation Plan

### Step 1 — `config/googleAuth.js`
- Load credentials from `.env` via `dotenv`
- Create a `google.auth.JWT` client scoped to `https://www.googleapis.com/auth/spreadsheets`
- Export the auth client and the initialized `sheets` API instance

### Step 2 — `services/sheets.js`
- Export two functions:
  - `appendContact({ name, phone, email, subject })` — appends one row to the `Contacts` sheet tab, including a timestamp
  - `appendSubscriber({ email })` — appends one row to the `Subscribers` sheet tab, including a timestamp
- Both use `sheets.spreadsheets.values.append` with `valueInputOption: 'USER_ENTERED'`
- Range format: `Contacts!A:E` and `Subscribers!A:B`

### Step 3 — `routes/contact.js`
- `POST /api/contact`
- Read `name`, `phone`, `email`, `subject` from `req.body`

  > **Check the frontend first** — confirm these are the exact field names your Get in Touch form sends. If the form uses different keys (e.g. `fullName` instead of `name`), update the destructuring here to match.

- Return `400` if any field is missingA
- Call `appendContact()` and return `200` on success, `500` on error

### Step 4 — `routes/subscribe.js`
- `POST /api/subscribe`
- Read `email` from `req.body`

  > **Check the frontend first** — confirm the Subscribe button sends a field called `email`. If it sends something else (e.g. `subscriber_email`), match it here.

- Return `400` if email is missing or invalid format
- Call `appendSubscriber()` and return `200` on success, `500` on error

### Step 5 — `server.js`
- Call `require('dotenv').config()` at the top
- Set up Express with `cors()` and `express.json()` middleware
- Mount routes: `app.use('/api/contact', contactRouter)` and `app.use('/api/subscribe', subscribeRouter)`
- Listen on `process.env.PORT || 5000`

---

## Frontend Integration Points

Once the backend is running, your frontend should call:

**Get in Touch form:**
```js
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone, email, subject })
})
```

**Subscribe button:**
```js
fetch('http://localhost:5000/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
})
```

> If your frontend already uses `axios` or another HTTP client, adapt accordingly — the payload shape is what matters.

---

## Implementation Order

1. Set up Google Cloud project + service account
2. Create and configure the Google Sheet (headers + sharing)
3. Scaffold the backend folder structure
4. **Create `.env`** with your real credentials
5. **Create `.env.example`** with empty values and commit it
6. Implement `googleAuth.js` and `sheets.js`
7. Implement both route files
8. Wire up `server.js`
9. Test both endpoints with Postman or `curl` before touching the frontend
10. Review the frontend source to confirm field names match, then connect the fetch calls

---

## What's Out of Scope (for later)

- Rate limiting and spam protection
- Email confirmation on subscribe
- Admin dashboard to view submissions
- Deployment (Render, Railway, Vercel serverless, etc.)