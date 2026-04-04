import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { User, Company, Contact, Deal, Offer, EmailTemplate, Service } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'crm.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    const dataDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeTables()
  }
  return db
}

function initializeTables() {
  const database = getDb()

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER,
      company_id INTEGER,
      title TEXT NOT NULL,
      stage TEXT DEFAULT 'lead',
      value REAL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      services TEXT NOT NULL,
      timeline_start TEXT,
      timeline_end TEXT,
      valid_until TEXT,
      status TEXT DEFAULT 'draft',
      viewed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
    CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
    CREATE INDEX IF NOT EXISTS idx_offers_deal ON offers(deal_id);
    CREATE INDEX IF NOT EXISTS idx_offers_token ON offers(token);
  `)
}

export function getUser(email: string): User | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email) as User | null
}

export function createUser(data: { name: string; email: string; password_hash: string; role?: string }): User {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare(
    'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  const result = stmt.run(data.name, data.email, data.password_hash, data.role || 'user', now)
  const id = result.lastInsertRowid as number
  return {
    id,
    name: data.name,
    email: data.email,
    password_hash: data.password_hash,
    role: data.role || 'user',
    created_at: now,
  }
}

export function countUsers(): number {
  const database = getDb()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM users')
  const result = stmt.get() as { count: number }
  return result.count
}

export function getContacts(): Contact[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT c.*, co.name as company_name
    FROM contacts c
    LEFT JOIN companies co ON c.company_id = co.id
    ORDER BY c.created_at DESC
  `)
  return stmt.all() as Contact[]
}

export function getContact(id: number): Contact | null {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT c.*, co.name as company_name
    FROM contacts c
    LEFT JOIN companies co ON c.company_id = co.id
    WHERE c.id = ?
  `)
  return stmt.get(id) as Contact | null
}

export function createContact(data: Omit<Contact, 'id' | 'created_at' | 'company_name'>): Contact {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare(
    'INSERT INTO contacts (company_id, first_name, last_name, email, phone, position, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.company_id,
    data.first_name,
    data.last_name,
    data.email,
    data.phone || null,
    data.position || null,
    data.notes || null,
    now
  )
  const id = result.lastInsertRowid as number
  return {
    id,
    company_id: data.company_id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    notes: data.notes,
    created_at: now,
  }
}

export function updateContact(id: number, data: Partial<Omit<Contact, 'id' | 'created_at' | 'company_name'>>): Contact | null {
  const database = getDb()
  const current = getContact(id)
  if (!current) return null

  const updates: string[] = []
  const values: unknown[] = []

  if (data.company_id !== undefined) {
    updates.push('company_id = ?')
    values.push(data.company_id)
  }
  if (data.first_name !== undefined) {
    updates.push('first_name = ?')
    values.push(data.first_name)
  }
  if (data.last_name !== undefined) {
    updates.push('last_name = ?')
    values.push(data.last_name)
  }
  if (data.email !== undefined) {
    updates.push('email = ?')
    values.push(data.email)
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?')
    values.push(data.phone)
  }
  if (data.position !== undefined) {
    updates.push('position = ?')
    values.push(data.position)
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?')
    values.push(data.notes)
  }

  if (updates.length === 0) return current

  values.push(id)
  const stmt = database.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getContact(id)
}

export function deleteContact(id: number): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM contacts WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getCompanies(): Company[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM companies ORDER BY created_at DESC')
  return stmt.all() as Company[]
}

export function getCompany(id: number): Company | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM companies WHERE id = ?')
  return stmt.get(id) as Company | null
}

export function createCompany(data: Omit<Company, 'id' | 'created_at'>): Company {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare(
    'INSERT INTO companies (name, industry, website, notes, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  const result = stmt.run(data.name, data.industry || null, data.website || null, data.notes || null, now)
  const id = result.lastInsertRowid as number
  return {
    id,
    name: data.name,
    industry: data.industry,
    website: data.website,
    notes: data.notes,
    created_at: now,
  }
}

export function updateCompany(id: number, data: Partial<Omit<Company, 'id' | 'created_at'>>): Company | null {
  const database = getDb()
  const current = getCompany(id)
  if (!current) return null

  const updates: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.industry !== undefined) {
    updates.push('industry = ?')
    values.push(data.industry)
  }
  if (data.website !== undefined) {
    updates.push('website = ?')
    values.push(data.website)
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?')
    values.push(data.notes)
  }

  if (updates.length === 0) return current

  values.push(id)
  const stmt = database.prepare(`UPDATE companies SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getCompany(id)
}

export function deleteCompany(id: number): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM companies WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getDeals(): Deal[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT d.*, c.first_name, c.last_name, co.name as company_name,
           CONCAT(c.first_name, ' ', c.last_name) as contact_name
    FROM deals d
    LEFT JOIN contacts c ON d.contact_id = c.id
    LEFT JOIN companies co ON d.company_id = co.id
    ORDER BY d.created_at DESC
  `)
  return stmt.all() as Deal[]
}

export function getDeal(id: number): Deal | null {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT d.*, c.first_name, c.last_name, co.name as company_name,
           CONCAT(c.first_name, ' ', c.last_name) as contact_name
    FROM deals d
    LEFT JOIN contacts c ON d.contact_id = c.id
    LEFT JOIN companies co ON d.company_id = co.id
    WHERE d.id = ?
  `)
  return stmt.get(id) as Deal | null
}

export function createDeal(data: Omit<Deal, 'id' | 'created_at' | 'contact_name' | 'company_name'>): Deal {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare(
    'INSERT INTO deals (contact_id, company_id, title, stage, value, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.contact_id,
    data.company_id,
    data.title,
    data.stage || 'lead',
    data.value || 0,
    data.notes || null,
    now
  )
  const id = result.lastInsertRowid as number
  return {
    id,
    contact_id: data.contact_id,
    company_id: data.company_id,
    title: data.title,
    stage: data.stage || 'lead',
    value: data.value || 0,
    notes: data.notes,
    created_at: now,
  }
}

