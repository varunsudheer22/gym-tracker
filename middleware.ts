import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
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
    '/log-workout',
    '/progress',
    '/exercises',
    '/workout-days',
    '/records',
    '/metrics',
    '/goals',
    '/templates',
    '/api/workout-days/:path*',
    '/api/exercises/:path*',
    '/api/records/:path*',
    '/api/metrics/:path*',
    '/api/goals/:path*',
    '/api/templates/:path*',
  ],
}; 