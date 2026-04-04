import { NextRequest, NextResponse } from 'next/server'
import { getOffer, updateOffer } from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const offer = getOffer(params.token)

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Get offer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
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

    const offer = getOffer(params.token)
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const data = await request.json()

    const updated = updateOffer(offer.id, {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      services: data.services,
      timeline_start: data.timeline_start,
      timeline_end: data.timeline_end,
      valid_until: data.valid_until,
      status: data.status,
      viewed_at: data.viewed_at,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update offer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
