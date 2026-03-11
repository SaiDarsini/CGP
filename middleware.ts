import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)
  
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/sign-up', '/auth/sign-up-success', '/auth/error', '/track']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/track'))
  
  if (isPublicRoute) {
    return response
  }
  
  // Check if user is authenticated for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Read-only in middleware
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect to login if not authenticated
  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // Role-based access control
  if (user && pathname.startsWith('/dashboard')) {
    const role = user.user_metadata?.role || 'citizen'
    
    // Check if user is trying to access a role-specific dashboard they shouldn't
    if (pathname.startsWith('/dashboard/officer') && role !== 'officer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
