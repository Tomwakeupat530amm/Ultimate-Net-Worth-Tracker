import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from '@/utils/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
    // 1. Update the supabase session (syncs cookies)
    const { supabaseResponse } = await updateSession(request)

    // 2. Run the i18n middleware for localized routing
    // Redirects / to /en (as per routing.defaultLocale)
    return intlMiddleware(request)
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
}
