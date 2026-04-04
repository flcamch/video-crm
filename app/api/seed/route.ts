import { NextRequest, NextResponse } from 'next/server'
import { countUsers, createUser } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userCount = countUsers()

    if (userCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Admin user already exists' },
        { status: 200 }
      )
    }

    const passwordHash = await hashPassword('admin123')

    createUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: passwordHash,
      role: 'admin',
    })

    return NextResponse.json(
      { success: true, message: 'Admin created', email: 'admin@example.com', password: 'admin123' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
