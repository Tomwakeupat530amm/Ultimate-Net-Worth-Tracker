'use client'

import { motion } from 'framer-motion'

export function StaggerContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
                show: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { type: 'spring', stiffness: 100, damping: 20 }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
