'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap auth pages with SessionProvider
  if (pathname?.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
} 