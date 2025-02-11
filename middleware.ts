import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
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

export const config = {
  matcher: [
    '/log-workout',
    '/progress',
    '/exercises',
    '/workout-days',
    '/records',
    '/api/workout-days/:path*',
    '/api/exercises/:path*',
    '/api/records/:path*',
    '/api/metrics/:path*',
  ],
}; 