import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zelixa_token')?.value;
  const { pathname } = request.nextUrl;

  // Define system/public resource paths
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.') ||
    pathname.includes('webpack-hmr')
  ) {
    return NextResponse.next();
  }

  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPath = pathname.startsWith('/admin');
  
  // If user navigates to /admin on web portal, redirect to Admin app or home
  if (isAdminPath) {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001/admin';
    return NextResponse.redirect(new URL(adminUrl));
  }

  // Define storefront protected routes (transaksi dan akun pribadi yang wajib login)
  const isProtectedPath = 
    pathname.startsWith('/checkout') || 
    pathname.startsWith('/orders') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/addresses') || 
    pathname.startsWith('/payment') ||
    pathname.startsWith('/vouchers');

  // Handle Storefront Protected Routes
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle Auth Path Protection (Logged in users shouldn't see login/register)
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
