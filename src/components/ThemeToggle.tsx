"use client"

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10 rounded-full" />
    }

    const isDark = theme === 'dark'

    return (
        <motion.button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden"
            whileHover={{ scale: 0.96 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: isDark ? 0 : 1,
                    opacity: isDark ? 0 : 1,
                    rotate: isDark ? -90 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center text-zinc-800"
            >
                <Sun size={18} strokeWidth={1.5} />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    scale: isDark ? 1 : 0,
                    opacity: isDark ? 1 : 0,
                    rotate: isDark ? 0 : 90,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center text-zinc-100"
            >
                <Moon size={18} strokeWidth={1.5} />
            </motion.div>
        </motion.button>
    )
}
