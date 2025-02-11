import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // If there's no token, redirect to sign in
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true if the token exists
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Protect specific routes that require authentication
export const config = {
  matcher: [
    // App routes that require auth
    '/log-workout',
    '/progress',
    '/exercises',
    '/workout-days',
    '/records',
    '/metrics',
    '/goals',
    '/templates',
    '/history',
    
    // API routes that require auth
    '/api/workout-days/:path*',
    '/api/exercises/:path*',
    '/api/records/:path*',
    '/api/metrics/:path*',
    '/api/goals/:path*',
    '/api/templates/:path*',
    '/api/workouts/:path*',
    '/api/achievements/:path*',
  ],
}; 