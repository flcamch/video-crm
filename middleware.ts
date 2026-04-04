import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = [
    '/login',
    '/setup',
    '/api/auth/login',
    '/api/auth/setup',
    '/api/auth/logout',
    '/api/seed',
    '/api/offers',
  ]

  const isPitchRoute = pathname.startsWith('/pitch/')
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPitchRoute || isPublicRoute) {
    return NextResponse.next()
  }

  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) {
    const token = request.cookies.get('crm_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = await verifyJWT(token)
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}
