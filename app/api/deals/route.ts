import { NextRequest, NextResponse } from 'next/server'
import { getDeals, createDeal } from '@/lib/db'
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

    const deals = getDeals()
    return NextResponse.json(deals)
  } catch (error) {
    console.error('Get deals error:', error)
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

    const deal = createDeal({
      contact_id: data.contact_id ? parseInt(data.contact_id) : null,
      company_id: data.company_id ? parseInt(data.company_id) : null,
      title: data.title,
      stage: data.stage || 'lead',
      value: data.value ? parseFloat(data.value) : 0,
      notes: data.notes || '',
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Create deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