export function updateDeal(id: number, data: Partial<Omit<Deal, 'id' | 'created_at' | 'contact_name' | 'company_name'>>): Deal | null {
  const database = getDb()
  const current = getDeal(id)
  if (!current) return null

  const updates: string[] = []
  const values: unknown[] = []

  if (data.contact_id !== undefined) {
    updates.push('contact_id = ?')
    values.push(data.contact_id)
  }
  if (data.company_id !== undefined) {
    updates.push('company_id = ?')
    values.push(data.company_id)
  }
  if (data.title !== undefined) {
    updates.push('title = ?')
    values.push(data.title)
  }
  if (data.stage !== undefined) {
    updates.push('stage = ?')
    values.push(data.stage)
  }
  if (data.value !== undefined) {
    updates.push('value = ?')
    values.push(data.value)
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?')
    values.push(data.notes)
  }

  if (updates.length === 0) return current

  values.push(id)
  const stmt = database.prepare(`UPDATE deals SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getDeal(id)
}

export function deleteDeal(id: number): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM deals WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getOffer(token: string): Offer | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM offers WHERE token = ?')
  const result = stmt.get(token) as any
  if (!result) return null
  return {
    ...result,
    services: JSON.parse(result.services || '[]'),
  }
}

export function getOfferByDealId(dealId: number): Offer | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM offers WHERE deal_id = ?')
  const result = stmt.get(dealId) as any
  if (!result) return null
  return {
    ...result,
    services: JSON.parse(result.services || '[]'),
  }
}

export function createOffer(data: Omit<Offer, 'id' | 'created_at'>): Offer {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare(
    'INSERT INTO offers (deal_id, token, title, subtitle, description, services, timeline_start, timeline_end, valid_until, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.deal_id,
    data.token,
    data.title,
    data.subtitle || '',
    data.description || '',
    JSON.stringify(data.services || []),
    data.timeline_start || null,
    data.timeline_end || null,
    data.valid_until || null,
    data.status || 'draft',
    now
  )
  const id = result.lastInsertRowid as number
  return {
    id,
    deal_id: data.deal_id,
    token: data.token,
    title: data.title,
    subtitle: data.subtitle || '',
    description: data.description || '',
    services: data.services || [],
    timeline_start: data.timeline_start || '',
    timeline_end: data.timeline_end || '',
    valid_until: data.valid_until || '',
    status: data.status || 'draft',
    created_at: now,
  }
}

export function updateOffer(id: number, data: Partial<Omit<Offer, 'id' | 'created_at' | 'token' | 'deal_id'>>): Offer | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM offers WHERE id = ?')
  const current = stmt.get(id) as any
  if (!current) return null

  const updates: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) {
    updates.push('title = ?')
    values.push(data.title)
  }
  if (data.subtitle !== undefined) {
    updates.push('subtitle = ?')
    values.push(data.subtitle)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description)
  }
  if (data.services !== undefined) {
    updates.push('services = ?')
    values.push(JSON.stringify(data.services))
  }
  if (data.timeline_start !== undefined) {
    updates.push('timeline_start = ?')
    values.push(data.timeline_start)
  }
  if (data.timeline_end !== undefined) {
    updates.push('timeline_end = ?')
    values.push(data.timeline_end)
  }
  if (data.valid_until !== undefined) {
    updates.push('valid_until = ?')
    values.push(data.valid_until)
  }
  if (data.status !== undefined) {
    updates.push('status = ?')
    values.push(data.status)
  }
  if (data.viewed_at !== undefined) {
    updates.push('viewed_at = ?')
    values.push(data.viewed_at)
  }

  if (updates.length === 0) return null

  values.push(id)
  const updateStmt = database.prepare(`UPDATE offers SET ${updates.join(', ')} WHERE id = ?`)
  updateStmt.run(...values)

  const getStmt = database.prepare('SELECT * FROM offers WHERE id = ?')
  const result = getStmt.get(id) as any
  return {
    ...result,
    services: JSON.parse(result.services || '[]'),
  }
}

export function getEmailTemplates(): EmailTemplate[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM email_templates ORDER BY created_at DESC')
  return stmt.all() as EmailTemplate[]
}

export function getEmailTemplate(id: number): EmailTemplate | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM email_templates WHERE id = ?')
  return stmt.get(id) as EmailTemplate | null
}

export function createEmailTemplate(data: Omit<EmailTemplate, 'id' | 'created_at'>): EmailTemplate {
  const database = getDb()
  const now = new Date().toISOString()
  const stmt = database.prepare('INSERT INTO email_templates (name, subject, body, created_at) VALUES (?, ?, ?, ?)')
  const result = stmt.run(data.name, data.subject, data.body, now)
  const id = result.lastInsertRowid as number
  return {
    id,
    name: data.name,
    subject: data.subject,
    body: data.body,
    created_at: now,
  }
}

export function updateEmailTemplate(id: number, data: Partial<Omit<EmailTemplate, 'id' | 'created_at'>>): EmailTemplate | null {
  const database = getDb()
  const current = getEmailTemplate(id)
  if (!current) return null

  const updates: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.subject !== undefined) {
    updates.push('subject = ?')
    values.push(data.subject)
  }
  if (data.body !== undefined) {
    updates.push('body = ?')
    values.push(data.body)
  }

  if (updates.length === 0) return current

  values.push(id)
  const stmt = database.prepare(`UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getEmailTemplate(id)
}

export function deleteEmailTemplate(id: number): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM email_templates WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}
