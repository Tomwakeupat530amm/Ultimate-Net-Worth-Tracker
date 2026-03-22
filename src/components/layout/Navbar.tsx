'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Navbar() {
    const router = useRouter()
    const pathname = usePathname()

    const isEn = pathname.startsWith('/en')

    const toggleLocale = () => {
        const newLocale = isEn ? 'vi' : 'en'
        let newPath = pathname
        if (pathname.startsWith('/en') || pathname.startsWith('/vi')) {
            newPath = pathname.replace(/^\/(en|vi)/, `/${newLocale}`)
        } else {
            newPath = `/${newLocale}${pathname}`
        }
        router.push(newPath)
    }

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="flex h-14 items-center justify-end border-b border-gray-200 bg-white dark:bg-[#050505] dark:border-white/10 px-4 gap-4 w-full">
            <ThemeToggle />

            <Button variant="outline" size="sm" onClick={toggleLocale} className="dark:bg-[#111111] dark:border-white/10 dark:text-gray-200 rounded-full px-4 font-mono">
                {isEn ? 'VI' : 'EN'}
            </Button>

            <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full px-4">
                Sign Out
            </Button>
        </header>
    )
}
