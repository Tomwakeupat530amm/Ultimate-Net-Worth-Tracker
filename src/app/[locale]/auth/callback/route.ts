import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default redirect to dashboard with locale
    const next = searchParams.get('next') ?? `/${locale}/dashboard`

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`)
}
