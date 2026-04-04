import { NextRequest, NextResponse } from 'next/server'
import { getDeal, updateDeal, deleteDeal, getOfferByDealId } from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const deal = getDeal(id)

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const offer = getOfferByDealId(id)

    return NextResponse.json({ ...deal, offer })
  } catch (error) {
    console.error('Get deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const data = await request.json()

    const updated = updateDeal(id, {
      contact_id: data.contact_id ? parseInt(data.contact_id) : undefined,
      company_id: data.company_id ? parseInt(data.company_id) : undefined,
      title: data.title,
      stage: data.stage,
      value: data.value ? parseFloat(data.value) : undefined,
      notes: data.notes,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const offer = getOfferByDealId(id)
    return NextResponse.json({ ...updated, offer })
  } catch (error) {
    console.error('Update deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('crm_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const success = deleteDeal(id)

    if (!success) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
