# Video CRM

Professionelles Customer Relationship Management System für Videoproduktionsunternehmen, gebaut mit Next.js 14, TypeScript, Tailwind CSS und SQLite.

## Features

- **Kontaktverwaltung**: Verwalte Kontakte und Firmen zentral
- **Deal Pipeline**: Visuelle Kanban-Board mit 5 Stages
- **Offertenverwaltung**: Erstelle und verteile Angebote mit eindeutigen Links
- **Pitch Pages**: Responsive, druckfreundliche Präsentationsseiten für Angebote
- **E-Mail Vorlagen**: Erstelle und verwalte wiederverwendbare E-Mail Templates
- **Authentifizierung**: JWT-basierte Session-Verwaltung mit HTTP-Only Cookies
- **Benutzerfreundlich**: Minimalistisches, modernes Design mit System-Fonts
- **Mobile-First**: Responsive Design für alle Geräte
- **Production-Ready**: Vollständig getesteter, dokumentierter Code

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Datenbank**: SQLite mit better-sqlite3
- **Auth**: JWT (jose) + bcryptjs
- **UI**: React 18

## Schnellstart

### Installation

```bash
npm install
cp .env.example .env.local
# Generiere JWT_SECRET: openssl rand -base64 32
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

### Erstes Setup

**Option 1 - Setup-Seite:**
```
http://localhost:3000/setup
```

**Option 2 - Seed-API:**
```bash
curl -X POST http://localhost:3000/api/seed
# Email: admin@example.com
# Passwort: admin123
```

## Datenbankschema

### users
```sql
id (INTEGER PK)
name (TEXT)
email (TEXT UNIQUE)
password_hash (TEXT)
role (TEXT DEFAULT 'user')
created_at (TEXT)
```

### companies
```sql
id (INTEGER PK)
name (TEXT)
industry (TEXT)
website (TEXT)
notes (TEXT)
created_at (TEXT)
```

### contacts
```sql
id (INTEGER PK)
company_id (INTEGER FK)
first_name (TEXT)
last_name (TEXT)
email (TEXT)
phone (TEXT)
position (TEXT)
notes (TEXT)
created_at (TEXT)
```

### deals
```sql
id (INTEGER PK)
contact_id (INTEGER FK)
company_id (INTEGER FK)
title (TEXT)
stage (TEXT DEFAULT 'lead')
value (REAL)
notes (TEXT)
created_at (TEXT)
```

### offers
```sql
id (INTEGER PK)
deal_id (INTEGER FK)
token (TEXT UNIQUE)
title (TEXT)
subtitle (TEXT)
description (TEXT)
services (TEXT - JSON array)
timeline_start (TEXT)
timeline_end (TEXT)
valid_until (TEXT)
status (TEXT DEFAULT 'draft')
viewed_at (TEXT)
created_at (TEXT)
```

### email_templates
```sql
id (INTEGER PK)
name (TEXT)
subject (TEXT)
body (TEXT)
created_at (TEXT)
```

## API-Endpoints

### Authentifizierung
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/logout` - Benutzer abmelden
- `POST /api/auth/setup` - Neuen Admin-Benutzer erstellen
- `POST /api/seed` - Test-Admin erstellen (nur wenn keine User existieren)

### Kontakte
- `GET /api/contacts` - Alle Kontakte abrufen
- `POST /api/contacts` - Neuen Kontakt erstellen
- `GET /api/contacts/[id]` - Kontakt abrufen
- `PUT /api/contacts/[id]` - Kontakt aktualisieren
- `DELETE /api/contacts/[id]` - Kontakt löschen

### Firmen
- `GET /api/companies` - Alle Firmen abrufen
- `POST /api/companies` - Neue Firma erstellen
- `PUT /api/companies/[id]` - Firma aktualisieren
- `DELETE /api/companies/[id]` - Firma löschen

### Deals
- `GET /api/deals` - Alle Deals abrufen
- `POST /api/deals` - Neuen Deal erstellen
- `GET /api/deals/[id]` - Deal abrufen
- `PUT /api/deals/[id]` - Deal aktualisieren
- `DELETE /api/deals/[id]` - Deal löschen

### Angebote
- `POST /api/offers` - Neues Angebot erstellen
- `GET /api/offers/[token]` - Angebot abrufen (öffentlich)
- `PUT /api/offers/[token]` - Angebot aktualisieren

### E-Mail Vorlagen
- `GET /api/templates` - Alle Vorlagen abrufen
- `POST /api/templates` - Neue Vorlage erstellen
- `PUT /api/templates/[id]` - Vorlage aktualisieren
- `DELETE /api/templates/[id]` - Vorlage löschen

## Pipeline Stages

1. **Lead / Interesse** (grau)
2. **Beratung / Gespräch** (blau)
3. **Offerte gesendet** (amber)
4. **Gewonnen / In Produktion** (grün)
5. **Verloren** (rot)

## Design-Prinzipien

- **Minimalistisch**: Weißer Hintergrund (#FAFAFA), dunkler Text (#111827)
- **Räumig**: Großzügiger Whitespace, subtile Schatten
- **Modern**: System-Font Stack, klare Typografie
- **Responsiv**: Mobile-First, alle Geräte unterstützt
- **Professionell**: Sauberes, zartes Design

## Sicherheit

- JWT-Token in HTTP-Only Cookies
- 7-Tage Token Expiration
- Middleware-basierte Route Protection
- bcryptjs Password Hashing (10 Rounds)
- CSRF Protection via Next.js
- SQL Injection Prevention (Prepared Statements)

## Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anweisungen zu:
- Lokaler Entwicklung
- Railway-Deployment
- Environment-Konfiguration
- Troubleshooting

## Projektstruktur

```
video-crm/
├── app/
│   ├── api/              # API Routes
│   ├── dashboard/        # Protected Dashboard
│   ├── login/           # Login Page
│   ├── setup/           # Setup Page
│   ├── pitch/           # Public Pitch Pages
│   ├── layout.tsx       # Root Layout
│   ├── page.tsx         # Home (redirect)
│   └── globals.css      # Global Styles
├── lib/
│   ├── auth.ts          # JWT & Password Utils
│   ├── db.ts            # Database Layer
│   └── types.ts         # TypeScript Types
├── data/                # Database File (auto-created)
├── middleware.ts        # Route Protection
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Lizenz

Privat

## Support

Für Fragen oder Probleme: Siehe DEPLOYMENT.md oder konsultiere die Dokumentation
