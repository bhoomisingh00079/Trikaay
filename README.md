# Trikaay

A full-stack website and admin panel for managing Trikaay content, volunteers, comments, documents, and site settings.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)
- Integrations: Google Sheets API, Nodemailer, PDFKit
- Auth/Security: JWT, bcrypt password hashing, encrypted site contact fields

## Project Structure

- Frontend: `Frontend/`
- Backend: `backend/`

## Diagrams

- System architecture: `system-architecture.svg`
- User flow: `user-flow-diagram.svg`

## Main Features

- Public website pages with dynamic content
- Admin dashboard for:
  - Projects management
  - Contact and social links management
  - Volunteer approvals
  - Comments approvals
  - Document upload and management
  - Saved records viewing
- Media upload/delete APIs
- Certificate generation flow for approved volunteers
- Google Sheets data sync for volunteers, contacts, comments, and subscribers
- Automatic and manual dashboard refresh behavior

## Security Notes

- Admin passwords are stored as bcrypt hashes
- JWT access/refresh token based authentication
- Sensitive site settings are encrypted at rest:
  - `contactPhone`
  - `contactEmail`
  - `contactAddress`
  - `contactAddressSwapnalaya`
  - `contactAddressSwayamsiddha`

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection URI
- Google service account credentials for Sheets integration (if enabled)

## Environment Setup

### Backend (`backend/.env`)

Use `backend/.env.example` as reference and set at least:

- `MONGO_URI`
- `JWT_SECRET` (recommended 64+ chars)
- `JWT_REFRESH_SECRET` (recommended 64+ chars)
- `ENCRYPTION_KEY` (exactly 32 characters)

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

## Run Locally

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend will run on Vite default port and call backend APIs configured in frontend API utility.

## Build Frontend

```bash
cd Frontend
npm run build
```

## Database Utilities

### Mongo Developer Report Script

A special developer script is included to inspect MongoDB quickly.

File:

- `backend/scripts/mongoDevReport.js`

What it prints:

- Database stats (collections, objects, sizes)
- Per-collection counts and storage summary
- Media assets breakdown by kind/category
- Project preview (first 10 records)

Run it from backend:

```bash
cd "backend/scripts"
npm run mongo:report
```

Alias command also available:

```bash
npm run mongoDevReport.js
```

## Helpful Backend Scripts

From `backend/`:

- `npm run dev` - start backend with nodemon
- `npm run start` - start backend with node
- `npm run seed` - seed admin/test data
- `npm run mongo:report` - run Mongo developer report

## Deployment Notes

- Never commit real secrets in `.env`
- Ensure production secrets are strong and rotated
- Keep `ENCRYPTION_KEY` consistent across restarts to decrypt existing encrypted settings

## License

This project currently uses the license defined in package metadata.
