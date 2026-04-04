# Video CRM - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- JWT (jose)
- Password hashing (bcryptjs)

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Generate a secure JWT secret
openssl rand -base64 32

# Add the generated secret to .env.local
# JWT_SECRET=<paste-your-generated-secret-here>
```

## Step 3: Start Development Server

```bash
npm run dev
```

Open your browser: http://localhost:3000

You'll automatically redirect to http://localhost:3000/login

## Step 4: Create Admin User

Choose ONE option:

### Option A: Setup Page (Recommended)
```
Visit: http://localhost:3000/setup
Fill in your details
Click "Admin-Benutzer erstellen"
Redirects to login automatically
```

### Option B: Seed API Endpoint
```bash
curl -X POST http://localhost:3000/api/seed

# Credentials created:
# Email: admin@example.com
# Password: admin123
```

## Step 5: Login & Explore

1. Go to http://localhost:3000/login
2. Enter your credentials
3. You're now in the dashboard!

## Dashboard Overview

- **📊 Dashboard**: Overview with stats
- **👥 Kontakte**: Manage contacts and companies
- **📈 Pipeline**: Kanban board for deals
- **📝 Vorlagen**: Email templates

## Creating Your First Deal

1. Go to **Kontakte** → Create a contact and company
2. Go to **Pipeline** → Create a new deal
3. Select contact and company
4. Create an offer with services and pricing
5. Share the unique pitch link!

## Building for Production

```bash
npm run build
npm start
```

Then deploy to Railway or any Node.js host (see DEPLOYMENT.md).

## Project Structure

```
app/
├── api/              # REST API endpoints (all routes)
├── dashboard/        # Protected dashboard pages
├── login/            # Login page
├── setup/            # Initial setup
├── pitch/            # Public offer pages
└── globals.css       # Global styles

lib/
├── db.ts             # Database layer
├── auth.ts           # Authentication
└── types.ts          # TypeScript types
```

## Key Features

- Full CRUD for contacts, companies, deals, offers
- 5-stage pipeline (Lead → Won/Lost)
- Professional pitch pages with unique tokens
- JWT-based authentication
- SQLite database (auto-created)
- Fully typed with TypeScript
- Tailwind CSS styling
- Mobile responsive

## Useful Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Check for TypeScript errors
npx tsc --noEmit

# Format code (optional)
npx prettier --write .
```

## Database

- **Location**: `./data/crm.db` (auto-created)
- **Type**: SQLite3
- **Tables**: users, companies, contacts, deals, offers, email_templates
- **Reset**: Delete `data/crm.db` and restart server

## Common URLs

| Page | URL | Auth |
|------|-----|------|
| Home | http://localhost:3000 | Redirect |
| Login | http://localhost:3000/login | Public |
| Setup | http://localhost:3000/setup | Public (first time only) |
| Dashboard | http://localhost:3000/dashboard | Required |
| Pitch | http://localhost:3000/pitch/[token] | Public |

## Need Help?

- Check [README.md](./README.md) for feature details
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options
- Review [FILE_MANIFEST.txt](./FILE_MANIFEST.txt) for file structure

## Security Notes

- Change admin password after first login
- Keep JWT_SECRET secret (store in environment only)
- Passwords are hashed with bcryptjs (10 rounds)
- JWT tokens expire after 7 days
- All protected routes require valid token

## Next Steps

1. Create some contacts and companies
2. Build a few deals
3. Generate an offer
4. Share the pitch link (e.g., to a client)
5. Track deal progress through pipeline
6. Deploy to production when ready

Enjoy using Video CRM!
