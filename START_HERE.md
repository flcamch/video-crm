# START HERE - Video CRM

Welcome! You have a complete, production-ready Video CRM application.

## What You Have

A professional Customer Relationship Management system for video production companies, built with:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- SQLite Database

## Quick Navigation

### I Want to...

**Get it running immediately**
→ See [QUICKSTART.md](./QUICKSTART.md) (5 minutes)

**Understand what was built**
→ See [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) (overview)

**Deploy to production**
→ See [DEPLOYMENT.md](./DEPLOYMENT.md) (Railway, Vercel, etc.)

**Learn about features**
→ See [README.md](./README.md) (complete features)

**See file structure**
→ See [FILE_MANIFEST.txt](./FILE_MANIFEST.txt) (all 39 files)

## Super Quick Start (3 steps)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Generate secret: openssl rand -base64 32
# Add JWT_SECRET to .env.local

# 3. Run it
npm run dev
# Visit http://localhost:3000
```

Then create your admin user at `/setup` or use the `/api/seed` endpoint.

## Features at a Glance

✅ **Dashboard** - Stats, recent deals, pipeline overview
✅ **Contacts** - Manage contacts and companies
✅ **Pipeline** - 5-stage Kanban board for deals
✅ **Offers** - Create professional offers with unique links
✅ **Pitch Pages** - Beautiful public presentation pages
✅ **Email Templates** - Reusable email templates
✅ **Authentication** - Secure JWT-based sessions
✅ **Mobile Responsive** - Works on all devices

## The Tech Stack

| What | How |
|------|-----|
| Frontend | React 18 with Next.js 14 |
| Styling | Tailwind CSS (no other UI libraries) |
| Database | SQLite (zero setup required) |
| Authentication | JWT tokens + HTTP-only cookies |
| Type Safety | TypeScript throughout |
| Deployment | Railway, Vercel, or any Node host |

## Project Structure

```
video-crm/
├── app/                 # All pages and routes
├── lib/                 # Database, auth, types
├── middleware.ts        # Route protection
└── package.json         # Dependencies
```

## Database

- **Type**: SQLite
- **Location**: `./data/crm.db` (auto-created)
- **Tables**: Users, Companies, Contacts, Deals, Offers, Templates
- **No setup needed**: It creates itself!

## Security

- Passwords hashed with bcryptjs
- JWT tokens expire after 7 days
- HTTP-only cookies (CSRF safe)
- All routes type-checked
- Input validation on everything

## Next Steps

1. **Follow QUICKSTART.md** to get it running
2. Create a contact and company
3. Create a deal in the pipeline
4. Generate an offer
5. Share the pitch link with someone

## Common Questions

**Q: Do I need to set up a database?**
A: No! SQLite is file-based. It creates `data/crm.db` automatically.

**Q: How do I change the password?**
A: There's no password change page yet, but you can reset the database:
   - Stop the server
   - Delete `data/crm.db`
   - Restart and create a new admin user

**Q: Can multiple people use this?**
A: Currently it's single-user. Multi-user support can be added later.

**Q: How do I deploy to production?**
A: See DEPLOYMENT.md - Railway deployment takes 10 minutes!

**Q: Where's the data stored?**
A: In `data/crm.db` (SQLite database file)

**Q: Can I customize the design?**
A: Yes! All styling is in Tailwind CSS. Modify colors, fonts, spacing easily.

## Files You'll Use Most

- `app/dashboard/` - The main interface
- `lib/db.ts` - Database operations
- `tailwind.config.js` - Colors and styling
- `.env.local` - Environment variables

## API Endpoints (if needed)

All endpoints require authentication (except `/pitch/` and login):

```
POST   /api/auth/login              Login
POST   /api/auth/logout             Logout
POST   /api/auth/setup              Create admin
POST   /api/seed                    Create test admin

GET    /api/contacts                All contacts
POST   /api/contacts                Create contact
PUT    /api/contacts/[id]           Update contact
DELETE /api/contacts/[id]           Delete contact

GET    /api/companies               All companies
POST   /api/companies               Create company
PUT    /api/companies/[id]          Update company
DELETE /api/companies/[id]          Delete company

GET    /api/deals                   All deals
POST   /api/deals                   Create deal
PUT    /api/deals/[id]              Update deal
DELETE /api/deals/[id]              Delete deal

POST   /api/offers                  Create offer
GET    /api/offers/[token]          Get offer (public)
PUT    /api/offers/[token]          Update offer

GET    /api/templates               All templates
POST   /api/templates               Create template
PUT    /api/templates/[id]          Update template
DELETE /api/templates/[id]          Delete template
```

## Support

- Check the relevant `.md` file for your question
- Look in `lib/db.ts` for database operations
- API examples in `app/api/` directory

## You're All Set!

Everything is ready to go. Just run:

```bash
npm install
npm run dev
```

Then visit http://localhost:3000 and create your first deal!

---

**Made with Next.js 14 | TypeScript | Tailwind CSS | SQLite**
