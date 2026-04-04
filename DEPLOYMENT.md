# Video CRM Deployment

## Lokaler Start

### Installation und Setup

```bash
# Clone oder öffne das Projekt
cd video-crm

# Installiere Dependencies
npm install

# Erstelle .env.local Datei basierend auf .env.example
cp .env.example .env.local

# Generiere einen zufälligen JWT_SECRET
# Auf Mac/Linux:
openssl rand -base64 32
# Auf Windows, nutze einen online Generator oder:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Füge den generierten Secret in .env.local ein
# JWT_SECRET=dein_generierter_secret_hier
```

### Erstes Mal (Setup)

Es gibt zwei Optionen zum Erstellen eines Admin-Benutzers:

#### Option 1: Via Setup-Seite (empfohlen)
```bash
# Starte den Development Server
npm run dev

# Öffne http://localhost:3000/setup
# Erstelle deinen Admin-Benutzer
# Danach automatische Umleitung zu /login
```

#### Option 2: Via Seed-Endpoint
```bash
# Starte den Development Server
npm run dev

# In einem anderen Terminal:
curl -X POST http://localhost:3000/api/seed

# Anmeldedaten:
# Email: admin@example.com
# Passwort: admin123

# ⚠️ Ändern Sie das Passwort nach dem ersten Login!
```

### Lokale Entwicklung

```bash
# Development Server (mit Hot Reload)
npm run dev

# Öffne http://localhost:3000
# Du wirst zu /login weitergeleitet
# Melde dich mit deinen Anmeldedaten an
```

## Railway Deployment

### Vorbereitung

1. **GitHub Repository**
   ```bash
   # Initialisiere Git (falls nicht geschehen)
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/DEIN_USERNAME/video-crm.git
   git push -u origin main
   ```

2. **Railway Setup**
   - Gehe zu [railway.app](https://railway.app)
   - Erstelle einen Account (mit GitHub einfach)
   - Wende dich an Railway Support oder erstelle ein Projekt

### Deployment Schritte

1. **Neues Projekt erstellen**
   - "New Project" → "Deploy from GitHub"
   - Wähle dein video-crm Repository
   - Railway erkennt automatisch Next.js

2. **Umgebungsvariablen konfigurieren**
   - Gehe zu "Variables" in deinem Railway Projekt
   - Füge folgende Variable hinzu:
     ```
     JWT_SECRET=generiertermiteinscryptographischemzufall
     NODE_ENV=production
     ```

3. **Domain einrichten (optional)**
   - Railway generiert automatisch eine Domain: `yourapp.railway.app`
   - Oder verbinde deine eigene Domain in "Domains"

4. **Admin-Benutzer erstellen**
   - Nach dem Deployment: besuche `https://yourapp.railway.app/api/seed`
   - Oder: `https://yourapp.railway.app/setup` für manuelles Setup
   - Standard Login: admin@example.com / admin123

### Nach dem Deployment

- Melde dich unter `https://yourapp.railway.app/login` an
- Ändere das Standard-Passwort des Admin-Benutzers
- Die Datenbank (crm.db) wird im Container gespeichert
  - Für Persistenz: Railway bietet PostgreSQL Add-ons (optional)
  - Oder: Verwende externe Datenbank (siehe Railway Docs)

## Environment Variables

### Erforderlich
- `JWT_SECRET`: Random string, mindestens 32 Zeichen
  ```bash
  openssl rand -base64 32
  ```

### Optional
- `NODE_ENV`: `development` oder `production` (Standard: development)

## Troubleshooting

### "Setup already completed" Fehler
- Setup Seite ist nur beim ersten Start verfügbar
- Danach nutze nur `/login`

### Datenbank wird nicht gefunden
- Stelle sicher, dass `data/` Verzeichnis existiert
- Im Production: Check Railway Logs für Fehler

### JWT Token ungültig
- Überprüfe, dass `JWT_SECRET` identisch ist auf allen Instanzen
- Token ist 7 Tage gültig, danach neu anmelden

### Passwort vergessen
- Es gibt keine Recovery-Funktion
- Lösche die Datenbank und stelle sie neu her (siehe "Datenbankrücksetzung")

## Datenbankrücksetzung

### Lokal
```bash
# Stoppe den Dev Server (Ctrl+C)
rm data/crm.db
npm run dev
# Gehe zu http://localhost:3000/setup
```

### Railway
```bash
# Option 1: Über Railway Dashboard
# - Gehe zu "Deployments"
# - Starte einen neuen Build (die alte DB wird gelöscht)

# Option 2: SSH in den Container
# (Wenn du Advanced Railway Features nutzt)
rm /app/data/crm.db
```

## Backup & Wiederherstellung

### Lokal
```bash
# Backup
cp data/crm.db backups/crm_backup_$(date +%Y%m%d_%H%M%S).db

# Wiederherstellung
cp backups/crm_backup_YYYYMMDD_HHMMSS.db data/crm.db
```

### Railway
- Railway bietet automatische Backups bei Database Add-ons
- Oder: Regelmäßig die DB manuell herunterladen über SSH

## Performance & Scaling

### Lokal
- SQLite ist ausreichend für kleine bis mittlere Datenmengen
- Für größere Datenbanken: Migriere zu PostgreSQL

### Railway
- Standard Container reicht für Teams bis ~100 Nutzer
- Bei mehr Nutzern: CPU/RAM upgraden oder zu PostgreSQL wechseln

## Sicherheit

- Ändere JWT_SECRET in der Production
- Nutze HTTPS (Railway macht das automatisch)
- Regelmäßige Backups machen
- Passwörter sind mit bcrypt gehashed (keine Plaintext!)
- Nur der angemeldete Nutzer kann auf seine Daten zugreifen

## Support & Dokumentation

- Next.js Docs: https://nextjs.org/docs
- Railway Docs: https://docs.railway.app
- SQLite Docs: https://www.sqlite.org/docs.html
