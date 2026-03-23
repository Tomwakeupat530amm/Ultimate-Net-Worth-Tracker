'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { StellarLoader } from '../ui/StellarLoader'
import { useUIStore } from '@/store/uiStore'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { setIsNavigating } = useUIStore()

    // Clear loading state on route change
    useEffect(() => {
        setIsNavigating(false)
    }, [pathname, setIsNavigating])

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
            <StellarLoader />

            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/50 dark:bg-zinc-950">
                    {children}
                </main>
            </div>
        </div>
    )
}
