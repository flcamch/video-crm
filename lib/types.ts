export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: string
  created_at: string
}

export interface Company {
  id: number
  name: string
  industry?: string
  website?: string
  notes?: string
  created_at: string
}

export interface Contact {
  id: number
  company_id: number | null
  first_name: string
  last_name: string
  email: string
  phone?: string
  position?: string
  notes?: string
  created_at: string
  company_name?: string
}

export interface Service {
  name: string
  price: number
}

export interface Deal {
  id: number
  contact_id: number | null
  company_id: number | null
  title: string
  stage: string
  value: number
  notes?: string
  created_at: string
  contact_name?: string
  company_name?: string
}

export interface Offer {
  id: number
  deal_id: number
  token: string
  title: string
  subtitle: string
  description: string
  services: Service[]
  timeline_start: string
  timeline_end: string
  valid_until: string
  status: string
  viewed_at?: string
  created_at: string
}

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  body: string
  created_at: string
}

export interface JWTPayload {
  id: number
  email: string
  name: string
  [key: string]: unknown
}

export interface Activity {
  id: number
  contact_id?: number
  deal_id?: number
  type: 'call' | 'email' | 'meeting' | 'note'
  title: string
  note?: string
  created_at: string
}
