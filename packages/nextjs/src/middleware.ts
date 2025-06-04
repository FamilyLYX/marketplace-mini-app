import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to /api routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const apiKey = request.headers.get('x-api-key')
  const expectedApiKey = process.env.NEXT_PUBLIC_API_SECRET_KEY

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid API Key' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
} 