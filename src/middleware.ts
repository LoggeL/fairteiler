import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedPaths = ['/gruppe/neu', '/dashboard']
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        if (isProtectedPath) {
          return !!token
        }
        
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/gruppe/neu', '/dashboard/:path*']
}
