import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact } from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contacts = getContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const contact = createContact({
      company_id: data.company_id ? parseInt(data.company_id) : null,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || '',
      phone: data.phone || '',
      position: data.position || '',
      notes: data.notes || '',
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
