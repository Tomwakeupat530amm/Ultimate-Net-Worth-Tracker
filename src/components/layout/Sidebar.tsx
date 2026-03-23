'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Settings, ChevronLeft, ChevronRight, DollarSign, PieChart, ArrowRightLeft, HelpCircle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

import { cn } from '@/lib/utils'

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { setIsNavigating } = useUIStore()

    useEffect(() => { setMounted(true) }, [])

    const tDash = useTranslations('Dashboard')
    const tNW = useTranslations('NetWorth')
    const tCont = useTranslations('Contributions')
    const tSet = useTranslations('Settings')
    const tGuide = useTranslations('Guide')

    const navItems = [
        { name: tDash('title'), href: '/dashboard', icon: PieChart },
        { name: tNW('title'), href: '/net-worth', icon: DollarSign },
        { name: tCont('title'), href: '/contributions', icon: ArrowRightLeft },
        { name: tSet('title'), href: '/settings', icon: Settings },
        { name: tGuide('title'), href: '/help', icon: HelpCircle },
    ]

    const isActive = (href: string) => pathname.includes(href)

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // Find if target is same as current (ignoring locale prefix)
        const purePathname = pathname.replace(/^\/(en|vi)/, '') || '/dashboard'
        if (purePathname === href) return

        setIsNavigating(true)
    }

    if (!mounted) return null // block hydration mismatch

    return (
        <div className={cn(
            "flex flex-col border-r bg-white dark:bg-zinc-950 transition-all duration-300 relative z-20",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-14 items-center justify-between border-b px-4 border-gray-200 dark:border-zinc-800">
                {!isCollapsed && <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden">Tracker</span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-50 transition-colors shrink-0"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                onClick={(e) => handleNav(e, item.href)}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(item.href)
                                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-gray-50"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-900 dark:hover:text-gray-50",
                                    isCollapsed ? "justify-center px-0 gap-0" : "gap-3"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon size={20} className="shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
