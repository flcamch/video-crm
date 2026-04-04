import { NextRequest, NextResponse } from 'next/server'
import { createOffer } from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { randomUUID } from 'crypto'

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

    const offer = createOffer({
      deal_id: parseInt(data.deal_id),
      token: randomUUID(),
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      services: data.services || [],
      timeline_start: data.timeline_start || '',
      timeline_end: data.timeline_end || '',
      valid_until: data.valid_until || '',
      status: data.status || 'draft',
    })

    const pitchUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/pitch/${offer.token}`

    return NextResponse.json(
      { ...offer, pitch_url: pitchUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create offer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
