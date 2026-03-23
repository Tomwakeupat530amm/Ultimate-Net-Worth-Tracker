'use client'

import { motion } from 'framer-motion'
import React from 'react'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20
        } as any
    }
}

export function SettingsStaggeredWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={item}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}
